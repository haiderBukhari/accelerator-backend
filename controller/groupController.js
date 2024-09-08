import { groups } from "../models/groupModel.js";
import { bucket } from "../routes/groupRoutes.js";

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