
import { zpGroupsModel } from "./groups.js";
import { zpPostsModel } from "./posts.js";
import { zpUsersModel } from "./users.js";
import { zpCommentsModel } from "./comments.js";
import { zpLikesModel } from "./likes.js";
import { zpUserGroupsModel } from "./user_groups.js";
import { zpAttchmentsPostsModel } from "./attachments_posts.js";
import { zpBookmarksModel } from "./bookmarks.js";

zpGroupsModel.hasMany(zpUserGroupsModel, { foreignKey: 'group_id' });
zpUserGroupsModel.belongsTo(zpGroupsModel, { foreignKey: 'group_id' });


zpPostsModel.belongsTo(zpUsersModel, { foreignKey: 'user_id' });
zpUsersModel.hasMany(zpPostsModel, { foreignKey: 'user_id' });

zpPostsModel.hasMany(zpAttchmentsPostsModel, { foreignKey: 'post_id' });
zpAttchmentsPostsModel.belongsTo(zpPostsModel, { foreignKey: 'post_id' });

//ความสัมพันธ์ ตาราง Posts กับ Like 1-Many
zpPostsModel.hasMany(zpLikesModel, { foreignKey: 'post_id' });

zpPostsModel.belongsTo(zpGroupsModel, { foreignKey: 'group_id' });

//ความสัมพันธ์ ตาราง Like กับ Posts 1-1
zpLikesModel.belongsTo(zpPostsModel, { foreignKey: 'post_id' });

//ความสัมพันธ์ ตาราง Likes กับ Users 1-1
zpLikesModel.belongsTo(zpUsersModel, { foreignKey: 'user_id' });


zpCommentsModel.belongsTo(zpUsersModel, { foreignKey: 'user_id' });
zpCommentsModel.belongsTo(zpUsersModel, { foreignKey: 'user_id_reply', as: 'user_reply' });

//bookmark
zpBookmarksModel.belongsTo(zpPostsModel, { foreignKey: 'post_id' });