const postsRouter = express.Router();
import { seachUserAndGroup, getInfinitePosts, createPostGroups, getPostComments, getPostReplyComments, likePost, getLikesPost, getTotalComment, getPostsById, getPathPostId } from '../controller/postsController.js';
import { bookmarkPost } from '../controller/index.js';
import path from 'path'
import express from 'express';
const app = express();

postsRouter.post('/getInfinitePosts', async function (req, res) {
    try {
        const filter = req.body.filter
        const groupId = req.body.groupId
        const userIdProfile = req.body.userIdProfile
        const page = req.body.page
        const user_id = req.body.user_id
        const feedPost = await getInfinitePosts(groupId, userIdProfile, page, user_id, filter);
        res.json({
            data: feedPost
        });
    } catch (error) {
        console.log(error)
    }
});

postsRouter.get('/getPathPostId', async function (req, res) {
    try {
        const postId = await getPathPostId()
        res.json(postId);
    } catch (error) {
        console.log(error)
    }
});

postsRouter.get('/getPostsById', async function (req, res) {
    try {
        const postId = req.body.postId
        const user_id = req.body.user_id
        const post = await getPostsById(postId, user_id);
        res.json(post);
    } catch (error) {
        console.log(error)
    }
});

postsRouter.post('/likePost', async function (req, res) {
    try {
        const { user_id, post_id, type, comment_id } = req.body;
        const status = await likePost(user_id, post_id, type, comment_id);
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
postsRouter.post('/getLikesPost', async function (req, res) {
    try {
        const { postId } = req.body;
        const likes = await getLikesPost(postId);
        res.json({ likes });
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
        const userAndGroups = await seachUserAndGroup(keywords);
        res.json(userAndGroups);
    } catch (error) {
        console.log(error)
    }
});

postsRouter.get('/getTotalComment', async function (req, res) {
    try {
        const postId = req.query.postId;
        const totalComment = await getTotalComment(postId);
        res.json(totalComment);
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