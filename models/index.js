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
import { zpPinsModel } from "./pins.js";
import { zpBookmarksModel } from "./bookmarks.js";
import { zpFollowsModel } from "./follows.js";
import { zpHistorySearchsModel } from "./history_searchs.js";
import { zpUserSettingsModel } from "./user_settings.js";


export {
    zpPinsModel,
    zpGroupsModel,
    zpUserGroupsModel,
    zpUsersModel,
    zpPostsModel,
    zpAttchmentsPostsModel,
    zpLikesModel,
    zpMatchAttachmentsModel,
    zpCommentsModel,
    zpBookmarksModel,
    zpFollowsModel,
    zpHistorySearchsModel,
    zpUserSettingsModel,
}