import { connectDb } from "../config/database.js";
import "./relationshipModel.js";
await connectDb.sync();

import { zpUserModel } from "./users.js";
import { zpGroupsModel } from "./groups.js";
import { zpUserGroupsModel } from "./user_groups.js";



export {
    zpGroupsModel,
    zpUserGroupsModel,
    zpUserModel
}