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
        console.log('--- RE-VERIFYING AWARDS FOR EMP 1 ---');
        const [rows] = await conn.query("SELECT id, emp_id, amount, award_date, MONTH(award_date) as m, YEAR(award_date) as y FROM awards WHERE emp_id = 1");
        console.log(JSON.stringify(rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await conn.end();
    }
}
run();
