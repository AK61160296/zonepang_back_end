
const userRouter = express.Router();
import { editProfile } from '../controller/authController.js';
import { sortBookmark, getUserPath, getUserProfile, settingNotification, getSettingNotification, getBookmarks, addPinBookmark, getUserFollow, followUser, checkFollow } from '../controller/index.js';
import path from 'path'
import express from 'express';
import multer from "multer";
import AWS from 'aws-sdk'
import multerS3 from 'multer-s3'

const app = express();


userRouter.put('/sortBookmark/:bookmark_id', async function (req, res) {
    try {

        const { bookmark_id } = req.params;

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
userRouter.get('/getBookmarks', async function (req, res) {
    try {
        const userId = req.headers['x-user-id'];
        const bookmark = await getBookmarks(userId);
        res.json(bookmark);
    } catch (error) {
        console.log(error)
    }
});

userRouter.get('/getUserProfile', async function (req, res) {
    try {
        const userProfileId = req.query.userProfileId;
        const userProfile = await getUserProfile(userProfileId);
        res.json(userProfile);
    } catch (error) {
        console.log(error)
    }
});
userRouter.post('/settingNotification', async function (req, res) {
    try {
        const { user_id, all, comment, follow, tag, group, like } = req.body;
        const status = await settingNotification(user_id, all, comment, follow, tag, group, like);
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

userRouter.post('/addPinBookmark', async function (req, res) {
    try {
        const { user_id, bookmark_id, type } = req.body;
        const status = await addPinBookmark(user_id, bookmark_id, type);
        res.json(status);
    } catch (error) {
        console.log(error)
    }
});
userRouter.post('/getUserFollow', async function (req, res) {
    try {
        const { user_id } = req.body;
        const userFollower = await getUserFollow(user_id);
        res.json(userFollower);
    } catch (error) {
        console.log(error)
    }
});

userRouter.post('/checkFollow', async function (req, res) {
    try {
        const { user_id, user_follow_id } = req.body;
        const follow = await checkFollow(user_id, user_follow_id);
        res.json(follow);
    } catch (error) {
        console.log(error)
    }
});



export { userRouter };