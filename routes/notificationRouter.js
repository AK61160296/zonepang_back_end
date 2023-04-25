
const notificationRouter = express.Router();
import { getNotificationByUserId } from '../controller/notificationController.js';
import path from 'path'
import express from 'express';

notificationRouter.get('/getNotificationByUserId', async function (req, res) {
    try {
        const page = req.query.page
        const userId = req.query.user_id
        const notifications = await getNotificationByUserId(userId, page);
        res.json(notifications);
    } catch (error) {
        console.log(error)
    }
});



export { notificationRouter };