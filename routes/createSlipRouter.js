
const createSlipRouter = express.Router();
import { postAddOrderGB, depositGB, checkQrPayment, createSlip } from '../controller/paymentController.js';
import path from 'path'
import express from 'express';
import multer from "multer";
import AWS from 'aws-sdk'
import multerS3 from 'multer-s3'
const app = express();
const s3 = new AWS.S3({
    accessKeyId: 'DO00LZHLWGBLZWNB23AB',
    secretAccessKey: 'hGKP79CIMKB7ZJZq4wZFBSEA3EsPq6azSR1YpnfosYU',
    endpoint: 'https://sgp1.digitaloceanspaces.com',
    region: 'sgp1',
    s3ForcePathStyle: true,
    signatureVersion: 'v4'
});

const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'zonepang',
        acl: 'public-read',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            cb(null, 'img-slip-payment/' + uniqueSuffix + '-' + file.originalname);
        }
    })
});
async function deleteS3File(fileKey) {
    try {
        await s3.deleteObject({ Bucket: 'zonepang', Key: fileKey }).promise();
        console.log(`File ${fileKey} has been deleted from S3.`);
    } catch (error) {
        console.error(`Failed to delete file ${fileKey} from S3: ${error}`);
    }
}

createSlipRouter.post('/createSlip', upload.any('file'), async function (req, res) {
    try {
        var files = req.files;
        console.log("files", files)
        const { user_id, fname, dateTimepayment, order_id, codeOrder, email, phone, price } = req.body;
        const response = await createSlip(user_id, files, fname, dateTimepayment, order_id, codeOrder, email, phone, price)
        if (response.status === 'success') {
            res.json({ response });
        } else {
            for (const file of files) {
                await deleteS3File(file.key);
            }
            res.status(500).json({
                message: 'Internal server error'
            });
        }
    } catch (error) {
        console.log("error", error)
        for (const file of files) {
            await deleteS3File(file.key);
        }
        res.status(500).json({
            message: 'Internal server error'
        });
    }
});


export { createSlipRouter };