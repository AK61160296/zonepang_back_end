import { Sequelize, Op } from 'sequelize';
import { connectDb } from '../config/database.js'
import { zpGroupsModel, zpUserGroupsModel, zpUsersModel, zpPinsModel, zpPostsModel } from '../models/index.js';
import * as cheerio from "cheerio";
import { URL } from "url";
import axios from 'axios';

async function getGroupsAll() {
    try {
        const groups = await zpGroupsModel.findAll();
        return { status: 'success', data: groups };
    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }
}

async function getGroupsByUserId(userId) {
    try {

        const groups = await zpUserGroupsModel.findAll({
            where: {
                user_id: userId,
                group_id: {
                    [Op.notIn]: Sequelize.literal(
                        `(SELECT DISTINCT group_id FROM pins WHERE user_id = ${userId})`
                    ),
                },
            },
            include: [{
                model: zpGroupsModel,
                foreignKey: 'group_id'
            }],

        });
        return { status: 'success', groups };
    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }
}
async function getGroupssuggest() {
    try {
        const groups = await zpGroupsModel.findAll();
        return { status: 'success', groups };
    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }
}
async function getGroupsmore(userId) {
    try {
        const groups = await zpGroupsModel.findAll({
            where: {
                group_id: {
                    [Op.notIn]: Sequelize.literal(
                        `(SELECT DISTINCT group_id FROM user_groups WHERE user_id = ${userId})`
                    ),
                },
            },
        });
        return { status: 'success', groups };
    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }
}

async function getPathGroups() {
    try {
        const groupId = await zpGroupsModel.findAll({ attributes: ['group_id'] }

        );

        return { status: 'success', groupId };
    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }
}
async function getGroupsById(id) {
    try {

        const groups = await zpGroupsModel.findAll({
            where: {
                group_id: id,
            }
        });
        return { status: 'success', data: groups };
    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }
}

async function getPinGroups(userId) {
    try {
        const groups = await zpPinsModel.findAll({
            where: {
                user_id: userId,
            },
            include: [{
                model: zpGroupsModel,
            }],
            order: [['sort', 'ASC']],
        });
        const promises = groups.map(async (group) => {
            const { group_id } = group.group;
            const totalPost = await zpPostsModel.count({
                where: {
                    group_id,
                },
            });
            const totalUserGroups = await zpUserGroupsModel.count({
                where: {
                    group_id,
                },
            });
            return {
                ...group.toJSON(),
                totalPost,
                totalUserGroups,
            };
        });
        const results = await Promise.all(promises);
        return { status: 'success', data: results };
    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }
}

async function addPinGroup(userId, group_id, type) {
    try {
        if (type === "pin") {
            let sortLast = await zpPinsModel.findAll({
                user_id: userId,
                attributes: [[Sequelize.fn('max', Sequelize.col('sort')), 'maxSort']],
                raw: true,
            })
            console.log(sortLast[0]['maxSort'])
            const pin = await zpPinsModel.create({
                user_id: userId,
                group_id: group_id,
                sort: sortLast[0]['maxSort'] + 1
            });
        } else if (type === "dispin") {
            const pin = await zpPinsModel.destroy({
                where: {
                    user_id: userId,
                    group_id: group_id,
                }
            });
            const pins = await zpPinsModel.findAll({
                where: {
                    user_id: userId,
                },
                order: [['sort', 'ASC']],
            });
            console.log(JSON.stringify(pins));
            // อัพเดทลำดับ sort ใหม่โดยใช้คำสั่ง sort และ loop
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

async function sortPinGroup(newItems) {
    try {
        const items = newItems.map((item, index) => ({
            id: item.id,
            sort: index + 1,
        }));

        const promises = items.map((item) =>
            zpPinsModel.update(
                { sort: item.sort },
                { where: { pin_id: item.id } } // กำหนดค่า group_id ตามต้องการ
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
    sortPinGroup,
    addPinGroup,
    getPinGroups,
    getGroupsAll,
    getGroupsmore,
    getGroupssuggest,
    getGroupsByUserId,
    getPathGroups,
    getGroupsById
}