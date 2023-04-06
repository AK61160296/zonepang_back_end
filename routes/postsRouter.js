import express from 'express';
const postsRouter = express.Router();
import { getInfinitePosts, createPostGroups } from '../controller/postsController.js';
import path from 'path'
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
            cb(null, 'post-img/' + Date.now().toString() + '-' + file.originalname)
        }
    })
});

postsRouter.post('/createPostGroups', upload.any('file'), async function (req, res) {
    try {
        const files = req.files;
        console.log(files)
        const { content, user_id, group_id } = req.body;
        const groupIds = group_id.split(',').map(id => parseInt(id.trim())); // แปลง string ให้เป็น array ของ integer
        const createPostGroupsRes = await createPostGroups(content, user_id, groupIds, files);
        if (createPostGroupsRes.status === 'success') {
            res.json({
                data: createPostGroupsRes 
            });
        } else {
            files.forEach(file => {
                s3.deleteObject({
                    Bucket: 'zonepang',
                    Key: file.key
                }, function (err, data) {
                    if (err) {
                        console.log(err, err.stack);
                    } else {
                        console.log(data);
                    }
                });
            });
            res.status(500).json({
                message: 'Internal server error'
            });
        }
    } catch (error) {
        files.forEach(file => {
            s3.deleteObject({
                Bucket: 'zonepang',
                Key: file.key
            }, function (err, data) {
                if (err) {
                    console.log(err, err.stack);
                } else {
                    console.log(data);
                }
            });
        });
        res.status(500).json({
            message: 'Internal server error'
        });
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



// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, './uploads/');
//     },
//     filename: function (req, file, cb) {
//         cb(null, path.basename(file.originalname, path.extname(file.originalname)) + '-' + Date.now() + path.extname(file.originalname));
//     }
// });

// const upload = multer({
//     dest: './upload/',
//     limits: {
//         fileSize: 1000000,
//     },
//     storage: storage
// })