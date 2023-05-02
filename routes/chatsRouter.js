
const chatsRouter = express.Router();
import { addMessages, getMessages } from '../controller/chatsController.js';
import path from 'path'
import express from 'express';

chatsRouter.get('/getMessages', async function (req, res) {
    try {
        const userId = req.query.userId
        const message = await getMessages(userId);
        res.json(message);
    } catch (error) {
        console.log(error)
    }
});




export { chatsRouter };