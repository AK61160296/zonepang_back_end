import { connectDb } from "../config/database.js";
import { DataTypes } from "sequelize";
const zpReportTypeModel = connectDb.define("report_type", {
    report_type_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    is_active: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },

}, {
    timestamps: false,
    freezeTableName: true
});

export { zpReportTypeModel }
