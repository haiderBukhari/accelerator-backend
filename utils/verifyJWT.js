import jwt from 'jsonwebtoken'
import { AuthenticationModel } from '../models/AuthenticationModel.js';

export const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    
    jwt.verify(token, process.env.COOKIE_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        req.id = decoded.id;
        next();
    });
};

export const verifyAdmin = async(req, res, next) => {
    const id = req.id;
    const adminRole = await AuthenticationModel.findById(id);
    if (!adminRole.isAdmin) {
        return res.status(403).json({ message: 'You are not authorized to perform this action.' });
    }
    next();
}