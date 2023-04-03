import { connectDb } from "../config/database.js";
import { DataTypes } from "sequelize";
const zpLikesModel = connectDb.define("likes", {
    like_id: {
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
    comment_id: {
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

export { zpLikesModel }
