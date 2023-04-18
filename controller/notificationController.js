import { Sequelize, Op } from 'sequelize';
import { connectDb } from '../config/database.js'
import { zpNotificationsModel, zpPostsModel, zpUserSettingsModel, zpUsersModel, zpAttchmentsPostsModel, zpCommentsModel, zpLikesModel, zpGroupsModel, zpMatchAttachmentsModel, zpBookmarksModel, zpFollowsModel } from '../models/index.js';
import * as cheerio from "cheerio";
import { URL } from "url";
import axios from 'axios';

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
            if (noti.group_id_active) {
                groupDetail = await zpGroupsModel.findAll({
                    where: {
                        group_id: noti.group_id_active
                    },
                });
            }
            if (noti.post_id_active) {
                postDetail = await zpPostsModel.findAll({
                    where: {
                        post_id: noti.post_id_active
                    },
                });
            }

            if (noti.user_id_active) {
                userActive = await zpUsersModel.findAll({
                    where: {
                        id: noti.user_id_active
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