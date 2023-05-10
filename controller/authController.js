import { Sequelize, Op } from 'sequelize';
import { connectDb } from '../config/database.js'
import { zpGroupsModel, zpUserGroupsModel, zpUsersModel } from '../models/index.js';
import * as cheerio from "cheerio";
import { URL } from "url";
import axios from 'axios';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

async function editProfile(user_id, userName, userBio, files) {
    try {
        // หา user ด้วย user_id จากฐานข้อมูล
        const user = await zpUsersModel.findOne({ where: { id: user_id } });
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

async function login(email, password) {
    try {
        const user = await zpUsersModel.findOne({ where: { email: email } });
        if (!user) {
            return { status: 'error', message: 'User not found' };
        }

        const passwordMatches = await bcrypt.compare(password, user.password);
        if (passwordMatches) {
            const token = generateToken(user);
            return { status: 'success', user, token };
        } else {
            return { status: 'error', message: 'Invalid password' };
        }
    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }
}

async function register(name, email, password) {
    try {
        // ตรวจสอบว่ามีอีเมลนี้ในระบบหรือยัง
        const existingUser = await zpUsersModel.findOne({ where: { email: email } });
        if (existingUser) {
            return { status: 'error', message: 'Email already exists' };
        }

        // ถ้ายังไม่มีให้สร้างผู้ใช้ใหม่
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await zpUsersModel.create({ name, email, password: hashedPassword });

        // สร้าง JWT token ให้ผู้ใช้ใหม่
        const token = generateToken(newUser);

        return { status: 'success', user: newUser, token };
    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }
}


function generateToken(user) {
    const payload = {
        userId: user.id,
        email: user.email,
        isAdmin: user.is_admin,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET_TOKEN, { expiresIn: '10 days' });
    return token;
}

export {
    editProfile,
    login,
    register
}