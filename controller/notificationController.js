import { zpNotificationsModel } from '../models/notification.js';
import mongoose from 'mongoose';
import { zpUsersModel } from '../models/users.js';

async function getNotificationByUserId(userId, page) {
    try {
        const limit = 5;
        const offset = (page - 1) * limit;

        let notifications = await zpNotificationsModel.find({
            user_id: userId
        }).sort({ create_at: -1 }).skip(offset).limit(limit);;

        const promises = notifications.map(async (notis) => {
            const userData = await zpUsersModel.findOne({
                attributes: ['id', 'name', 'avatar', 'code_user', 'provider'],
                where: {
                    id: notis.user_id_actor
                }
            })
            return {
                ...notis.toJSON(),
                userData
            };
        });
        const results = await Promise.all(promises);

        return { status: "success", results };
    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }
}
async function readNotification(notiId) {
    try {
        const result = await zpNotificationsModel.updateOne(
            { _id: notiId },
            { $set: { read: true } }
        );
        return { status: "success" };
    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }
}
async function getCountNoti(userId) {
    try {
        const countNoti = await zpNotificationsModel.count(
            {
                user_id: userId,
                read: false
            }
        );
        return { countNoti };
    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }
}

export {
    getCountNoti,
    getNotificationByUserId,
    readNotification,
}
