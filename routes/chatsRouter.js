
const chatsRouter = express.Router();
import { addMessages, getConversations, getMessages } from '../controller/chatsController.js';
import path from 'path'
import express from 'express';
import multer from "multer";
import AWS from 'aws-sdk'
import multerS3 from 'multer-s3'

chatsRouter.post('/getConversations', async function (req, res) {
    try {
        const userId = req.body.userId
        const conversations = await getConversations(userId);
        res.json(conversations);
    } catch (error) {
        console.log(error)
    }
});

chatsRouter.post('/getMessages', async function (req, res) {
    try {
        const { from, to } = req.body;
        const messages = await getMessages(from, to);
        res.json(messages);
    } catch (error) {
        console.log(error)
    }
});



export { chatsRouter };