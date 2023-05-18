const createCommentsRouter = express.Router();
import { createComments } from '../controller/postsController.js';
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
            cb(null, 'comment-img/' + uniqueSuffix + '-' + file.originalname);
        }
    })
});

createCommentsRouter.post('/createComments', upload.any('file'), async function (req, res) {
    try {

        var files = req.files;
        const { post_id, user_id, text, reply_id, user_id_reply, sub_to_reply } = req.body;
        const createCommentsRes = await createComments(post_id, user_id, text, reply_id, user_id_reply, sub_to_reply, files);
        if (createCommentsRes.status === 'success') {
            res.json({
                data: createCommentsRes
            });
        } else {
            for (const file of files) {
                await deleteS3File(file.key);
            }
            res.status(500).json({
                message: 'Internal server error'
            });
        }
    } catch (error) {
        for (const file of files) {
            await deleteS3File(file.key);
        }
        res.status(500).json({
            message: 'Internal server error'
        });
    }
});

async function deleteS3File(fileKey) {
    try {
        await s3.deleteObject({ Bucket: 'zonepang', Key: fileKey }).promise();
        console.log(`File ${fileKey} has been deleted from S3.`);
    } catch (error) {
        console.error(`Failed to delete file ${fileKey} from S3: ${error}`);
    }
}

export { createCommentsRouter };