import { Sequelize, Op, DATE } from 'sequelize';
import { connectDb } from '../config/database.js'
import { zpGroupsModel, zpUserGroupsModel, zpUsersModel, zpUserSettingsModel } from '../models/index.js';
import * as cheerio from "cheerio";
import { URL } from "url";
import axios from 'axios';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import https from 'https';
import twilio from 'twilio';

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);


async function editProfile(user_id, userName, userBio, files) {
    try {
        // หา user ด้วย user_id จากฐานข้อมูล
        const user = await zpUsersModel.findOne({ where: { id: user_id } });
        // // อัพเดทข้อมูล
        if (files.length > 0) {
            console.log(files)
            var fileName = files[0].key;
            var cleanFileName = fileName.replace(/^avatar\//i, "");
            user.avatar = cleanFileName;
        }

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
            return { status: 'duplicate_email', message: 'Email already exists' };
        }

        const existingPhoneNumber = await zpUsersModel.findOne({ where: { phone: tel } });
        if (existingPhoneNumber) {
            return { status: 'duplicate_phone', message: 'Phone number already exists' };
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

async function sendOTP(countryCode, phoneNumber) {
    try {
        const userData = await zpUsersModel.findOne({ where: { phone: phoneNumber } });
        if (!userData) {
            return { status: 'not_found', message: 'ไม่พบเบอร์โทรศัพท์' };
        }
        if (userData.is_verify == 0) {
            const otpResponse = await client.verify.services(process.env.TWILIO_VERIFY_SID)
                .verifications.create({
                    to: `+${countryCode}${phoneNumber}`,
                    channel: "sms"
                })
            await userData.update({
                is_verify: 1,
                status_otp: 'pending',
                time_otp: Date.now()
            })
            return { status: 'success', message: `ส่งหมายเลข OTP Tel.${phoneNumber} สำเร็จ`, data: JSON.stringify(otpResponse) };
        } else {
            const currentTime = Date.now();
            const timeDiff = currentTime - userData.time_otp;
            const timeDiffInMinutes = Math.floor(timeDiff / (1000 * 60));

            if (timeDiffInMinutes < 5) {
                const remainingTime = 5 - timeDiffInMinutes;
                return { status: 'wait', message: `กรุณารอเวลาการส่ง OTP ${remainingTime} นาที` };

            } else {
                const otpResponse = await client.verify.services(process.env.TWILIO_VERIFY_SID)
                    .verifications.create({
                        to: `+${countryCode}${phoneNumber}`,
                        channel: "sms"
                    })
                await userData.update({
                    is_verify: 1,
                    status_otp: 'pending',
                    time_otp: Date.now()
                })
                return { status: 'success', message: `ส่งหมายเลข OTP Tel.${phoneNumber} สำเร็จ`, data: JSON.stringify(otpResponse) };
            }
        }
    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }
}
async function verifyOTP(countryCode, phoneNumber, otp) {
    try {
        const userData = await zpUsersModel.findOne({ where: { phone: phoneNumber } });
        if (userData.is_verify == 0) {
            return { status: 'error', message: 'กรุณาส่งหมายเลข OTP ก่อนตรวจสอบ' };
        }

        const verifiedResponse = await client.verify.services(process.env.TWILIO_VERIFY_SID)
            .verificationChecks.create({
                to: `+${countryCode}${phoneNumber}`,
                code: otp
            })

        if (verifiedResponse.status === "approved") {
            await userData.update({
                is_verify: 0,
                status_otp: 'approved',
                time_otp: Date.now()
            })
            return { status: 'success', message: 'หมายเลข OTP ถูกต้อง', data: JSON.stringify(verifiedResponse) };
        } else {
            return { status: 'error', message: 'หมายเลข OTP ไม่ถูกต้อง', data: JSON.stringify(verifiedResponse) };
        }


    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }
}
async function changPassword(phoneNumber, newPassword) {
    try {
        const userData = await zpUsersModel.findOne({ where: { phone: phoneNumber } });
        if (!userData) {
            return { status: 'not_found', message: 'User not found' };
        }

        const passwordMatches = await bcrypt.compare(newPassword, userData.password);
        if (passwordMatches) {
            return { status: 'duplicate_password', message: 'กรุณากรอกรหัสใหม่ ให้ไม่ตรงกับรหัสเก่า' };
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await userData.update({
            password: hashedPassword,
        });

        // const hashedPassword = await bcrypt.hash(password, 10);
        return { status: 'success', message: 'เปลี่ยนรหัสผ่านสำเร็จ' };

    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }
}

export {
    editProfile,
    login,
    register,
    sendOTP,
    verifyOTP,
    changPassword
}