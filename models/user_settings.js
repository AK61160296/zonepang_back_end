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
}, {
    timestamps: false,
    freezeTableName: true
});

export { zpUserSettingsModel }
