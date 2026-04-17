const mysql = require('mysql2/promise');
const dbConfig = {
    host: 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
    port: 4000,
    user: 'Bpt2R419So3M3SM.root',
    password: 'OzZK28gTAwN7QORP',
    database: 'quan_ly_nhan_su',
    ssl: { rejectUnauthorized: true }
};
async function run() {
    const conn = await mysql.createConnection(dbConfig);
    try {
        console.log('Update enum with precise statuses...');
        await conn.query("ALTER TABLE attendance MODIFY COLUMN status ENUM('Đúng giờ','Đi trễ','Đi trễ nhẹ','Đi trễ nặng','Về sớm','Trễ/Sớm','Nghỉ','Nghỉ phép') DEFAULT 'Đúng giờ'");
        console.log('Done!');
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await conn.end();
    }
}
run();
