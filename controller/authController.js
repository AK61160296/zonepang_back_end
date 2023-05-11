import { Sequelize, Op, DATE } from 'sequelize';
import { connectDb } from '../config/database.js'
import { zpGroupsModel, zpUserGroupsModel, zpUsersModel, zpUserSettingsModel } from '../models/index.js';
import * as cheerio from "cheerio";
import { URL } from "url";
import axios from 'axios';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';

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

async function register(name, tel, email, password) {
    try {
        // ตรวจสอบว่ามีอีเมลนี้ในระบบหรือยัง
        const existingUser = await zpUsersModel.findOne({ where: { email: email } });
        if (existingUser) {
            return { status: 'error', message: 'Email already exists' };
        }

        const existingPhoneNumber = await zpUsersModel.findOne({ where: { phone: tel } });
        if (existingPhoneNumber) {
            return { status: 'error', message: 'Phone number already exists' };
        }


        // ถ้ายังไม่มีให้สร้างผู้ใช้ใหม่
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await zpUsersModel.create({
            name: name,
            email: email,
            phone: tel,
            full_name: name,
            provider: 'email',
            avatar: null,
            password: hashedPassword,
            created_at: Date.now(),
            updated_at: Date.now(),
        });
        let randomSixDigitInt;
        let checkCodeUser;
        do {
            randomSixDigitInt = 'UD' + newUser.id + (Math.random() * 100000000).toFixed(0);
            checkCodeUser = await zpUsersModel.findOne({
                where: {
                    code_user: randomSixDigitInt
                }
            });
        } while (checkCodeUser !== null);


        newUser.update({
            code_user: randomSixDigitInt
        });
        if (newUser) {
            var settingData = {
                all: true,
                comment: true,
                follow: true,
                tag: true,
                group: true,
                like: true,
            };

            const stringifiedSettingData = JSON.stringify(settingData);

            await zpUserSettingsModel.create(
                {
                    user_id: newUser.id,
                    setting: stringifiedSettingData,
                    create_at: Date.now(),
                    update_at: Date.now(),
                },

            );
        }


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

async function verifyUser(tel) {
    try {
        const phone = tel;
        const otp = Math.floor(100000 + Math.random() * 900000);
        const nexmo_url = 'https://rest.nexmo.com/sms/json';

        const data = {
            api_key: process.env.OTP_API_KEY,
            api_secret: process.env.OTP_API_SECRET,
            to: phone,
            from: 'BebFans',
            text: `BebFans OTP for Withdrawal is ${otp}`,
        };

        fetch(nexmo_url, {
            method: 'POST',
            body: new URLSearchParams(data),
        })
            .then((res) => res.json())
            .then((json) => {
                return { status: 'error', json };
            })
            .catch((err) => {
                return { status: 'error', error: err };
            });

    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }
}

export {
    editProfile,
    login,
    register,
    verifyUser
}