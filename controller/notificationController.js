import { zpNotificationsModel } from '../models/notification.js';
import mongoose from 'mongoose';

async function getNotificationByUserId(userId) {
    try {
        const notifications = await zpNotificationsModel.find({});

        console.log("555",notifications);
        return { status: "success", notifications };
    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }
}

export {
    getNotificationByUserId,
}
