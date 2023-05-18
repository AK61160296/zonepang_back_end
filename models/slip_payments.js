import { connectDb } from "../config/database.js";
import { DataTypes } from "sequelize";
const zpSlipPaymentsModel = connectDb.define("slip_payments", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    referenceNo: {
        type: DataTypes.STRING(191),
        allowNull: true,
    },
    fname: {
        type: DataTypes.STRING(191),
        allowNull: true,
    },
    lname: {
        type: DataTypes.STRING(191),
        allowNull: true,
    },
    full_name: {
        type: DataTypes.STRING(199),
        allowNull: true,
    },
    email: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    phone: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    price: {
        type: DataTypes.DOUBLE,
        allowNull: true,
    },
    img_slip: {
        type: DataTypes.STRING(199),
        allowNull: true,
    },
    date_payment: {
        type: DataTypes.DATE,
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

export { zpSlipPaymentsModel }
