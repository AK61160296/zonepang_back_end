
const appFreeRouter = express.Router();
import { getAppFree, pinAppFree, sortPinAppFree, shortUrl } from '../controller/appFreeContrller.js';
import path from 'path'
import express from 'express';
import multer from "multer";
import AWS from 'aws-sdk'
import multerS3 from 'multer-s3'


appFreeRouter.post('/getAppFree', async function (req, res) {
    try {
        const { user_id } = req.body
        const response = await getAppFree(user_id);
        res.json(response);
    } catch (error) {
        console.log(error)
    }
});
appFreeRouter.post('/pinAppFree', async function (req, res) {
    try {
        const { user_id, app_free_id, type } = req.body;
        const status = await pinAppFree(user_id, app_free_id, type);
        res.json(status);
    } catch (error) {
        console.log(error)
    }
});
appFreeRouter.put('/sortPinAppFree/:id', async function (req, res) {
    try {

        const { newItems } = req.body;
        const status = await sortPinAppFree(newItems);
        res.json(newItems);
    } catch (error) {
        console.log(error)
    }
});
appFreeRouter.post('/shortUrl', async function (req, res) {
    try {

        const { original_url } = req.body;
        const newUrl = await shortUrl(original_url);
        res.json(newUrl);
    } catch (error) {
        console.log(error)
    }
});


export { appFreeRouter };