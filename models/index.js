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
import { zpConversationsModel } from "./conversations.js";
import { zpMessagesModel } from "./messages.js";
import { zpReportsModel } from "./report.js";
import { zpReportTypeModel } from "./report_type.js";
import { zpReportListModel } from "./report_list.js";
import { zpAppFreeModel } from "./app_free.js";
import { zpPinAppFreeModel } from "./pin_app_free.js";
import { zpShortUrlModel } from "./short_url.js";
import { zpOrdersModel } from "./orders.js";
import { zpPackageDetailsModel } from "./package_details.js";
import { zpProductsModel } from "./products.js";
import { zpSlipPaymentsModel } from "./slip_payments.js";

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
    zpMessagesModel,
    zpConversationsModel,
    zpReportsModel,
    zpReportTypeModel,
    zpReportListModel,
    zpAppFreeModel,
    zpPinAppFreeModel,
    zpShortUrlModel,
    zpOrdersModel,
    zpPackageDetailsModel,
    zpProductsModel,
    zpSlipPaymentsModel
}