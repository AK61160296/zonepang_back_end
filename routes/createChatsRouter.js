
const createChatsRouter = express.Router();
import { addMessages } from '../controller/chatsController.js';
import path from 'path'
import express from 'express';

createChatsRouter.post('/addMessages', async function (req, res) {
    try {
        const { from, to, message } = req.body;

        const resData = await addMessages(from, to, message);
        res.json(resData);
    } catch (error) {
        console.log(error)
    }
});




export { createChatsRouter };