import { groups } from "../models/groupModel.js";

export const createGroup = (req, res) => {
    const { name, contactNumber, email, talksAbout, description } = req.body;
    const newGroup = new groups({
        name,
        contactNumber,
        email,
        talksAbout,
        description
    });
    newGroup.save()
    .then(() => res.status(200).json({message: 'Group created successfully'}))
    .catch((err) => res.status(500).json({message: 'Failed to create group', error: err}))
}

export const getGroups = (req, res) => {
    groups.find()
    .then((data) => res.status(200).json({message: 'Groups fetched successfully', data}))
    .catch((err) => res.status(500).json({message: 'Failed to fetch groups', error: err}))
}

export const getSpecificGroup = (req, res) => {
    const { id } = req.params;
    groups.findById(id)
    .then((data) => res.status(200).json({message: 'Group fetched successfully', data}))
    .catch((err) => res.status(500).json({message: 'Failed to fetch group', error: err}))
}