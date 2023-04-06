
import { zpGroupsModel } from "./groups.js";
import { zpUserGroupsModel } from "./user_groups.js";
zpGroupsModel.hasMany(zpUserGroupsModel, { foreignKey: 'group_id' });
zpUserGroupsModel.belongsTo(zpGroupsModel, { foreignKey: 'group_id' });


import { zpPostsModel } from "./posts.js";
import { zpUsersModel } from "./users.js";
import { zpLikesModel } from "./likes.js";
import { zpAttchmentsPostsModel } from "./attachments_posts.js";
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