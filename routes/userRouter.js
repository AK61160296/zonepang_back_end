
const userRouter = express.Router();
import { editProfile } from '../controller/authController.js';
import { usersZonepang, sortBookmark, searchUsers, deleteAddress, defaultAddress, editAddress, createAddress, addPartner, getUserPartner, getUserAffiliate, getUserPath, getUserProfile, settingNotification, getSettingNotification, getBookmarks, addPinBookmark, getUserFollow, followUser, checkFollow, getUserInfo } from '../controller/index.js';
import path from 'path'
import express from 'express';
import multer from "multer";
import AWS from 'aws-sdk'
import multerS3 from 'multer-s3'

const app = express();

userRouter.put('/sortBookmark/:bookmark_id', async function (req, res) {
    try {
        const { newItems } = req.body;
        const status = await sortBookmark(newItems);
        res.json(status);
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
userRouter.post('/getBookmarks', async function (req, res) {
    try {
        const { userId } = req.body;
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
        if (user_id) {
            const userFollower = await getUserFollow(user_id);
            res.json(userFollower);
        } else {
            res.json({ status: 'error' });
        }


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

userRouter.post('/getUserInfo', async function (req, res) {
    try {
        const { user_id } = req.body;
        const response = await getUserInfo(user_id);
        res.json(response);
    } catch (error) {
        console.log(error)
    }
});

userRouter.get('/getUserAffiliate', async function (req, res) {
    try {
        const response = await getUserAffiliate();
        res.json(response);
    } catch (error) {
        console.log(error)
    }
});
userRouter.get('/getUserPartner', async function (req, res) {
    try {
        const response = await getUserPartner();
        res.json(response);
    } catch (error) {
        console.log(error)
    }
});

userRouter.post('/addPartner', async function (req, res) {
    try {
        const { name, phone, line_id, email, about } = req.body;
        const response = await addPartner(name, phone, line_id, email, about);
        res.json(response);
    } catch (error) {
        console.log(error)
    }
});

userRouter.post('/createAddress', async function (req, res) {
    try {
        const { user_id, full_name, phone, sub_district_and_area, district_and_area, country, address_default, postal_code, address_detail } = req.body;
        const response = await createAddress(user_id, full_name, phone, sub_district_and_area, district_and_area, country, address_default, postal_code, address_detail);
        res.json(response);
    } catch (error) {
        console.log(error)
    }
});

userRouter.post('/editAddress', async function (req, res) {
    try {
        const { address_id, full_name, phone, sub_district_and_area, district_and_area, country, postal_code, address_detail } = req.body;
        const response = await editAddress(address_id, full_name, phone, sub_district_and_area, district_and_area, country, postal_code, address_detail);
        res.json(response);
    } catch (error) {
        console.log(error)
    }
});


userRouter.post('/defaultAddress', async function (req, res) {
    try {
        const { user_id, address_id } = req.body;
        const response = await defaultAddress(user_id, address_id);
        res.json(response);
    } catch (error) {
        console.log(error)
    }
});

userRouter.post('/deleteAddress', async function (req, res) {
    try {
        const { address_id } = req.body;
        const response = await deleteAddress(address_id);
        res.json(response);
    } catch (error) {
        console.log(error)
    }
});

userRouter.post('/searchUsers', async function (req, res) {
    try {
        const { user_id, keywords } = req.body;
        if (user_id) {
            const response = await searchUsers(user_id, keywords);
            res.json(response);
        } else {
            res.json({ status: "error" });
        }

    } catch (error) {
        console.log(error)
    }
});

userRouter.post('/usersZonepang', async function (req, res) {
    try {
        const { keywords } = req.body
        const result = await usersZonepang(keywords)
        res.json(result)
    } catch (error) {
        console.log(error)
    }
});


export { userRouter };