import { Sequelize, Op } from 'sequelize';
import { connectDb } from '../config/database.js'
import { zpPostsModel, zpUsersModel, zpAttchmentsPostsModel, zpCommentsModel, zpLikesModel, zpGroupsModel, zpMatchAttachmentsModel, zpBookmarksModel } from '../models/index.js';
import * as cheerio from "cheerio";
import { URL } from "url";
import axios from 'axios';
import Fuse from 'fuse.js';
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

        let posts = await zpPostsModel.findAll({
            where: {
                post_id: postIds,
            },
            order: [['create_at', 'desc']],
            include: [
                {
                    model: zpUsersModel,
                    required: true,
                    attributes: ['id', 'name', 'avatar']
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
            let userBookmark = null;
            if (user_id) {
                userLike = await zpLikesModel.findOne({
                    where: {
                        post_id: post.post_id,
                        user_id: user_id,
                    },
                });

                userBookmark = await zpBookmarksModel.findOne({
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
                totalComment,
                userBookmark
            };
        };

        posts = await Promise.all(posts.map(post => getModifiedPost(post)));

        return { status: 'success', posts };

    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }
}


async function getInfinitePosts(groupId, userIdProfile, page, user_id) {
    try {
        const limit = 3;
        const offset = (page - 1) * limit;
        let whereClause = {};

        if (userIdProfile) {
            whereClause = {
                user_id: userIdProfile
            };
        } else if (groupId) {
            whereClause = {
                group_id: groupId
            };
        }

        let posts = await zpPostsModel.findAll({
            where: whereClause,
            limit: limit,
            offset: offset,
            order: [['create_at', 'desc']],
            include: [
                {
                    model: zpUsersModel,
                    attributes: ['id', 'name', 'avatar'],
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
            const atmPostIds = post.match_attachments ? post.match_attachments[0].atm_post_id.split(',') : [];

            // Query the zpAttchmentsPostsModel for the required information
            const attachments = await zpAttchmentsPostsModel.findAll({
                where: {
                    atm_post_id: {
                        [Op.in]: atmPostIds
                    }
                }
            });

            const totalComment = await zpCommentsModel.count({
                where: {
                    post_id: post.post_id,
                    reply: 0,
                },
            });

            let userLike = null;
            let userBookmark = null;
            if (user_id) {
                userLike = await zpLikesModel.findOne({
                    where: {
                        post_id: post.post_id,
                        user_id: user_id,
                    },
                });

                userBookmark = await zpBookmarksModel.findOne({
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
                totalComment,
                userBookmark
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
                    attributes: ['id', 'name', 'avatar', 'code_user'],
                },
            ],
            order: [['create_at', 'desc']],
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
                    attributes: ['id', 'name', 'avatar', 'code_user'],
                },
                {
                    model: zpUsersModel,
                    required: true,
                    attributes: ['id', 'name', 'avatar', 'code_user'],
                    as: 'user_reply',
                    where: {
                        id: Sequelize.col('comments.user_id_reply')
                    }
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
async function likePost(user_id, post_id, type, comment_id) {
    try {
        if (type === "like") {
            if (comment_id) {
                const like = await zpLikesModel.create({
                    user_id,
                    post_id,
                    comment_id
                });
            } else {
                const like = await zpLikesModel.create({
                    user_id,
                    post_id
                });
            }

        } else if (type === "dislike") {
            if (comment_id) {
                const like = await zpLikesModel.destroy({
                    where: {
                        user_id,
                        post_id,
                        comment_id
                    }
                });
            } else {
                const like = await zpLikesModel.destroy({
                    where: {
                        user_id,
                        post_id,
                    }
                });
            }
        }

        return { status: 'success' };
    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }
}

async function createComments(post_id, user_id, text, reply_id, user_id_reply, files) {
    try {
        let comment = []
        if (files && files.length > 0) {
            var file_name = files[0].key
            var file_type = files[0].mimetype
            var get_type = files[0].mimetype
        } else {
            var file_name = null
            var file_type = null
            var get_type = null
        }
        if (reply_id) {
            comment = await zpCommentsModel.create({
                text,
                user_id,
                post_id,
                file_name: file_name,
                file_type: file_type,
                get_type: get_type,
                reply: 1,
                reply_to_reply: reply_id,
                user_id_reply: user_id_reply,
                create_at: Date.now(),
                update_at: Date.now()
            });
        } else {
            comment = await zpCommentsModel.create({
                text,
                user_id,
                post_id,
                file_name: file_name,
                file_type: file_type,
                get_type: get_type,
                create_at: Date.now(),
                update_at: Date.now()
            });
        }
        // เชื่อมโยงกับตารางผู้ใช้งาน (zpUsersModel) โดยใช้ user_id เป็น key
        const user = await zpUsersModel.findOne({
            where: {
                id: user_id
            },
            attributes: ['id', 'name', 'avatar'] // ระบุฟิลด์ที่ต้องการ
        });

        // เพิ่มข้อมูลผู้ใช้งานใน object comment
        comment.dataValues.user = user;

        return { status: 'success', comment };

    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }
}

async function seachUserAndGroup(keywords) {
    try {
        const users = await zpUsersModel.findAll({
            where: {
                [Op.or]: [
                    { name: { [Op.like]: `%${keywords}%` } },
                    { fullname: { [Op.like]: `%${keywords}%` } },
                ],
            },
            attributes: ["id", "name", "avatar"],
        }).then(users => users.map(user => ({ ...user.toJSON(), type: 'user' })));

        const groups = await zpGroupsModel.findAll({
            where: {
                [Op.or]: [
                    { name: { [Op.like]: `%${keywords}%` } },
                ],
            },
            attributes: ["group_id", "name", "image_group"],
        }).then(groups => groups.map(group => ({ ...group.toJSON(), type: 'group' })));

        const fuse = new Fuse([...users, ...groups], {
            keys: ["name"],
        });

        let sliceArr = fuse.search(keywords);
        const result = sliceArr.slice(0, 7);
        return { status: "success", result };

    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }
}

export {
    createComments,
    getInfinitePosts,
    createPostGroups,
    getPostComments,
    getPostReplyComments,
    likePost,
    seachUserAndGroup,
}