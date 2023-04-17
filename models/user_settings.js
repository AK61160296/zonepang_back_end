import { connectDb } from "../config/database.js";
import { DataTypes } from "sequelize";
const zpUserSettingsModel = connectDb.define("user_settings", {
    setting_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    setting: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    comment: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    follow: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    tag: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    group: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    is_setting_all: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
}, {
    timestamps: false,
    freezeTableName: true
});

export { zpUserSettingsModel }
