import mongoose from "mongoose";
import { groups } from "../models/groupModel.js";
import { groupsFolders } from "../models/GroupsFolders.js";
import { bucket } from "../routes/groupRoutes.js";
import { groupsFoldersImages } from "../models/GroupFolderImagesModel.js";

export const createGroup = (req, res) => {
    try {
        const { name, contactNumber, email, talksAbout, description } = req.body;
        if (!req.file) {
            res.status(400).send('No file uploaded.');
            return;
        }

        const file = req.file;
        const fileName = `${Date.now()}_${file.originalname}`;
        const fileUpload = bucket.file(fileName);

        const stream = fileUpload.createWriteStream({
            metadata: {
                contentType: file.mimetype,
            },
        });

        stream.on('error', err => {
            console.error('Error uploading to GCS:', err);
            res.status(500).send('Error uploading file.');
        });

        stream.on('finish', async () => {
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
            const newGroup = new groups({
                name,
                contactNumber,
                email,
                talksAbout,
                description,
                groupImage: publicUrl,
            });
            newGroup.save()
                .then(() => res.status(200).json({ message: 'Group created successfully' }))
                .catch((err) => res.status(500).json({ message: 'Failed to create group', error: err }))
        });

        stream.end(file.buffer); // Write file buffer to stream
    } catch (err) {
        console.log(err.message)
        res.status(400).json({ message: 'Failed to create group', error: err })
    }
}

export const getGroups = (req, res) => {
    groups.find()
        .then((data) => res.status(200).json({ message: 'Groups fetched successfully', data: data }))
        .catch((err) => res.status(500).json({ message: 'Failed to fetch groups', error: err }))
}

export const getSpecificGroup = (req, res) => {
    const { id } = req.params;
    groups.findById(id)
        .then((data) => res.status(200).json({ message: 'Group fetched successfully', details: data }))
        .catch((err) => res.status(500).json({ message: 'Failed to fetch group', error: err }))
}

