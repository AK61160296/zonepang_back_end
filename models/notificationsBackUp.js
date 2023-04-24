import { connectDb } from "../config/database.js";
import { DataTypes } from "sequelize";
const zpNotificationsModel = connectDb.define("notifications", {
    noti_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    noti_type: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    text: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    read: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    group_id_target: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    user_id_target: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    post_id_target: {
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

export { zpNotificationsModel }
