import { Sequelize, Op } from 'sequelize';
import { connectDb } from '../config/database.js'
import { zpGroupsModel, zpUserGroupsModel, zpUsersModel, zpPinsModel } from '../models/index.js';
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
        return { status: 'success', data: groups };
    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }
}

export {
    getPinGroups,
    getGroupsAll,
    getGroupsmore,
    getGroupssuggest,
    getGroupsByUserId,
    getPathGroups,
    getGroupsById
}