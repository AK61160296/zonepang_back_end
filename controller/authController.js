import { Sequelize, Op } from 'sequelize';
import { connectDb } from '../config/database.js'
import { zpGroupsModel, zpUserGroupsModel, zpUsersModel } from '../models/index.js';
import * as cheerio from "cheerio";
import { URL } from "url";
import axios from 'axios';

async function editProfile(user_id, userName, userBio, files) {
    try {
        // หา user ด้วย user_id จากฐานข้อมูล
        const user = await zpUsersModel.findOne({ where: { id: user_id } });
        console.log(user)
        // // อัพเดทข้อมูล
        const fileName = files[0].key;
        const cleanFileName = fileName.replace(/^avatar\//i, "");

        user.avatar = cleanFileName;
        user.name = userName;
        user.bio = userBio;

        // // บันทึกข้อมูลลงฐานข้อมูล
        await user.save();

        return { user };
    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }
}


export {
    editProfile,
}