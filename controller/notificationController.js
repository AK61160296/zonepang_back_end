import { zpNotificationsModel } from '../models/notification.js';
import mongoose from 'mongoose';
import { zpUsersModel } from '../models/users.js';

async function getNotificationByUserId(userId, page) {
    try {
        const limit = 3;
        const offset = (page - 1) * limit;

        let notifications = await zpNotificationsModel.find({
            user_id: userId
        }).sort({ create_at: -1 }).skip(offset).limit(limit);;

        const promises = notifications.map(async (notis) => {
            const userDAta = await zpUsersModel.findOne({
                attributes: ['id', 'name', 'avatar', 'code_user', 'provider'],
                where: {
                    id: notis.user_id_actor
                }
            })
            return {
                ...notis.toJSON(),
                userDAta
            };
        });
        const results = await Promise.all(promises);

        return { status: "success", results };
    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }
}
async function readNotification() {
    try {
        return { status: "success" };
    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }
}

export {
    getNotificationByUserId,
}
