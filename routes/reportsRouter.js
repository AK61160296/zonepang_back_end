
const reportsRouter = express.Router();
import { createReport, getRepostList } from '../controller/index.js';
import path from 'path'
import express from 'express';
import multer from "multer";
import AWS from 'aws-sdk'
import multerS3 from 'multer-s3'


reportsRouter.post('/createReport', async function (req, res) {
    try {
        const { user_id, post_id, comment_id, report_type, report_list_id } = req.body
        const report = await createReport(user_id, post_id, comment_id, report_type, report_list_id);
        res.json(report);
    } catch (error) {
        console.log(error)
    }
});
reportsRouter.get('/reportList', async function (req, res) {
    try {
        const reportList = await getRepostList();
        res.json(reportList);
    } catch (error) {
        console.log(error)
    }
});


export { reportsRouter };