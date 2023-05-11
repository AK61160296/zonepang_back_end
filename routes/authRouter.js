
const authRouter = express.Router();
import { login, register, verifyUser } from '../controller/authController.js';
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
authRouter.post('/verifyUser', async function (req, res) {
    try {
        const { tel } = req.body
        const auth = await verifyUser(tel);
        res.json(auth);
    } catch (error) {
        console.log(error)
    }
});



export { authRouter };