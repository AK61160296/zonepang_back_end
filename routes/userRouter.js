import express from 'express';
const userRouter = express.Router();
import { getGroupsAll, getGroupsByUserId } from '../controller/groupsController.js';


userRouter.post('/editProfile', async function (req, res) {
    try {
        res.json({
            data: "ควยเต๋า"
        });
    } catch (error) {
        console.log(error)
    }
});

export { userRouter };