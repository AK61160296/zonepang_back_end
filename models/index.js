import { connectDb } from "../config/database.js";
import "./relationshipModel.js";
await connectDb.sync();

import { zpPostsModel } from "./posts.js";
import { zpUsersModel } from "./users.js";
import { zpLikesModel } from "./likes.js";
import { zpGroupsModel } from "./groups.js";
import { zpMatchAttachmentsModel } from "./match_attachments.js";
import { zpUserGroupsModel } from "./user_groups.js";
import { zpAttchmentsPostsModel } from "./attachments_posts.js";
import { zpCommentsModel } from "./comments.js";

export {
    zpGroupsModel,
    zpUserGroupsModel,
    zpUsersModel,
    zpPostsModel,
    zpAttchmentsPostsModel,
    zpLikesModel,
    zpMatchAttachmentsModel,
    zpCommentsModel
}