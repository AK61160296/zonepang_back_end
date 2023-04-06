import { Sequelize, Op } from 'sequelize';
import { connectDb } from '../config/database.js'
import { zpPostsModel, zpUsersModel, zpAttchmentsPostsModel, zpLikesModel, zpGroupsModel, zpMatchAttachmentsModel } from '../models/index.js';
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
                group_id: groupId
            });

            // บันทึก post_id ไว้ใน array
            postIds.push(post.post_id);
        }
        if (files && files.length > 0) {
            for (const file of files) {
                const attchmentsPost = await zpAttchmentsPostsModel.create({
                    file_name: file.originalname,
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


async function getInfinitePosts(page) {
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

            const totalLike = post.likes.length;

            return {
                ...post.get({ plain: true }),
                totalLike,
                attachments,
            };
        };


        // Use the asynchronous mapping function
        posts = await Promise.all(posts.map(post => getModifiedPost(post)));

        return posts;
    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }
}


export {
    getInfinitePosts,
    createPostGroups
}