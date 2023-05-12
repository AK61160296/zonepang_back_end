
const shortRouter = express.Router();
import { getAppFree, pinAppFree, sortPinAppFree, shortUrl } from '../controller/appFreeContrller.js';
import path from 'path'
import express from 'express';
import multer from "multer";
import AWS from 'aws-sdk'
import multerS3 from 'multer-s3'
import { zpShortUrlModel } from '../models/index.js';

shortRouter.get('/shortUrl/:shortCode', async function (req, res) {
    try {
        const shortUrl = req.params.shortCode;

        // ค้นหา URL เดิมจากฐานข้อมูลโดยใช้ shortUrl เป็นเงื่อนไขในการค้นหา
        const originalUrl = await zpShortUrlModel.findOne({ shortUrl: shortUrl }, 'originalUrl');
        if (originalUrl) {
            // แสดง URL เดิมหรือเปลี่ยนเส้นทางไปยัง URL เดิม
            res.redirect(originalUrl.originalUrl);
        } else {
            // แสดงข้อความว่าไม่พบ URL เดิม
            res.status(404).send('URL not found');
        }
    } catch (error) {
        console.log(error)
    }
});


export { shortRouter };