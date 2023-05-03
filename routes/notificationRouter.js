
const notificationRouter = express.Router();
import { getNotificationByUserId, readNotification } from '../controller/notificationController.js';
import path from 'path'
import express from 'express';

notificationRouter.get('/getNotification', async function (req, res) {
    try {
        const page = req.query.page
        const userId = req.query.user_id
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



export { notificationRouter };