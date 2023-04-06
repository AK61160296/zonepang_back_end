import { connectDb } from "../config/database.js";
import { DataTypes } from "sequelize";
import { zpPostsModel } from "./posts.js";
import { zpAttchmentsPostsModel } from "./attachments_posts.js";
const zpMatchAttachmentsModel = connectDb.define("match_attachments", {
    match_atm_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    post_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    atm_post_id: {
        type: DataTypes.TEXT,
        allowNull: true,
        references: {
            model: zpAttchmentsPostsModel,
            key: 'attchment_id'
        }
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


zpMatchAttachmentsModel.belongsTo(zpAttchmentsPostsModel, { foreignKey: 'atm_post_id' });
zpAttchmentsPostsModel.hasMany(zpMatchAttachmentsModel, { foreignKey: 'atm_post_id' });

zpMatchAttachmentsModel.belongsTo(zpPostsModel, { foreignKey: 'post_id' });
zpPostsModel.hasMany(zpMatchAttachmentsModel, { foreignKey: 'post_id' });

export { zpMatchAttachmentsModel }
