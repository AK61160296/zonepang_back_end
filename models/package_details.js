import { connectDb } from "../config/database.js";
import { DataTypes } from "sequelize";
const zpPackageDetailsModel = connectDb.define("package_details", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    package_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    package_name: {
        type: DataTypes.STRING(191),
        allowNull: true,
    },
    package_date: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    package_price: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    package_payoff: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    package_price_sale: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    package_count: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    recommend_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    package_detail: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    order: {
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

export { zpPackageDetailsModel }
