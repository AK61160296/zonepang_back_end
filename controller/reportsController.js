import { Sequelize, Op } from 'sequelize';
import { zpNotificationsModel } from '../models/notification.js';
import { zpReportsModel, zpReportTypeModel, zpReportListModel } from '../models/index.js';

async function createReport(userId, postId, commentId, reportType, reportListId) {
    try {
        if (reportType == "post") {
            const report = await zpReportsModel.create({
                user_id: userId,
                post_id: postId,
                report_type_id: 1,
                repoty_list_id: reportListId,
                create_at: Date.now(),
                update_at: Date.now()
            })
        } else if (reportType == "comment") {
            const report = await zpReportsModel.create({
                user_id: userId,
                comment_id: commentId,
                report_type_id: 1,
                repoty_list_id: reportListId,
                create_at: Date.now(),
                update_at: Date.now()
            })
        }

        return { status: 'success' };
    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }
}
async function getRepostList() {
    try {
        const reportList = await zpReportListModel.findAll({
            attributes: ['report_list_id', 'name'],
            where: {
                is_active: 1
            }
        });
        return { reportList };
    } catch (error) {
        console.error(error);
        return { status: 'error', error: error };
    }
}
export {
    createReport,
    getRepostList
}
