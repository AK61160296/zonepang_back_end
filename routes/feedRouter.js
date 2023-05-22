
const feedRouter = express.Router();
import { seachHistory, deleteSeachHistory, addSeachHistory } from '../controller/index.js';
import path from 'path'
import express from 'express';
import multer from "multer";
import AWS from 'aws-sdk'
import multerS3 from 'multer-s3'


feedRouter.post('/searchHistory', async function (req, res) {
    try {
        const { userId } = req.body;
        const historyData = await seachHistory(userId);
        res.json(historyData);
    } catch (error) {
        console.log(error)
    }
});
feedRouter.post('/deleteSeachHistory', async function (req, res) {
    try {
        const { history_id } = req.body;
        const status = await deleteSeachHistory(history_id);
        res.json(status);
    } catch (error) {
        console.log(error)
    }
});
feedRouter.post('/addSeachHistory', async function (req, res) {
    try {
        const { user_id, user_search_id, group_search_id, file_name, type, name, code_user } = req.body;
        const historyData = await addSeachHistory(user_id, name, user_search_id, group_search_id, file_name, type, code_user);
        res.json(historyData);
    } catch (error) {
        console.log(error)
    }
});

export { feedRouter };