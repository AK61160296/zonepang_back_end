import { connectDb } from "../config/database.js";
import { DataTypes } from "sequelize";
const zpUsersModel = connectDb.define("users", {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING(191),
        allowNull: true,
    },
    email: {
        type: DataTypes.STRING(191),
        allowNull: true,
    },
    email_verified_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    password: {
        type: DataTypes.STRING(191),
        allowNull: true,
    },
    is_admin: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
    },
    provider: {
        type: DataTypes.STRING(191),
        allowNull: true,
    },
    provider_id: {
        type: DataTypes.STRING(191),
        allowNull: true,
    },
    access_token: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    is_login: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    avatar: {
        type: DataTypes.STRING(191),
        allowNull: true,
    },
    phone: {
        type: DataTypes.STRING(191),
        allowNull: true,
    },
    fullname: {
        type: DataTypes.STRING(199),
        allowNull: true,
    },
    line_id: {
        type: DataTypes.STRING(199),
        allowNull: true,
    },
    real_email: {
        type: DataTypes.STRING(191),
        allowNull: true,
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    birthday: {
        type: DataTypes.STRING(191),
        allowNull: true,
    },
    zipcode: {
        type: DataTypes.STRING(191),
        allowNull: true,
    },
    country: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    brand_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    brand_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    code_user: {
        type: DataTypes.STRING(191),
        allowNull: true,
    },
    remember_token: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    aff_code: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    commission_zone: {
        type: DataTypes.DOUBLE,
        allowNull: true,
    },
    set_permission: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    exprie_session: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    // created_at: {
    //     type: DataTypes.DATE,
    //     allowNull: true,
    // },
    // updated_at: {
    //     type: DataTypes.DATE,
    //     allowNull: true,
    // },
}, {
    timestamps: false,
    freezeTableName: true
});

export { zpUsersModel }
