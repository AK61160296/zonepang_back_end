
import { zpGroupsModel } from "./groups.js";
import { zpUserGroupsModel } from "./user_groups.js";
import { zpUserModel } from "./users.js";

zpGroupsModel.hasMany(zpUserGroupsModel, { foreignKey: 'group_id' });
zpUserGroupsModel.belongsTo(zpGroupsModel, { foreignKey: 'group_id' });
// zpUserGroupsModel.belongsTo(zpUserModel, { foreignKey: 'user_id' });