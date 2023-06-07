import cron from 'node-cron';

// ฟังก์ชันที่ต้องการให้ cron job เรียกใช้
function updateUser() {
    // ทำการอัปเดตข้อมูลผู้ใช้ที่ต้องการในที่นี้
    // console.log('Updating user data...');
}

// กำหนด Cron Job ให้ทำงานทุก ๆ 5 นาที
const job = cron.schedule('*/30 * * * * *', () => {
    // updateUser();
});
export default job;
