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
        var posts = await zpPostsModel.findAll({
            where: {
                user_id: userIdProfile
            },
            limit: limit,
            offset: offset,
            order: [['create_at', 'desc']],
            include: [
                {
                    model: zpUsersModel,
                    attributes: ['id', 'name', 'avatar'],
                    required: true
                },      
            ]
        });
    } catch (error) {

    }

}


export {
    getNotificationByUserId,
}