export const joinGroup = async (req, res) => {
    try {
        const groupId = req.body.id; // Assuming group ID is passed as a route parameter
        const userId = req.id; // Assuming user ID is available from token/session

        // Find the group by ID
        const group = await groups.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        // Check if the user is already in joinedUsers or pendingUsers
        const alreadyJoined = group.joinedUsers.includes(userId);
        const alreadyPending = group.pendingUsers.includes(userId);

        if (alreadyJoined) {
            // If the user is already in joinedUsers, remove them (leave group)
            group.joinedUsers = group.joinedUsers.filter(id => id.toString() !== userId);
            await group.save();
            return res.status(200).json({
                message: "User has left the group.",
                group,
            });
        }

        if (alreadyPending) {
            // If the user is already in pendingUsers, remove them from pending (cancel request)
            group.pendingUsers = group.pendingUsers.filter(id => id.toString() !== userId);
            await group.save();
            return res.status(200).json({
                message: "User has canceled the join request for the private group.",
                group,
            });
        }

        // Check if the group is private
        if (group.isPrivate) {
            // Private group, add to pendingUsers
            group.pendingUsers.push(userId);
            await group.save();
            return res.status(200).json({
                message: "Request to join the private group is pending approval.",
                group: group,
            });
        } else {
            // Public group, add to joinedUsers
            group.joinedUsers.push(userId);
            await group.save();
            return res.status(200).json({
                message: "Successfully joined the group.",
                group: group,
            });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const createFolder = (req, res) => {
    try {
        const { name, groupId } = req.body;
        if (!req.file) {
            res.status(400).send('No file uploaded.');
            return;
        }

        const file = req.file;
        const fileName = `${Date.now()}_${file.originalname}`;
        const fileUpload = bucket.file(fileName);

        const stream = fileUpload.createWriteStream({
            metadata: {
                contentType: file.mimetype,
            },
        });

        stream.on('error', err => {
            console.error('Error uploading to GCS:', err);
            res.status(500).send('Error uploading file.');
        });

        stream.on('finish', async () => {
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
            const groupF = new groupsFolders({
                name: name,
                folderImage: publicUrl,
                group: groupId,
            });
            groupF.save()
                .then(() => res.status(200).json({ message: 'Group Folder created successfully' }))
                .catch((err) => res.status(500).json({ message: 'Failed to create group Folder', error: err }))
        });

        stream.end(file.buffer); // Write file buffer to stream
    } catch (err) {
        console.log(err.message)
        res.status(400).json({ message: 'Failed to create group Folder', error: err })
    }
}


export const getGroupFolders = async (req, res) => {
    try {
        const { groupId } = req.query;

        // Validate groupId
        if (!groupId) {
            return res.status(400).json({ message: 'groupId is required' });
        }

        // Check if groupId is a valid MongoDB ObjectId
        if (!mongoose.isValidObjectId(groupId)) {
            return res.status(400).json({ message: 'Invalid groupId' });
        }

        // Find folders associated with the group
        const folders = await groupsFolders.find({ group: groupId });

        if (!folders || folders.length === 0) {
            return res.status(404).json({ message: 'No folders found for this group' });
        }

        // Return the folders
        return res.status(200).json({
            message: 'Folders retrieved successfully',
            folders: folders
        });

    } catch (err) {
        console.log(err.message);
        return res.status(500).json({ message: 'Failed to retrieve folders', error: err });
    }
};



export const createFolderImage = (req, res) => {
    try {
        const { folderId } = req.body;
        if (!req.file) {
            res.status(400).send('No file uploaded.');
            return;
        }

        const file = req.file;
        const fileName = `${Date.now()}_${file.originalname}`;
        const fileUpload = bucket.file(fileName);

        const stream = fileUpload.createWriteStream({
            metadata: {
                contentType: file.mimetype,
            },
        });

        stream.on('error', err => {
            console.error('Error uploading to GCS:', err);
            res.status(500).send('Error uploading file.');
        });

        stream.on('finish', async () => {
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
            const groupF = new groupsFoldersImages({
                image: publicUrl,
                folderId: folderId,
            });
            groupF.save()
                .then(() => res.status(200).json({ message: 'Group Folder Image created successfully' }))
                .catch((err) => {
                    res.status(500).json({ message: 'Failed to create group Folder Image', error: err })
                }
            )
        });

        stream.end(file.buffer); // Write file buffer to stream
    } catch (err) {
        res.status(400).json({ message: 'Failed to create group Folder', error: err })
    }
}


export const getGroupFoldersImages = async (req, res) => {
    try {
        const { folderId } = req.query;

        // Validate groupId
        if (!folderId) {
            return res.status(400).json({ message: 'folderId is required' });
        }

        // Check if groupId is a valid MongoDB ObjectId
        if (!mongoose.isValidObjectId(folderId)) {
            return res.status(400).json({ message: 'Invalid folderId' });
        }

        // Find folders associated with the group
        const folders = await groupsFoldersImages.find({ folderId: folderId });

        if (!folders || folders.length === 0) {
            return res.status(404).json({ message: 'No Images found for this group' });
        }

        // Return the folders
        return res.status(200).json({
            message: 'Folders retrieved successfully',
            folders: folders
        });

    } catch (err) {
        console.log(err.message);
        return res.status(500).json({ message: 'Failed to retrieve folders', error: err });
    }
};


export const getGroupUsers = async (req, res) => {
    try {
        const { groupId } = req.query;
        // Validate groupId
        if (!groupId) {
            return res.status(400).json({ message: 'groupId is required' });
        }

        // Check if groupId is a valid MongoDB ObjectId
        if (!mongoose.isValidObjectId(groupId)) {
            return res.status(400).json({ message: 'Invalid groupId' });
        }

        // Aggregation to retrieve the joinedUsers and pendingUsers with their details
        const groupUsers = await groups.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(groupId) } },
            {
                $facet: {
                    joinedUsers: [
                        { $unwind: "$joinedUsers" },
                        {
                            $lookup: {
                                from: 'authentications', // The AuthenticationModel collection
                                localField: 'joinedUsers',
                                foreignField: '_id',
                                as: 'userDetails'
                            }
                        },
                        { $unwind: "$userDetails" },
                        {
                            $project: {
                                _id: "$userDetails._id",
                                name: { $concat: ["$userDetails.firstName", " ", "$userDetails.lastName"] },
                                profilePicture: "$userDetails.profilePicture"
                            }
                        }
                    ],
                    pendingUsers: [
                        { $unwind: "$pendingUsers" },
                        {
                            $lookup: {
                                from: 'authentications', // The AuthenticationModel collection
                                localField: 'pendingUsers',
                                foreignField: '_id',
                                as: 'userDetails'
                            }
                        },
                        { $unwind: "$userDetails" },
                        {
                            $project: {
                                _id: "$userDetails._id",
                                name: { $concat: ["$userDetails.firstName", " ", "$userDetails.lastName"] },
                                profilePicture: "$userDetails.profilePicture"
                            }
                        }
                    ]
                }
            }
        ]);

        // If no group found
        if (!groupUsers || groupUsers.length === 0) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Return the result with joinedUsers and pendingUsers
        return res.status(200).json({
            message: 'Group users retrieved successfully',
            joinedUsers: groupUsers[0].joinedUsers,
            pendingUsers: groupUsers[0].pendingUsers
        });

    } catch (err) {
        console.error(err.message);
        return res.status(500).json({ message: 'Failed to retrieve group users', error: err });
    }
};


export const getJoinedGroupDetails = async (req, res) => {
    try {
        const userId = req.id;  // Assuming user ID is passed in req.id
        
        // Query to find groups where the user is in the joinedUsers array
        const joinedGroups = await groups.find(
            { joinedUsers: userId },
            'name talksAbout groupImage'  // Specify the fields to return
        );

        if (!joinedGroups.length) {
            return res.status(404).json({ message: 'No joined groups found.' });
        }

        res.status(200).json(joinedGroups);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error retrieving group details.', error: err.message });
    }
};
