import express from 'express';
const groupsRouter = express.Router();
import { getGroupsAll } from '../controller/groupsController.js';

groupsRouter.get('/getGroupsAll', async function (req, res) {
    try {
        const groups = await getGroupsAll();
        res.json({
            data: groups
        });
    } catch (error) {
        console.log(error)
        debug()
    }
});

groupsRouter.post('/getGroupsUserAll', async function (req, res) {

});
export {groupsRouter};