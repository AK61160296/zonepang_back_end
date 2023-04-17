
const userRouter = express.Router();
import { editProfile } from '../controller/authController.js';
import { sortBookmark, getUserPath, getUserProfile, settingNotification, getSettingNotification } from '../controller/index.js';
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

userRouter.put('/sortBookmark/:id', async function (req, res) {
    try {

        const { id } = req.params;

        const { newItems } = req.body;
        const status = await sortBookmark(newItems);
        res.json(newItems);
    } catch (error) {
        console.log(error)
    }
});

userRouter.post('/followUser', async function (req, res) {
    try {
        const { user_id, user_follow_id, type } = req.body;
        const status = await followUser(user_id, user_follow_id, type);
        res.json(status);
    } catch (error) {
        console.log(error)
    }
});

userRouter.get('/getUserPath', async function (req, res) {
    try {
        const path = await getUserPath();
        res.json(path);
    } catch (error) {
        console.log(error)
    }
});

userRouter.get('/getUserProfile', async function (req, res) {
    try {
        const userProfileId = req.query.userProfileId;
        const userId = req.query.userId;
        const userProfile = await getUserProfile(userProfileId, userId);
        res.json(userProfile);
    } catch (error) {
        console.log(error)
    }
});
userRouter.post('/settingNotification', async function (req, res) {
    try {
        const { user_id, all, comment, follow, tag, group } = req.body;
        const status = await settingNotification(user_id, all, comment, follow, tag, group);
        res.json(status);
    } catch (error) {
        console.log(error)
    }
});

userRouter.get('/getSettingNotification', async function (req, res) {
    try {
        const userId = req.query.user_id;

        const setting = await getSettingNotification(userId);
        res.json(setting);
    } catch (error) {
        console.log(error)
    }
});




export { userRouter };