import { connectDb } from "../config/database.js";
import { DataTypes } from "sequelize";
const zpRegisterOtpModel = connectDb.define("register_otp", {
    regis_otp_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    phone: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    is_active: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    status_otp: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    time_otp: {
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

export { zpRegisterOtpModel }
