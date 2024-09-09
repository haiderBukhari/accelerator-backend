import express from 'express';
import { NotificationsModel } from '../models/notificationModel.js';

const NotificationRoutes = express.Router();

NotificationRoutes.get('/', async (req, res) => {
    try {
        const notifications = await NotificationsModel.find({ userId: req.id });
        let count = 0;
        notifications.forEach(async (notification) => {
            if(notification.status === "unread"){
                count++;
                notification.status = "read";
                await notification.save();
            }
        });

        res.status(200).json({
            unreadNotifications: count,
            notifications: notifications
        });
    } catch (err) {
        res.status(500).send(err);
    }
});

export default NotificationRoutes;
