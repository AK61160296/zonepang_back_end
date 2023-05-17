import { Sequelize, Op } from 'sequelize';
import { zpNotificationsModel } from '../models/notification.js';
import { connectDb } from '../config/database.js'
import { zpPostsModel, zpUsersModel, zpAttchmentsPostsModel, zpCommentsModel, zpLikesModel, zpGroupsModel, zpMatchAttachmentsModel, zpBookmarksModel, zpUserGroupsModel, zpUserSettingsModel } from '../models/index.js';
import * as cheerio from "cheerio";
import { URL } from "url";
import axios from 'axios';
import Fuse from 'fuse.js';
async function createPostGroups(content, user_id, groupIds, locationPrepare, files) {
    try {

        const postIds = [];
        const atmIds = [];
        const groupData = new Map();

        for (const groupId of groupIds) {
            // สร้างโพสต์
            const post = await zpPostsModel.create({
                content,
                user_id,
                group_id: groupId,
                location: locationPrepare,
                create_at: Date.now(),
                update_at: Date.now()
            });

            postIds.push(post.post_id);
            groupData.set(groupId, post.post_id);
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
        createNotificationPostGroup(user_id, groupData)

        return { status: 'success', posts };
    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }

}
async function createNotificationPostGroup(userId, groupData) {
    try {
        let userIdActor = userId
        const userData = await zpUsersModel.findOne({
            attributes: ['id', 'name', 'avatar', 'code_user'],
            where: {
                id: userIdActor
            }
        })
        for (const [groupId, postId] of groupData.entries()) {
            // สร้างโพสต์
            const userDataId = await zpUserGroupsModel.findAll({
                attributes: ['user_id'],
                where: {
                    group_id: groupId
                }
            });

            const groupData = await zpGroupsModel.findOne({
                attributes: ['name'],
                where: {
                    group_id: groupId
                }
            })
            const checkLenght = groupData.dataValues.name.length
            let subStr = groupData.dataValues.name.substring(0, 15);
            if (checkLenght > 15) {
                subStr = subStr + "..."
            }

            for (const userId of userDataId) {
                const checkSettingNoti = await zpUserSettingsModel.findOne({
                    where: {
                        user_id: userId.user_id
                    }
                })
                if (checkSettingNoti) {
                    const checkSettingNotiObj = JSON.parse(checkSettingNoti.dataValues.setting);
                    if (checkSettingNotiObj.group && userIdActor != userId.user_id) {
                        const notification = {
                            user_id: userId.user_id,
                            noti_text: userData.dataValues.name + " โพสต์ในกลุ่ม " + subStr,
                            noti_type: "post_group",
                            group_id_target: groupId,
                            post_id_target: postId,
                            user_id_actor: userIdActor,
                            comment_id_target: null,
                            read: false,
                            create_at: new Date(),
                        };
                        zpNotificationsModel.create(notification)
                    }
                }

            }
        }

        return { status: 'success' };
    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }
}

async function getInfinitePosts(groupId, userIdProfile, page, user_id, filter) {
    try {
        const limit = 3;
        const offset = (page - 1) * limit;
        let whereClause = {};
        let orderClause = [['create_at', 'desc']];

        if (userIdProfile) {
            whereClause = {
                user_id: userIdProfile
            };
            orderClause = [['create_at', 'desc']];
        } else if (groupId) {
            whereClause = {
                group_id: groupId
            };
            if (filter === "newPost") {
                orderClause = [['create_at', 'desc']];
            } else if (filter === "popularPost") {
                orderClause = [[Sequelize.literal('(SELECT COUNT(*) FROM likes WHERE likes.post_id = posts.post_id)'), 'DESC']];
            }
        }

        let posts = await zpPostsModel.findAll({
            where: whereClause,
            limit: limit,
            offset: offset,
            order: orderClause,
            include: [
                {
                    model: zpUsersModel,
                    attributes: ['id', 'name', 'avatar', 'code_user'],
                    required: true
                },
                {
                    model: zpGroupsModel,
                    required: true,
                },
                // {
                //     model: zpLikesModel,
                //     required: false,
                //     where: {
                //         comment_id: {
                //             [Op.is]: null,
                //         }
                //     },
                //     include: [{
                //         model: zpUsersModel,
                //         required: false,
                //         attributes: ['id', 'name', 'avatar', 'code_user']
                //     }]
                // },
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
            const groupId = post.group_id;

            const totalComment = await zpCommentsModel.count({
                where: {
                    post_id: post.post_id,
                    reply: 0,
                },
            });

            let userLike = null;
            let userBookmark = null;
            let isJoinGroup = false
            if (user_id) {

                const statusIsJoin = await zpUserGroupsModel.count({
                    where: {
                        user_id: user_id,
                        group_id: groupId
                    }
                });
                if (statusIsJoin > 0) {
                    isJoinGroup = true
                }


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

            const totalLike = await zpLikesModel.count({
                where: {
                    post_id: post.post_id,
                },
            });
            return {
                ...post.get({ plain: true }),
                totalLike,
                userLike,
                attachments,
                totalComment,
                userBookmark,
                isJoinGroup
            };
        };

        posts = await Promise.all(posts.map(post => getModifiedPost(post)));

        return posts;
    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }
}
async function getPostsById(postId, user_id) {
    try {

        const post = await zpPostsModel.findOne({
            where: {
                post_id: postId
            },
            include: [
                {
                    model: zpUsersModel,
                    attributes: ['id', 'name', 'avatar', 'code_user'],
                    required: true
                },
                {
                    model: zpGroupsModel,
                    required: true,
                },
                {
                    model: zpMatchAttachmentsModel,
                    attributes: ['atm_post_id'],
                    required: false,
                }
            ]
        });

        const getModifiedPost = async (post) => {
            const groupId = post.group_id;
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
            let isJoinGroup = false;
            if (user_id) {
                const statusIsJoin = await zpUserGroupsModel.count({
                    where: {
                        user_id: user_id,
                        group_id: groupId
                    }
                });
                if (statusIsJoin > 0) {
                    isJoinGroup = true;
                }
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

            const totalLike = await zpLikesModel.count({
                where: {
                    post_id: post.post_id,
                },
            });

            return {
                ...post.get({ plain: true }),
                totalLike,
                userLike,
                attachments,
                totalComment,
                userBookmark,
                isJoinGroup
            };
        };

        const posts = await getModifiedPost(post);


        return posts;
    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }
}

async function getPathPostId() {
    try {
        let postId = await zpPostsModel.findAll({
            attributes: ['post_id']
        });
        return { postId };
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
            const totalLike = await zpLikesModel.count({
                where: {
                    comment_id: comment.comment_id,
                },
            });
            const userLike = await zpLikesModel.findOne({
                where: {
                    comment_id: comment.comment_id,
                    user_id: 1,
                },
            });
            let newReplyComments = []
            let statusLike = false
            if (userLike) {
                statusLike = true
            }

            return {
                ...comment.get({ plain: true }),
                totalReplyComment,
                totalLike,
                statusLike,
                newReplyComments
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

async function getTotalComment(postId) {
    try {
        let toTalComment = await zpCommentsModel.count({
            where: {
                post_id: postId,
                reply: 0
            },
        });


        return { status: 'success', toTalComment };
    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }
}

async function getLikesPost(postId) {
    try {
        let likes = await zpLikesModel.findAll({
            where: {
                comment_id: {
                    [Op.is]: null,
                }
            },
            include: [{
                model: zpUsersModel,
                required: false,
                attributes: ['id', 'name', 'avatar', 'code_user']
            }]

        });
        return { status: 'success', likes };
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
        });

        const getModifiedComment = async (comment) => {

            const totalLike = await zpLikesModel.count({
                where: {
                    comment_id: comment.comment_id,
                },
            });
            const userLike = await zpLikesModel.findOne({
                where: {
                    comment_id: comment.comment_id,
                    user_id: 1,
                },
            });
            let statusLike = false
            if (userLike) {
                statusLike = true
            }

            return {
                ...comment.get({ plain: true }),
                totalLike,
                statusLike
            };
        };


        // Use the asynchronous mapping function
        replyComments = await Promise.all(replyComments.map(comment => getModifiedComment(comment)));

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
                    user_id: user_id,
                    comment_id: comment_id,
                    create_at: new Date(),
                    update_at: new Date(),
                });
                if (like) {
                    createNotificationLike(user_id, post_id, type, comment_id)
                }
            } else {
                const like = await zpLikesModel.create({
                    user_id: user_id,
                    post_id: post_id,
                    create_at: new Date(),
                    update_at: new Date(),
                });
                if (like) {
                    createNotificationLike(user_id, post_id, type, comment_id)
                }
            }

        } else if (type === "dislike") {
            if (comment_id) {
                const like = await zpLikesModel.destroy({
                    where: {
                        user_id,
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

async function createNotificationLike(user_id, post_id, type, comment_id) {
    try {
        const postData = await zpPostsModel.findOne({
            attributes: ['user_id', 'content'],
            where: {
                post_id: post_id
            }
        })
        if (comment_id) {
            const commentData = await zpCommentsModel.findOne({
                attributes: ['user_id'],
                where: {
                    comment_id: comment_id
                }
            })
            const checkSettingNoti = await zpUserSettingsModel.findOne({
                where: {
                    user_id: commentData.dataValues.user_id
                }
            })
            const checkSettingNotiObj = JSON.parse(checkSettingNoti.dataValues.setting);

            const checkNotification = await zpNotificationsModel.findOne({
                user_id: commentData.dataValues.user_id,
                noti_type: "like_comment",
                user_id_actor: user_id,
                comment_id_target: comment_id,
            });
            if (checkNotification === null) {
                if (checkSettingNotiObj.like) {
                    if (user_id != commentData.dataValues.user_id) {
                        const userData = await zpUsersModel.findOne({
                            attributes: ['id', 'name', 'avatar', 'code_user'],
                            where: {
                                id: user_id
                            }
                        })
                        const checkLenght = postData.dataValues.content.length
                        let subStr = postData.dataValues.content.substring(0, 15);
                        if (checkLenght > 15) {
                            subStr = subStr + "..."
                        }

                        const notification = {
                            user_id: commentData.dataValues.user_id,
                            noti_text: userData.dataValues.name + " ได้ถูกใจความคิดเห็นของคุณในโพสต์ " + subStr,
                            noti_type: "like_comment",
                            group_id_target: null,
                            post_id_target: post_id,
                            comment_id_target: comment_id,
                            user_id_actor: user_id,
                            read: false,
                            create_at: new Date(),
                        };
                        zpNotificationsModel.create(notification)
                    }
                }
            }



        } else {
            const checkSettingNoti = await zpUserSettingsModel.findOne({
                where: {
                    user_id: postData.dataValues.user_id
                }
            })
            const checkNotification = await zpNotificationsModel.findOne({
                user_id: postData.dataValues.user_id,
                noti_type: "like_post",
                user_id_actor: user_id,
                post_id_target: post_id,
            });
            const checkSettingNotiObj = JSON.parse(checkSettingNoti.dataValues.setting);
            if (checkNotification === null) {
                if (checkSettingNotiObj.like) {
                    if (user_id != postData.dataValues.user_id) {
                        const userData = await zpUsersModel.findOne({
                            attributes: ['id', 'name', 'avatar', 'code_user'],
                            where: {
                                id: user_id
                            }
                        })
                        const checkLenght = postData.dataValues.content.length
                        let subStr = postData.dataValues.content.substring(0, 15);
                        if (checkLenght > 15) {
                            subStr = subStr + "..."
                        }

                        const notification = {
                            user_id: postData.dataValues.user_id,
                            noti_text: userData.dataValues.name + " ได้ถูกใจโพสต์ " + subStr + " ของคุณ",
                            noti_type: "like_post",
                            group_id_target: null,
                            post_id_target: post_id,
                            user_id_actor: user_id,
                            comment_id_target: null,
                            read: false,
                            create_at: new Date(),
                        };

                        zpNotificationsModel.create(notification)
                    }
                }
            }

        }
        return { status: 'success' };
    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }
}

async function createComments(post_id, user_id, text, reply_id, user_id_reply, sub_to_reply, files) {
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
        let subToReply = null;
        if (sub_to_reply) {
            subToReply = sub_to_reply
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
                sub_to_reply: subToReply,
                create_at: Date.now(),
                update_at: Date.now()
            });
            const type = "reply_comment"
            createNotificationComment(user_id, post_id, reply_id, user_id_reply, type)
        } else {
            comment = await zpCommentsModel.create({
                text,
                user_id,
                post_id,
                file_name: file_name,
                file_type: file_type,
                get_type: get_type,
                reply: 0,
                reply_to_reply: 0,
                user_id_reply: null,
                sub_to_reply: null,
                create_at: Date.now(),
                update_at: Date.now()
            });
            const type = "comment"
            createNotificationComment(user_id, post_id, reply_id, user_id_reply, type)
        }
        // เชื่อมโยงกับตารางผู้ใช้งาน (zpUsersModel) โดยใช้ user_id เป็น key
        const user = await zpUsersModel.findOne({
            where: {
                id: user_id
            },
            attributes: ['id', 'name', 'avatar', 'code_user']
        });
        if (user_id_reply) {
            var user_reply = await zpUsersModel.findOne({
                where: {
                    id: user_id_reply
                },
                attributes: ['id', 'name', 'avatar', 'code_user']
            });
        }
        comment.dataValues.newReplyComments = [];
        comment.dataValues.user = user;
        comment.dataValues.user_reply = user_reply;
        comment.dataValues.totalLike = 0;
        comment.dataValues.statusLike = false;

        return { status: 'success', comment };

    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }
}
async function createNotificationComment(user_id, post_id, comment_id, user_id_reply, type) {
    try {
        let postData = await zpPostsModel.findOne({
            attributes: ['user_id', 'content'],
            where: {
                post_id: post_id
            }
        })

        let userData = await zpUsersModel.findOne({
            attributes: ['id', 'name', 'avatar', 'code_user'],
            where: {
                id: user_id
            }
        })

        let checkSettingNoti = await zpUserSettingsModel.findOne({
            where: {
                user_id: postData.dataValues.user_id
            }
        })

        let checkSettingNotiObj = JSON.parse(checkSettingNoti.dataValues.setting);

        if (type === "comment") {
            if (checkSettingNotiObj.comment) {
                if (user_id != postData.dataValues.user_id) {
                    const checkLenght = postData.dataValues.content.length
                    let subStr = postData.dataValues.content.substring(0, 15);
                    if (checkLenght > 15) {
                        subStr = subStr + "..."
                    }

                    const notification = {
                        user_id: postData.dataValues.user_id,
                        noti_text: userData.dataValues.name + " เเสดงความคิดเห็นของคุณในโพสต์ " + subStr,
                        noti_type: "comment_post",
                        group_id_target: null,
                        post_id_target: post_id,
                        user_id_actor: user_id,
                        comment_id_target: null,
                        read: false,
                        create_at: new Date(),
                    };
                    zpNotificationsModel.create(notification)

                }

            }
        } else if (type === "reply_comment") {
            if (checkSettingNotiObj.tag) {

                let commentData = await zpCommentsModel.findOne({
                    attributes: ['user_id'],
                    where: {
                        comment_id: comment_id
                    }
                })
                if (user_id != commentData.dataValues.user_id) {
                    const checkLenght = postData.dataValues.content.length
                    let subStr = postData.dataValues.content.substring(0, 15);
                    if (checkLenght > 15) {
                        subStr = subStr + "..."
                    }

                    const notification = {
                        user_id: postData.dataValues.user_id,
                        noti_text: userData.dataValues.name + " กล่าวถึงคุณในในความคิดเห็นใน " + subStr,
                        noti_type: "tag",
                        group_id_target: null,
                        post_id_target: post_id,
                        user_id_actor: user_id,
                        comment_id_target: null,
                        read: false,
                        create_at: new Date(),
                    };
                    zpNotificationsModel.create(notification)

                }

            }
        }

        return { status: 'success' };
    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }
}

async function seachUserAndGroup(keywords, isGroup, userId) {
    try {
        if (isGroup) {
            const groups = await zpGroupsModel.findAll({
                where: {
                    [Op.or]: [
                        { name: { [Op.like]: `%${keywords}%` } },
                    ],
                    group_id: {
                        [Op.in]: Sequelize.literal(
                            `(SELECT DISTINCT group_id FROM user_groups WHERE user_id = ${userId})`
                        ),
                    },
                },
                attributes: ["group_id", "name", "image_group"],
            }).then(groups => groups.map(group => ({ ...group.toJSON(), type: 'group' })));

            var fuse = new Fuse([...groups], {
                keys: ["name"],
            });

        } else {
            const users = await zpUsersModel.findAll({
                where: {
                    [Op.or]: [
                        { name: { [Op.like]: `%${keywords}%` } },
                        { fullname: { [Op.like]: `%${keywords}%` } },
                    ],
                },
                attributes: ["id", "name", "avatar", "provider", "code_user"],
            }).then(users => users.map(user => ({ ...user.toJSON(), type: 'user' })));

            const groups = await zpGroupsModel.findAll({
                where: {
                    [Op.or]: [
                        { name: { [Op.like]: `%${keywords}%` } },
                    ],
                },
                attributes: ["group_id", "name", "image_group"],
            }).then(groups => groups.map(group => ({ ...group.toJSON(), type: 'group' })));

            var fuse = new Fuse([...users, ...groups], {
                keys: ["name"],
            });

        }

        let sliceArr = fuse.search(keywords);
        const result = sliceArr.slice(0, 7);
        return { status: "success", result };

    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }
}

export {
    getTotalComment,
    createComments,
    getInfinitePosts,
    createPostGroups,
    getPostComments,
    getPostReplyComments,
    likePost,
    seachUserAndGroup,
    getLikesPost,
    getPostsById,
    getPathPostId
}