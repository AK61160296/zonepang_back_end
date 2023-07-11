
const paymentRouter = express.Router();
import { postAddOrderGB, depositGB, checkQrPayment } from '../controller/paymentController.js';
import path from 'path'
import express from 'express';
import multer from "multer";
import AWS from 'aws-sdk'
import multerS3 from 'multer-s3'

paymentRouter.post('/postAddOrderGB', async function (req, res) {
    try {
        const { user_id, productPrice, productAmount, productId, packageId, productOld, referenceNo } = req.body;
        const response = await postAddOrderGB(user_id, productPrice, productAmount, productId, packageId, productOld, referenceNo)
        res.json(response)
    } catch (error) {
        console.log(error)
    }
});

paymentRouter.post('/depositGB', async function (req, res) {
    try {
        const message = req.body
        const result = await depositGB(message);
        res.json(result)
    } catch (error) {
        console.log(error)
    }
});
paymentRouter.post('/checkQrPayment', async function (req, res) {
    try {
        const { idQR } = req.body;
        const response = await checkQrPayment(idQR)
        res.json(response)
    } catch (error) {
        console.log(error)
    }
});


export { paymentRouter };