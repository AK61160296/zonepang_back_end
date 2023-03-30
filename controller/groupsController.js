import { Sequelize, Op } from 'sequelize';
import { connectDb } from '../config/database.js'
import { zpGroupsModel, zpUserGroupsModel, zpUserModel } from '../models/index.js';
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
        return { status: 'success', data: groups };
    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }
}

export {
    getGroupsAll,
    getGroupsByUserId
}