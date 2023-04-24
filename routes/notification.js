
const notificationRouter = express.Router();
import { getNotificationByUserId } from '../controller/notificationController.js';
import path from 'path'
import express from 'express';
import multer from "multer";
import AWS from 'aws-sdk'
import multerS3 from 'multer-s3'

// notificationRouter.get('/getNotificationByUserId', async function (req, res) {
//     try {
//         const page = req.query.page
//         const userId = req.query.user_id
//         const notification = await getNotificationByUserId(page,userId);
//         res.json(notification);
//     } catch (error) {
//         console.log(error)
//     }
// });

notificationRouter.get('/getNotificationByUserId', async function (req, res) {
    try {
        const page = req.query.page
        const userId = req.query.user_id
        const notifications = await getNotificationByUserId();
        res.json(notifications);
    } catch (error) {
        console.log(error)
    }
});



export { notificationRouter };