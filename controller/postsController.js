import { Sequelize, Op } from 'sequelize';
import { connectDb } from '../config/database.js'
import { zpPostsModel, zpUsersModel, zpAttchmentsPostsModel, zpLikesModel, zpGroupsModel } from '../models/index.js';
import * as cheerio from "cheerio";
import { URL } from "url";
import axios from 'axios';

async function createPostGroups(content, user_id, groupIds, files) {
    try {
        const postIds = [];

        console.log('files',files)

        for (const groupId of groupIds) {
            // สร้างโพสต์
            const post = await zpPostsModel.create({
                content,
                user_id,
                group_id: groupId
            });

            // บันทึก post_id ไว้ใน array
            postIds.push(post.post_id);

            if (files && files.length > 0) {
                for (const file of files) {
                    await zpAttchmentsPostsModel.create({
                        post_id: post.post_id,
                        file_name: file.originalname,
                        file_type: file.mimetype,
                        get_type: file.mimetype,
                    });        
                }
            }

        }

        return { status: 'success', postIds };

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
            include: [{
                model: zpUsersModel,
                required: true
            },
            {
                model: zpGroupsModel,
                required: true,
            },
            {
                model: zpAttchmentsPostsModel,
                required: false,
            }, {
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
            }]
        });
        // for (let i = 0; i < posts.length; i++) {
        //     let totalLike = posts[i].likes.length;
        //     posts[i].dataValues.totalLike = totalLike;
        // }
        posts = posts.map(data => {
            let totalLike = data.likes.length;
            return {
                ...data.get({ plain: true }),
                totalLike
            }
        });

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