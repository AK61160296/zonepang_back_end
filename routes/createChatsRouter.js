
const createChatsRouter = express.Router();
import { addMessages, getMessages } from '../controller/chatsController.js';
import path from 'path'
import express from 'express';

createChatsRouter.post('/addMessages', async function (req, res) {
    try {
        const userId = req.body.userId
        const senderId = req.body.senderId
        const receiverId = req.body.receiverId
        const messageText = req.body.messageText

        const message = await addMessages(userId,senderId, receiverId, messageText);
        res.json(message);
    } catch (error) {
        console.log(error)
    }
});




export { createChatsRouter };