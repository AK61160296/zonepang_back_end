
const notificationRouter = express.Router();
import { getNotificationByUserId, readNotification, getCountNoti } from '../controller/notificationController.js';
import path from 'path'
import express from 'express';

notificationRouter.post('/getNotification', async function (req, res) {
    try {
        const page = req.body.page
        const userId = req.body.user_id
        const notifications = await getNotificationByUserId(userId, page);
        res.json(notifications);
    } catch (error) {
        console.log(error)
    }
});
notificationRouter.post('/readNotification', async function (req, res) {
    try {
        const noti_id = req.body.noti_id
        const notifications = await readNotification(noti_id);
        res.json(notifications);
    } catch (error) {
        console.log(error)
    }
});
notificationRouter.post('/getCountNoti', async function (req, res) {
    try {
        const user_id = req.body.user_id
        const notifications = await getCountNoti(user_id);
        res.json(notifications);
    } catch (error) {
        console.log(error)
    }
});



export { notificationRouter };