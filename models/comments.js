import { connectDb } from "../config/database.js";
import { DataTypes } from "sequelize";
const zpCommentsModel = connectDb.define("comments", {
    comment_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    text: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    post_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    file_name: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    file_type: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    get_type: {
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

export { zpCommentsModel }
