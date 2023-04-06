import { Sequelize, Op } from 'sequelize';
import { connectDb } from '../config/database.js'
import { zpGroupsModel, zpUserGroupsModel, zpUsersModel } from '../models/index.js';
import * as cheerio from "cheerio";
import { URL } from "url";
import axios from 'axios';

async function editProfile() {
    try {

        return { status: 'success' };
    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }
}


export {
    editProfile,
}