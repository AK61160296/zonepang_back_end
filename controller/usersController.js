import { Sequelize, Op } from 'sequelize';
import { connectDb } from '../config/database.js'
import { zpPostsModel, zpUserSettingsModel, zpUsersModel, zpAttchmentsPostsModel, zpCommentsModel, zpLikesModel, zpGroupsModel, zpMatchAttachmentsModel, zpBookmarksModel, zpFollowsModel } from '../models/index.js';
import * as cheerio from "cheerio";
import { URL } from "url";
import axios from 'axios';

async function followUser(userId, userFollowId, type) {
    try {
        try {
            if (type == 'follow') {
                const userGroup = await zpFollowsModel.create({
                    user_id: userId,
                    user_follow_id: userFollowId,
                    create_at: Date.now(),
                    update_at: Date.now()
                });
            } else {
                const userGroup = await zpFollowsModel.destroy({
                    user_id: userId,
                    user_follow_id: userFollowId,
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

async function getSettingNotification(userId) {

    try {
        const settingNoti = await zpUserSettingsModel.findOne({
            where: {
                user_id: userId
            }
        })
        return { status: 'success', settingNoti };
    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }

}


async function settingNotification(userId, all, comment, follow, tag, group) {
    try {
        if (all) {
            var settingData = {
                all: true,
                comment: false,
                follow: false,
                tag: false,
                group: false,
            };
        } else {
            var settingData = {
                all: all,
                comment: comment,
                follow: follow,
                tag: tag,
                group: group,
            };


        }

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

async function getUserProfile(userProfileId, userId) {

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

        let isFollow = await zpFollowsModel.findOne({
            where: {
                user_id: userId,
                user_follow_id: userProfile.id
            }
        })
        if (isFollow) {
            isFollow = true
        } else {
            isFollow = false
        }

        return { status: 'success', userProfile, postCount, follower, following, isFollow };
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



export {
    followUser,
    settingNotification,
    getSettingNotification,
    getUserProfile,
    getUserPath
}