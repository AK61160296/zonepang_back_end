import { connectDb } from "../config/database.js";
import { DataTypes } from "sequelize";
const zpAttchmentsPostsModel = connectDb.define("attachments_posts", {
    atm_post_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    file_name: {
        type: DataTypes.TEXT,
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

export { zpAttchmentsPostsModel }
