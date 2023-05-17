import { Sequelize, Op } from 'sequelize';
import { connectDb } from '../config/database.js'
import { zpNotificationsModel } from '../models/notification.js';
import { zpConversationsModel } from '../models/index.js';
import { zpPostsModel, zpUserSettingsModel, zpUsersModel, zpAttchmentsPostsModel, zpCommentsModel, zpLikesModel, zpGroupsModel, zpMatchAttachmentsModel, zpBookmarksModel, zpFollowsModel } from '../models/index.js';
import * as cheerio from "cheerio";
import { URL } from "url";
import axios from 'axios';

async function followUser(userId, userFollowId, type) {
    try {
        try {
            if (type == 'follow') {
                const userFollow = await zpFollowsModel.create({
                    user_id: userId,
                    user_follow_id: userFollowId,
                    create_at: Date.now(),
                    update_at: Date.now()
                });
                createNotificationFollow(userId, userFollowId)

            } else {
                const userFollow = await zpFollowsModel.destroy({
                    where: {
                        user_id: userId,
                        user_follow_id: userFollowId,
                    }
                });
                const updateConversationMe = await zpConversationsModel.updateOne(
                    {
                        user_id: userId,
                        sender_id: userFollowId,
                    },
                    {

                        isFollow: false
                    });
                const updateConversationSender = await zpConversationsModel.updateOne(
                    {
                        user_id: userFollowId,
                        sender_id: userId,
                    },
                    {
                        isFollow: false
                    });
            }

            return { status: 'success' };
        } catch (error) {
            console.error(error);
            return { status: 'error', error: error };
        }

    } catch (error) {

    }

}

async function createNotificationFollow(userId, userFollowId) {
    try {

        const userData = await zpUsersModel.findOne({
            attributes: ['id', 'name', 'avatar', 'code_user'],
            where: {
                id: userId
            }
        })

        const checkSettingNoti = await zpUserSettingsModel.findOne({
            where: {
                user_id: userFollowId
            }
        })
        const checkSettingNotiObj = JSON.parse(checkSettingNoti.dataValues.setting);
        if (checkSettingNotiObj.follow) {
            const notification = {
                user_id: userFollowId,
                noti_text: userData.dataValues.name + " เริ่มติดตามคุณ",
                noti_type: "follow",
                group_id_target: null,
                post_id_target: null,
                user_id_actor: userId,
                comment_id_target: null,
                read: false,
                create_at: new Date(),
            };
            zpNotificationsModel.create(notification)
        }

        return { status: 'success' };
    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }
}

async function getSettingNotification(userId) {

    try {
        const settingNoti = await zpUserSettingsModel.findOne({
            where: {
                user_id: userId
            }
        })
        const setting = JSON.parse(settingNoti.setting);

        return { status: 'success', settingNoti };
    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }

}


async function settingNotification(userId, all, comment, follow, tag, group, like) {
    try {
        var settingData = {
            all: all,
            comment: comment,
            follow: follow,
            tag: tag,
            group: group,
            like: like,
        };

        const stringifiedSettingData = JSON.stringify(settingData);

        const result = await zpUserSettingsModel.update(
            {
                setting: stringifiedSettingData,
            },
            {
                where: {
                    user_id: userId,
                },
            }
        );

        return { status: "success" };
    } catch (error) {
        console.error(error);
        return { status: "error", error: error };
    }
}

async function getUserProfile(userProfileId) {

    try {

        const userProfile = await zpUsersModel.findOne({
            where: {
                code_user: userProfileId
            }
        })

        const postCount = await zpPostsModel.count({
            where: {
                user_id: userProfile.id
            }
        })

        const follower = await zpFollowsModel.count({
            where: {
                user_id: userProfile.id
            }
        })

        const following = await zpFollowsModel.count({
            where: {
                user_follow_id: userProfile.id
            }
        })

        return { status: 'success', userProfile, postCount, follower, following };
    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }

}

async function getUserPath() {

    try {
        const userPath = await zpUsersModel.findAll({
            attributes: ["code_user"]
        })
        return { status: 'success', userPath };
    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }

}

async function getUserFollow(userId) {

    try {
        const userData = await zpFollowsModel.findAll({
            where: {
                user_id: userId
            },
            include: [
                {
                    model: zpUsersModel,
                    required: true,
                    attributes: ['id', 'name', 'avatar', 'code_user', 'provider', [
                        Sequelize.literal(`(
                      SELECT COUNT(*) 
                      FROM follows 
                      WHERE follows.user_follow_id = id
                    )`),
                        'follow_count'
                    ]],

                },
            ]
        })
        const promises = userData.map(async (user) => {
            let isOnline = false

            if (onlineUsersSystem.has(user.user.id)) {
                isOnline = true
            }
            return {
                ...user.toJSON(),
                isOnline
            }
        })

        const userFollow = await Promise.all(promises)


        return { status: 'success', userFollow };
    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }

}
async function checkFollow(userId, userFollowId) {
    try {
        let isFollow = false
        const status = await zpFollowsModel.count({
            where: {
                user_id: userId,
                user_follow_id: userFollowId
            }
        });
        if (status > 0) {
            isFollow = true
        }


        return { isFollow };
    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }
}


export {
    checkFollow,
    followUser,
    getUserFollow,
    settingNotification,
    getSettingNotification,
    getUserProfile,
    getUserPath
}