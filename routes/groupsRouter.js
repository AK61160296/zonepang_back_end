import express from 'express';
const groupsRouter = express.Router();
import { getGroupsAll, getGroupsByUserId, getGroupsmore, getPathGroups, getGroupsById,getGroupssuggest } from '../controller/groupsController.js';

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

groupsRouter.get('/getPathGroups', async function (req, res) {
    try {
        const groupsPath = await getPathGroups();
        res.json(groupsPath);
    } catch (error) {
        console.log(error)
    }
});
groupsRouter.post('/getGroupssuggest', async function (req, res) {
    try {
        const userId = req.body.userId;
        const groups = await getGroupssuggest(userId);
        res.json(groups);
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
groupsRouter.get('/getGroupsById', async function (req, res) {
    try {
        const userId = req.query.id;
        // console.log(req.body);
        const groups = await getGroupsById(userId);
        res.json({
            data: groups
        });
    } catch (error) {
        console.log(error)
    }
});

export { groupsRouter };