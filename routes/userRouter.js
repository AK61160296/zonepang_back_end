
const userRouter = express.Router();
import { editProfile } from '../controller/authController.js';
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
            cb(null, 'avatar/' + uniqueSuffix + '-' + file.originalname);
        }
    })
});


userRouter.post('/editProfile', upload.any('file'), async function (req, res) {
    try {

        const files = req.files;
        const { user_id, userName, userBio } = req.body;
        const userInfo = await editProfile(user_id, userName, userBio, files);
        res.json({ userInfo });
    } catch (error) {
        console.log(error)
    }
});

export { userRouter };