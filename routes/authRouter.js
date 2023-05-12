
const authRouter = express.Router();
import { login, register, sendOTP, verifyOTP, changePassword, verifyPassword } from '../controller/authController.js';
import path from 'path'
import express from 'express';
import multer from "multer";
import AWS from 'aws-sdk'
import multerS3 from 'multer-s3'


authRouter.post('/authentication', async function (req, res) {
    try {
        const { email, password } = req.body
        const auth = await login(email, password);
        res.json(auth);
    } catch (error) {
        console.log(error)
    }
});

authRouter.post('/register', async function (req, res) {
    try {
        const { name, tel, email, password } = req.body
        const auth = await register(name, tel, email, password);
        res.json(auth);
    } catch (error) {
        console.log(error)
    }
});
authRouter.post('/sendOTP', async function (req, res) {
    try {
        const { countryCode, phoneNumber } = req.body
        const otp = await sendOTP(countryCode, phoneNumber);
        res.json(otp);
    } catch (error) {
        console.log(error)
    }
});
authRouter.post('/verifyOTP', async function (req, res) {
    try {
        const { countryCode, phoneNumber, otp } = req.body
        const verifiedOTP = await verifyOTP(countryCode, phoneNumber, otp);
        res.json(verifiedOTP);
    } catch (error) {
        console.log(error)
    }
});
authRouter.post('/verifyPassword', async function (req, res) {
    try {
        const { phoneNumber, new_password } = req.body
        const verifiedOTP = await verifyPassword(phoneNumber, new_password);
        res.json(verifiedOTP);
    } catch (error) {
        console.log(error)
    }
});
authRouter.post('/changePassword', async function (req, res) {
    try {
        const { user_id, old_password, new_password } = req.body
        const verifiedOTP = await changePassword(user_id, old_password, new_password);
        res.json(verifiedOTP);
    } catch (error) {
        console.log(error)
    }
});


export { authRouter };