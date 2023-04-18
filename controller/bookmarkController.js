import { Sequelize, Op } from 'sequelize';
import { connectDb } from '../config/database.js'
import { zpPostsModel, zpUsersModel, zpAttchmentsPostsModel, zpCommentsModel, zpLikesModel, zpGroupsModel, zpMatchAttachmentsModel, zpBookmarksModel } from '../models/index.js';
import * as cheerio from "cheerio";
import { URL } from "url";
import axios from 'axios';

async function bookmarkPost(userId, post_id, type) {
    try {
        if (type === "bookmark") {
            // let sortLast = await zpBookmarksModel.findAll({
            //     user_id: userId,
            //     attributes: [[Sequelize.fn('max', Sequelize.col('sort')), 'maxSort']],
            //     raw: true,
            // })
            const bookmark = await zpBookmarksModel.create({
                user_id: userId,
                post_id: post_id,
                // sort: sortLast[0]['maxSort'] + 1,
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
            // const bookmarks = await zpBookmarksModel.findAll({
            //     where: {
            //         user_id: userId,
            //     },
            //     order: [['sort', 'ASC']],
            // });
            // let sort = 1;
            // for (const bookmark of bookmarks) {
            //     await bookmark.update({ sort });
            //     sort++;
            // }
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

async function getBookmarks(userId) {
    try {
        let bookmarksUnpin = await zpBookmarksModel.findAll({
            where: {
                user_id: userId,
                pin: 0
            },
            order: [['create_at', 'asc']],
            include: [
                {
                    model: zpPostsModel,
                    required: false,
                    include: [
                        {
                            model: zpUsersModel,
                            attributes: ['id', 'name', 'avatar'],
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
                },
            ]
        })
        let bookmarkspin = await zpBookmarksModel.findAll({
            where: {
                user_id: userId,
                pin: {
                    [Op.ne]: 0
                }
            },
            order: [['sort', 'asc']],
            include: [
                {
                    model: zpPostsModel,
                    required: false,
                    include: [
                        {
                            model: zpUsersModel,
                            attributes: ['id', 'name', 'avatar'],
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
                },
            ]
        })
        const getModifiedPost = async (bookmark) => {
            let attachments = [];
            let atm_post_ids = [];
            if (bookmark.post.match_attachments && bookmark.post.match_attachments.length > 0) {
                atm_post_ids = bookmark.post.match_attachments[0].atm_post_id.split(',');

                // Query the zpAttchmentsPostsModel for the required information
                attachments = await zpAttchmentsPostsModel.findAll({
                    where: {
                        atm_post_id: {
                            [Op.in]: atm_post_ids
                        }
                    }
                });
            }


            return {
                ...bookmark.get({ plain: true }),
                attachments,
            };
        };

        bookmarkspin = await Promise.all(bookmarkspin.map(bookmark => getModifiedPost(bookmark)));
        bookmarksUnpin = await Promise.all(bookmarksUnpin.map(bookmark => getModifiedPost(bookmark)));

        return { status: 'success', bookmarksUnpin, bookmarkspin };
    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }
}
export {
    sortBookmark,
    bookmarkPost,
    getBookmarks
}