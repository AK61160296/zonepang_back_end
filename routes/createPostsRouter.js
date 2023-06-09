const createPostsRouter = express.Router();
import { seachUserAndGroup, getInfinitePosts, createPostGroups, getPostComments, getPostReplyComments, likePost } from '../controller/postsController.js';
import { bookmarkPost } from '../controller/index.js';
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
            cb(null, 'post-img/' + uniqueSuffix + '-' + file.originalname);
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

createPostsRouter.post('/createPostGroups', upload.any('file'), async function (req, res) {
    try {

        var files = req.files;
        const { content, user_id, group_id, location_name, lat, lng } = req.body;
        var location = null
        if (location_name) {
            location = {
                name: location_name,
                lat: lat,
                lng: lng,
            };

        }
        const locationPrepare = JSON.stringify(location);
        const groupIds = group_id.split(',').map(id => parseInt(id.trim())); // แปลง string ให้เป็น array ของ integer
        const createPostGroupsRes = await createPostGroups(content, user_id, groupIds, locationPrepare, files);
        if (createPostGroupsRes.status === 'success') {
            res.json({
                data: createPostGroupsRes
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

export { createPostsRouter };