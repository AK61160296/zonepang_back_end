import { connectDb } from "../config/database.js";
import { DataTypes } from "sequelize";
const zpProductsModel = connectDb.define("products", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    name_product: {
        type: DataTypes.STRING(191),
        allowNull: true,
    },
    detail_product: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    code_product: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    price: {
        type: DataTypes.DOUBLE,
        allowNull: true,
    },
    status: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    status_aff: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    verify_product: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    reject_verify_product: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    verify_salepage: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    reject_verify_salepage: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    verify_package: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    reject_verify_package: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    verify_aff: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    reject_verify_aff: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    img_product: {
        type: DataTypes.STRING(191),
        allowNull: true,
    },
    category_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    recommend_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    type_product_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    partner_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    url_product: {
        type: DataTypes.STRING(191),
        allowNull: true,
    },
    url_product_type: {
        type: DataTypes.STRING(191),
        allowNull: true,
    },
    qr_code_line: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    link_line: {
        type: DataTypes.STRING(191),
        allowNull: true,
    },
    line_id: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    commission: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    theme_color_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    view: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    sort_order: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    tag_special_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    timestamps: false,
    freezeTableName: true
});

export { zpProductsModel }
