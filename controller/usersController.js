import { Sequelize, Op } from 'sequelize';
import { connectDb } from '../config/database.js'
import { zpPostsModel, zpUsersModel, zpAttchmentsPostsModel, zpCommentsModel, zpLikesModel, zpGroupsModel, zpMatchAttachmentsModel, zpBookmarksModel, zpFollowsModel } from '../models/index.js';
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

export {
    followUser
}