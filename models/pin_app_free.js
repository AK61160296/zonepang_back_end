import { connectDb } from "../config/database.js";
import { DataTypes } from "sequelize";
const zpPinAppFreeModel = connectDb.define("pin_app_free", {
    pin_app_free_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    app_free_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    sort: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
}, {
    timestamps: false,
    freezeTableName: true
});

export { zpPinAppFreeModel }
