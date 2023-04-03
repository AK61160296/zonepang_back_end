import express from 'express';
const postsRouter = express.Router();
import { getInfinitePosts, createPostGroups } from '../controller/postsController.js';
import path from 'path'
import multer from "multer";

// const AWS = require('aws-sdk');
// const multer = require('multer');
// const multerS3 = require('multer-s3');
// const express = require('express');

// const app = express();
// const s3 = new AWS.S3({
//     accessKeyId: '<ACCESS KEY>',
//     secretAccessKey: '<SECRET ACCESS KEY>',
//     endpoint: '<SPACE ENDPOINT>',
//     region: '<REGION>',
//     s3ForcePathStyle: true,
//     signatureVersion: 'v4'
// });

// const upload = multer({
//     storage: multerS3({
//         s3: s3,
//         bucket: '<BUCKET NAME>',
//         acl: 'public-read',
//         contentType: multerS3.AUTO_CONTENT_TYPE,
//         key: function (req, file, cb) {
//             cb(null, Date.now().toString() + '-' + file.originalname)
//         }
//     })
// });



const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, path.basename(file.originalname, path.extname(file.originalname)) + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    dest: './upload/',
    limits: {
        fileSize: 1000000,
    },
    storage: storage
})

postsRouter.post('/createPostGroups', upload.any('file'), async function (req, res) {
    try {
        const files = req.files;
        console.log(files)
        const { content, user_id, group_id } = req.body;
        const groupIds = group_id.split(',').map(id => parseInt(id.trim())); // แปลง string ให้เป็น array ของ integer
        const status = await createPostGroups(content, user_id, groupIds, files);
        res.json({
            data: status
        });
    } catch (error) {
        console.log(error)
    }
});

postsRouter.get('/getInfinitePosts', async function (req, res) {
    try {
        const page = req.query.page
        const feedPost = await getInfinitePosts(page);
        res.json({
            data: feedPost
        });
    } catch (error) {
        console.log(error)
    }
});

postsRouter.get('/getPostComments', async function (req, res) {
    try {
        const comments = "comments"
        // const page = req.query.page
        // const feedPost = await getInfinitePosts(page);
        res.json({
            data: comments
        });
    } catch (error) {
        console.log(error)
    }
});

export { postsRouter };