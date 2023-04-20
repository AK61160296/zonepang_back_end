import { Sequelize, Op } from 'sequelize';
import { connectDb } from '../config/database.js'
import { zpHistorySearchsModel, zpPostsModel, zpUsersModel, zpAttchmentsPostsModel, zpCommentsModel, zpLikesModel, zpGroupsModel, zpMatchAttachmentsModel, zpBookmarksModel, zpFollowsModel } from '../models/index.js';
import * as cheerio from "cheerio";
import { URL } from "url";
import axios from 'axios';

async function addSeachHistory(userId, name, userSearchId, groupSearchId, fileName, type) {
    try {
        let checkDuplicate = false;
        let checkGroup = null;
        if (type === 'group') {
            checkGroup = await zpHistorySearchsModel.findOne({
                where: {
                    user_id: userId,
                    group_search_id: groupSearchId,
                },
            });
            if (checkGroup) {
                checkDuplicate = true;
            }
        }

        if (type === 'user') {
            checkGroup = await zpHistorySearchsModel.findOne({
                where: {
                    user_id: userId,
                    user_search_id: userSearchId,
                },
            });
            if (checkGroup) {
                checkDuplicate = true;
            }
        }
        if (checkDuplicate == false) {
            const deleteHis = await zpHistorySearchsModel.create({
                user_id: userId,
                name: name,
                user_search_id: userSearchId,
                group_search_id: groupSearchId,
                file_name: fileName,
                type: type,
                create_at: Date.now(),
                update_at: Date.now()
            });
            const count = await zpHistorySearchsModel.count({ user_id: userId });
            if (count >= 7) {
                const searchResult = await zpHistorySearchsModel.findOne({
                    where: {
                        user_id: userId
                    },
                    order: [['create_at', 'ASC']]
                });
                if (searchResult) {
                    await searchResult.destroy();
                }
            }
            return { status: 'success' };
        } else {
            const updateResult = await checkGroup.update({
                create_at: Date.now(),
                update_at: Date.now()
            });

            return { status: 'success' };

        }
    } catch (error) {
        console.error(error);
        throw new Error(error);
    }
}

async function deleteSeachHistory(id) {
    try {
        try {
            const history = await zpHistorySearchsModel.destroy({
                where: {
                    history_id: id
                },
            });
            return { status: 'success' };
        } catch (error) {
            console.error(error);
            return { status: 'error', error: error };
        }

    } catch (error) {

    }
}


async function seachHistory(userId) {
    try {
        try {
            const history = await zpHistorySearchsModel.findAll({
                where: {
                    user_id: userId
                },
                order: [['create_at', 'desc']]

            });

            return { status: 'success', history };
        } catch (error) {
            console.error(error);
            return { status: 'error', error: error };
        }

    } catch (error) {

    }
}

export {
    seachHistory,
    deleteSeachHistory,
    addSeachHistory
}