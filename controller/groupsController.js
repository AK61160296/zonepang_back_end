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
async function getGroupsmore() {
    try {
        const groups = await zpGroupsModel.findAll();
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

async function addPinGroup(user_id, group_id, type) {
    try {
        if (type === "pin") {
            let sortLast = await zpPinsModel.findAll({
                user_id,
                attributes: [[Sequelize.fn('max', Sequelize.col('sort')), 'maxSort']],
                raw: true,
            })
            console.log(sortLast[0]['maxSort'])
            const pin = await zpPinsModel.create({
                user_id,
                group_id,
                sort: sortLast[0]['maxSort'] + 1
            });
        } else if (type === "dispin") {
            const pin = await zpPinsModel.destroy({
                where: {
                    user_id,
                    group_id
                }
            });
            const pins = await zpPinsModel.findAll({
                where: {
                    user_id,
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

export {
    addPinGroup,
    getPinGroups,
    getGroupsAll,
    getGroupsmore,
    getGroupssuggest,
    getGroupsByUserId,
    getPathGroups,
    getGroupsById
}