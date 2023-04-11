import { connectDb } from "../config/database.js";
import { DataTypes } from "sequelize";
const zpBookmarksModel = connectDb.define("bookmarks", {
    bookmark_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    post_id: {
        type: DataTypes.INTEGER,
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

export { zpBookmarksModel }
