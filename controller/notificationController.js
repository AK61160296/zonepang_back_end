import { Sequelize, Op } from 'sequelize';
import { connectDb } from '../config/database.js'
import { zpNotificationsModel, zpPostsModel, zpUserSettingsModel, zpUsersModel, zpAttchmentsPostsModel, zpCommentsModel, zpLikesModel, zpGroupsModel, zpMatchAttachmentsModel, zpBookmarksModel, zpFollowsModel } from '../models/index.js';
import * as cheerio from "cheerio";
import { URL } from "url";
import axios from 'axios';


async function createNotification(userId,typeNoti) {
    try {

        return { status: "success" }
    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }

}


async function getNotificationByUserId(page, userId) {
    try {
        const limit = 3;
        const offset = (page - 1) * limit;
        var notifications = await zpNotificationsModel.findAll({
            where: {
                user_id: userId
            },
            limit: limit,
            offset: offset,
            order: [['create_at', 'desc']],
        });

        const promises = notifications.map(async (noti) => {
            var groupDetail = {}
            var postDetail = {}
            var userActive = {}
            if (noti.group_id_target) {
                groupDetail = await zpGroupsModel.findAll({
                    where: {
                        group_id: noti.group_id_target
                    },
                });
            }
            if (noti.post_id_target) {
                postDetail = await zpPostsModel.findAll({
                    where: {
                        post_id: noti.post_id_target
                    },
                });
            }

            if (noti.user_id_target) {
                userActive = await zpUsersModel.findAll({
                    where: {
                        id: noti.user_id_target
                    },
                    attributes: ['id', 'name', 'avatar']
                });
            }

            return {
                ...noti.toJSON(),
                userActive,
                groupDetail,
                postDetail
            };
        });
        const results = await Promise.all(promises);

        return { status: "success", results }
    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }

}


export {
    getNotificationByUserId,
}