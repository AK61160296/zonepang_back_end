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

async function settingNotification() {

    try {

        return { status: 'success' };
    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }

}

async function getUserProfile(userId) {

    try {
        const userProfile = await zpUsersModel.findOne({
            where: {
                code_user: userId
            }
        })
        return { status: 'success', userProfile };
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
    getUserProfile,
    getUserPath
}