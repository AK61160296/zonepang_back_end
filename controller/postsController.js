import { Sequelize, Op } from 'sequelize';
import { connectDb } from '../config/database.js'
import { zpPostsModel, zpUsersModel, zpAttchmentsPostsModel, zpCommentsModel, zpLikesModel, zpGroupsModel, zpMatchAttachmentsModel } from '../models/index.js';
import * as cheerio from "cheerio";
import { URL } from "url";
import axios from 'axios';

async function createPostGroups(content, user_id, groupIds, files) {
    try {
        const postIds = [];
        const atmIds = [];

        for (const groupId of groupIds) {
            // สร้างโพสต์
            const post = await zpPostsModel.create({
                content,
                user_id,
                group_id: groupId,
                create_at: Date.now(),
                update_at: Date.now()
            });

            // บันทึก post_id ไว้ใน array
            postIds.push(post.post_id);
        }
        if (files && files.length > 0) {
            for (const file of files) {
                const attchmentsPost = await zpAttchmentsPostsModel.create({
                    file_name: file.key,
                    file_type: file.mimetype,
                    get_type: file.mimetype,
                });
                atmIds.push(attchmentsPost.atm_post_id);
            }
        }
        let atmIdStr = atmIds.join();
        for (const postId of postIds) {

            const matchAttchmentsPost = await zpMatchAttachmentsModel.create({
                post_id: postId,
                atm_post_id: atmIdStr,
            });
        }

        return { status: 'success', atmIdStr };

    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }
}


async function getInfinitePosts(page, user_id) {
    try {
        const limit = 3;
        const offset = (page - 1) * limit;

        let posts = await zpPostsModel.findAll({
            limit: limit,
            offset: offset,
            order: [['post_id', 'asc']],
            include: [
                {
                    model: zpUsersModel,
                    required: true
                },
                {
                    model: zpGroupsModel,
                    required: true,
                },
                {
                    model: zpLikesModel,
                    required: false,
                    where: {
                        comment_id: {
                            [Op.is]: null,
                        }
                    },
                    include: [{
                        model: zpUsersModel,
                        required: false,
                        attributes: ['id', 'name', 'avatar']
                    }]
                },
                {
                    model: zpMatchAttachmentsModel,
                    attributes: ['atm_post_id'],
                    required: false,
                }
            ]
        });

        const getModifiedPost = async (post) => {
            let attachments = [];
            let atm_post_ids = [];

            if (post.match_attachments && post.match_attachments.length > 0) {
                atm_post_ids = post.match_attachments[0].atm_post_id.split(',');

                // Query the zpAttchmentsPostsModel for the required information
                attachments = await zpAttchmentsPostsModel.findAll({
                    where: {
                        atm_post_id: {
                            [Op.in]: atm_post_ids
                        }
                    }
                });
            }
            const totalComment = await zpCommentsModel.count({
                where: {
                    post_id: post.post_id,
                    reply: 0,
                },
            });

            let userLike = null;
            if (user_id) {
                userLike = await zpLikesModel.findOne({
                    where: {
                        post_id: post.post_id,
                        user_id: user_id,
                    },
                });
            }


            const totalLike = post.likes.length;

            return {
                ...post.get({ plain: true }),
                totalLike,
                userLike,
                attachments,
                totalComment
            };
        };

        posts = await Promise.all(posts.map(post => getModifiedPost(post)));

        return posts;
    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }
}
async function getPostComments(postId, limit, offset) {
    try {
        let comments = await zpCommentsModel.findAll({
            where: {
                post_id: postId,
                reply: 0,
            },
            limit: limit,
            offset: offset,
            include: [
                {
                    model: zpUsersModel,
                    required: true,
                    attributes: ['id', 'name', 'avatar']
                },
            ]
            // order: [['created_at', 'DESC']],
        });

        const getModifiedComment = async (comment) => {
            const totalReplyComment = await zpCommentsModel.count({
                where: {
                    reply_to_reply: comment.comment_id,
                },
            });

            return {
                ...comment.get({ plain: true }),
                totalReplyComment,
            };
        };


        // Use the asynchronous mapping function
        comments = await Promise.all(comments.map(comment => getModifiedComment(comment)));

        return { status: 'success', comments };
    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }
}
async function getPostReplyComments(comment_id) {
    try {
        let replyComments = await zpCommentsModel.findAll({
            where: {
                reply_to_reply: comment_id,
                reply: 1,
            },
            include: [
                {
                    model: zpUsersModel,
                    required: true,
                    attributes: ['id', 'name', 'avatar']
                },
            ]
            // order: [['created_at', 'DESC']],
        });


        return { status: 'success', replyComments };
    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }
}
async function likePost(user_id, post_id, type) {
    try {
        if (type === "like") {
            const like = await zpLikesModel.create({
                user_id,
                post_id
            });
        } else if (type === "dislike") {
            const like = await zpLikesModel.destroy({
                where: {
                    user_id,
                    post_id
                }
            });
        }

        return { status: 'success' };
    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }
}

export {
    getInfinitePosts,
    createPostGroups,
    getPostComments,
    getPostReplyComments,
    likePost,
}