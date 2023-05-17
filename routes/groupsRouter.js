import express from 'express';
const groupsRouter = express.Router();
import { joinGroup, sortPinGroup, getGroupsAll, getGroupsByUserId, getGroupsmore, getPathGroups, getGroupsById, getGroupssuggest, getPinGroups, addPinGroup, getGroupsUser, checkJoinGroup } from '../controller/groupsController.js';
import multer from 'multer';
groupsRouter.use(multer().any());

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
        const keywords = req.body.keywords;
        const userId = req.body.userId;
        const groups = await getGroupsByUserId(keywords, userId);
        res.json({
            data: groups
        });
    } catch (error) {
        console.log(error)
    }
});
groupsRouter.post('/getGroupsUser', async function (req, res) {
    try {
        const userId = req.body.userId;
        const groups = await getGroupsUser(userId);
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
        const id = req.query.id;
        // console.log(req.body);
        const groups = await getGroupsById(id);
        res.json({
            data: groups
        });
    } catch (error) {
        console.log(error)
    }
});
groupsRouter.post('/getPinGroups', async function (req, res) {
    try {
        const userId = req.body.userId;
        const groups = await getPinGroups(userId);
        res.json(groups);
    } catch (error) {
        console.log(error)
    }
});

groupsRouter.post('/addPinGroup', async function (req, res) {
    try {
        const { userId, group_id, type } = req.body;
        const status = await addPinGroup(userId, group_id, type);
        res.json(status);
    } catch (error) {
        console.log(error)
    }
});

groupsRouter.post('/checkJoinGroup', async function (req, res) {
    try {
        const { userId, groupId } = req.body;
        const isJoin = await checkJoinGroup(userId, groupId);
        res.json(isJoin);
    } catch (error) {
        console.log(error)
    }
});


groupsRouter.put('/sortPinGroup/:id', async function (req, res) {
    try {

        const { newItems } = req.body;
        const status = await sortPinGroup(newItems);
        res.json(newItems);
    } catch (error) {
        console.log(error)
    }
});

groupsRouter.post('/joinGroup', async function (req, res) {
    try {
        const { group_id, user_id, type } = req.body;
        const status = await joinGroup(user_id, group_id, type);
        res.json(status);
    } catch (error) {
        console.log(error)
    }
});

export { groupsRouter };