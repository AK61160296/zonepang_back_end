import { connectDb } from "../config/database.js";
import { DataTypes } from "sequelize";
import { zpGroupsModel } from "./groups.js";
const zpHistorySearchsModel = connectDb.define("history_searchs", {
    history_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    name: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    user_search_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    group_search_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    file_name: {
        type: DataTypes.STRING(199),
        allowNull: true,
    },
    type: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    code_user: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    create_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    update_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    timestamps: false,
    freezeTableName: true
});


export { zpHistorySearchsModel }
