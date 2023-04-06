import express from 'express';
const groupsRouter = express.Router();
import { getGroupsAll, getGroupsByUserId, getGroupsmore } from '../controller/groupsController.js';

groupsRouter.get('/getGroupsAll', async function (req, res) {
    try {
        const groups = await getGroupsAll();
        res.json({
            data: groups
        });
    } catch (error) {
        console.log(error)
    }
});
groupsRouter.post('/getGroupsByUserId', async function (req, res) {
    try {
        const userId = req.body.userId;
        const groups = await getGroupsByUserId(userId);
        res.json({
            data: groups
        });
    } catch (error) {
        console.log(error)
    }
});

groupsRouter.post('/getGroupsmore', async function (req, res) {
    try {
        const userId = req.body.userId;
        const groups = await getGroupsmore(userId);
        res.json(groups);
    } catch (error) {
        console.log(error)
    }
});

export { groupsRouter };