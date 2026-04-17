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
        console.log('Recalculating penalties for existing data...');
        const [records] = await conn.query('SELECT * FROM attendance');
        
        for (const r of records) {
            if (!r.check_in || r.status === 'Nghỉ' || r.status === 'Nghỉ phép') continue;
            
            const cin = new Date(r.check_in);
            const cout = r.check_out ? new Date(r.check_out) : null;
            
            const h_in = cin.getHours();
            const m_in = cin.getMinutes();
            const lateMins = (h_in * 60 + m_in) - (8 * 60);
            
            let earlyMins = 0;
            if (cout) {
                const h_out = cout.getHours();
                const m_out = cout.getMinutes();
                earlyMins = (17 * 60) - (h_out * 60 + m_out);
            }

            let newStatus = 'Đúng giờ';
            let penalty = 0;
            let weight = 1.0;
            
            if (lateMins > 10) {
                if (lateMins <= 30) {
                    newStatus = 'Đi trễ nhẹ';
                    penalty = 50000;
                } else {
                    newStatus = 'Đi trễ nặng';
                    penalty = 100000;
                }
                if (lateMins > 120) weight -= 0.5;
            }
            if (earlyMins > 10) {
                newStatus = (lateMins > 10) ? 'Trễ/Sớm' : 'Về sớm';
                penalty += 50000;
                if (earlyMins > 120) weight -= 0.5;
            }
            if (weight < 0) weight = 0;

            await conn.query(
                'UPDATE attendance SET status=?, penalty_fee=?, work_weight=?, late_minutes=?, early_minutes=? WHERE id=?',
                [newStatus, penalty, weight, lateMins > 0 ? lateMins : 0, earlyMins > 0 ? earlyMins : 0, r.id]
            );
        }
        console.log('Done!');
    } catch (err) {
        console.error(err);
    } finally {
        await conn.end();
    }
}
run();
