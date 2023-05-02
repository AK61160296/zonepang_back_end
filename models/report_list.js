import { connectDb } from "../config/database.js";
import { DataTypes } from "sequelize";
const zpReportListModel = connectDb.define("report_list", {
    report_list_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
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

export { zpReportListModel }
