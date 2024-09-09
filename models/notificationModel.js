import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Authentication'
    },
    message: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: 'unread'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

export const NotificationsModel = mongoose.model('Notifications', notificationSchema)