import { Sequelize, Op } from 'sequelize';
import { connectDb } from '../config/database.js'
import { zpUsersModel, zpPinAppFreeModel, zpAppFreeModel } from '../models/index.js';
import * as cheerio from "cheerio";
import { URL } from "url";
import axios from 'axios';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


async function getAppFree(userId) {
    try {
        const appPinDatas = await zpAppFreeModel.findAll({
        });
        const promises = appPinDatas.map(async (pinData) => {
            let isPin = false
            const checkPin = await zpPinAppFreeModel.count({
                where: {
                    app_free_id: pinData.app_free_id,
                    user_id: userId
                }
            });
            if (checkPin > 0) {
                isPin = true
            }

            return {
                ...pinData.toJSON(),
                isPin,
            };
        });
        const results = await Promise.all(promises);
        return { status: 'success', results };
    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }
}

async function pinAppFree(userId, app_free_id, type) {
    try {
        if (type === "pin") {
            let sortLast = await zpPinAppFreeModel.findAll({
                attributes: [[Sequelize.fn('max', Sequelize.col('sort')), 'maxSort']],
                raw: true,
            }, {
                where: {
                    user_id: userId,
                }
            }
            )
            const pin = await zpPinAppFreeModel.create({
                user_id: userId,
                app_free_id: app_free_id,
                sort: sortLast[0]['maxSort'] + 1
            });
        } else if (type === "dispin") {
            const pin = await zpPinAppFreeModel.destroy({
                where: {
                    user_id: userId,
                    app_free_id: app_free_id,
                }
            });
            const pins = await zpPinAppFreeModel.findAll({
                where: {
                    user_id: userId,
                },
                order: [['sort', 'ASC']],
            });

            let sort = 1;
            for (const pin of pins) {
                await pin.update({ sort });
                sort++;
            }
        }

        return { status: 'success' };
    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }
}

async function sortPinAppFree(newItems) {
    try {
        const items = newItems.map((item, index) => ({
            id: item.id,
            sort: index + 1,
        }));

        const promises = items.map((item) =>
            zpPinAppFreeModel.update(
                { sort: item.sort },
                { where: { pin_id: item.id } }
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
    getAppFree,
    pinAppFree,
    sortPinAppFree
}