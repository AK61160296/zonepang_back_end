import { connectDb } from "../config/database.js";
import { DataTypes } from "sequelize";
const zpOrdersModel = connectDb.define("orders", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    package_detail_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    status: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    total_price: {
        type: DataTypes.DECIMAL,
        allowNull: true,
    },
    package_price: {
        type: DataTypes.DOUBLE,
        allowNull: true,
    },
    count: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    buyer_name: {
        type: DataTypes.STRING(191),
        allowNull: true,
    },
    buyer_phone: {
        type: DataTypes.STRING(191),
        allowNull: true,
    },
    buyer_email: {
        type: DataTypes.STRING(191),
        allowNull: true,
    },
    img_payment: {
        type: DataTypes.STRING(191),
        allowNull: true,
    },
    referenceNo: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    resultCode: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    amount: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    aff_code: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    note: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    gbpReferenceNo: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    currencyCode: {
        type: DataTypes.STRING(199),
        allowNull: true,
    },
    amount_com_zone: {
        type: DataTypes.DOUBLE,
        allowNull: true,
    },
    amount_com_aff: {
        type: DataTypes.DOUBLE,
        allowNull: true,
    },
    total_zone_commission: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    total_aff_commission: {
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
    issue_date: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    timestamps: false,
    freezeTableName: true
});

export { zpOrdersModel }
