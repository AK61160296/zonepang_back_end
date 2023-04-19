const postsRouter = express.Router();
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

postsRouter.post('/createPostGroups', upload.any('file'), async function (req, res) {
    try {

        const files = req.files;
        const { content, user_id, group_id } = req.body;
        const groupIds = group_id.split(',').map(id => parseInt(id.trim())); // แปลง string ให้เป็น array ของ integer
        const createPostGroupsRes = await createPostGroups(content, user_id, groupIds, files);
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

postsRouter.get('/getInfinitePosts', async function (req, res) {
    try {
        const groupId = req.query.groupId
        const userIdProfile = req.query.userIdProfile
        const page = req.query.page
        const user_id = req.query.user_id
        const feedPost = await getInfinitePosts(groupId,userIdProfile,page, user_id);
        res.json({
            data: feedPost
        });
    } catch (error) {
        console.log(error)
    }
});
postsRouter.post('/likePost', async function (req, res) {
    try {
        const { user_id, post_id, type,comment_id } = req.body;
        const status = await likePost(user_id, post_id, type,comment_id);
        res.json({ status });
    } catch (error) {
        console.log(error)
    }
});
postsRouter.post('/bookmarkPost', async function (req, res) {
    try {
        const { user_id, post_id, type } = req.body;
        const status = await bookmarkPost(user_id, post_id, type);
        res.json({ status });
    } catch (error) {
        console.log(error)
    }
});


postsRouter.get('/getPostComments', async function (req, res) {
    try {
        const postId = req.query.postId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 3;
        const offset = (page - 1) * limit;

        const comments = await getPostComments(postId, limit, offset);

        if (comments.status === 'error') {
            return res.status(500).json({
                status: 'error',
                message: 'Failed to get post comments',
                error: comments.error
            });
        }

        res.json(comments);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to get post comments',
            error: error.message
        });
    }
});

postsRouter.get('/getPostReplyComments', async function (req, res) {
    try {
        const comment_id = req.query.comment_id;
        console.log(comment_id)

        const replyComments = await getPostReplyComments(comment_id);

        if (replyComments.status === 'error') {
            return res.status(500).json({
                status: 'error',
                message: 'Failed to get post comments',
                error: comments.error
            });
        }

        res.json(replyComments);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to get post comments',
            error: error.message
        });
    }
});

postsRouter.get('/seachUserAndGroup', async function (req, res) {
    try {
        const keywords = req.query.keywords;
        const isGroup = req.query.isGroup;
        const userId = req.query.user_id;
        const userAndGroups = await seachUserAndGroup(keywords,isGroup,userId);
        res.json(userAndGroups);
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