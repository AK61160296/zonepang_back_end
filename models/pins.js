import { connectDb } from "../config/database.js";
import { DataTypes } from "sequelize";
import { zpGroupsModel } from "./groups.js";
const zpPinsModel = connectDb.define("pins", {
    pin_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    group_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    sort: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
}, {
    timestamps: false,
    freezeTableName: true
});

zpPinsModel.belongsTo(zpGroupsModel, { foreignKey: 'group_id' });

export { zpPinsModel }
