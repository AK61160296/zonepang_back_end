import { Sequelize, Op } from 'sequelize';
import { connectDb } from '../config/database.js'
import { zpPostsModel, zpUsersModel, zpAttchmentsPostsModel, zpCommentsModel, zpLikesModel, zpGroupsModel, zpMatchAttachmentsModel, zpBookmarksModel } from '../models/index.js';
import * as cheerio from "cheerio";
import { URL } from "url";
import axios from 'axios';

async function bookmarkPost(userId, post_id, type) {
    try {
        if (type === "bookmark") {
            let sortLast = await zpBookmarksModel.findAll({
                user_id: userId,
                attributes: [[Sequelize.fn('max', Sequelize.col('sort')), 'maxSort']],
                raw: true,
            })
            const bookmark = await zpBookmarksModel.create({
                user_id: userId,
                post_id: post_id,
                sort: sortLast[0]['maxSort'] + 1,
                create_at: Date.now(),
                update_at: Date.now()
            });
        } else if (type === "disbookmark") {
            const bookmark = await zpBookmarksModel.destroy({
                where: {
                    user_id: userId,
                    post_id: post_id,
                }
            });
            const bookmarks = await zpBookmarksModel.findAll({
                where: {
                    user_id: userId,
                },
                order: [['sort', 'ASC']],
            });
            let sort = 1;
            for (const bookmark of bookmarks) {
                await bookmark.update({ sort });
                sort++;
            }
        }

        return { status: 'success' };
    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }
}


async function sortBookmark(newItems) {
    try {
        const items = newItems.map((item, index) => ({
            id: item.id,
            sort: index + 1,
        }));

        const promises = items.map((item) =>
            zpBookmarksModel.update(
                { sort: item.sort },
                { where: { bookmark_id: item.id } } // กำหนดค่า group_id ตามต้องการ
            )
        );
        await Promise.all(promises);

        return { status: 'success' };
    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }
}
export {
    sortBookmark,
    bookmarkPost
}