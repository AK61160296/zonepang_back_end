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
    count_reject: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    reply: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    reply_to_reply: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    user_id_reply: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    sub_to_reply: {
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

export { zpCommentsModel }
