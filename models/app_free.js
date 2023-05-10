import { connectDb } from "../config/database.js";
import { DataTypes } from "sequelize";
const zpAppFreeModel = connectDb.define("app_free", {
    app_free_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    icon: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    header: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    title: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    url: {
        type: DataTypes.TEXT,
        allowNull: true,
    },

}, {
    timestamps: false,
    freezeTableName: true
});

export { zpAppFreeModel }
