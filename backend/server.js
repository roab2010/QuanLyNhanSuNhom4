const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Kết nối TiDB Cloud
const db = mysql.createConnection({
    host: 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
    port: 4000,
    user: 'Bpt2R419So3M3SM.root',
    password: 'OzZK28gTAwN7QORP',
    database: 'quan_ly_nhan_su',
    ssl: { rejectUnauthorized: true }
});

// ================= API XÁC THỰC (ĐĂNG NHẬP/ĐĂNG KÝ) =================

// Đăng ký
app.post('/api/register', (req, res) => {
    const { username, password, fullname } = req.body;
    db.query('INSERT INTO users (username, password, fullname) VALUES (?, ?, ?)', 
        [username, password, fullname], (err, result) => {
        if (err) {
            if(err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'Tên đăng nhập đã tồn tại!' });
            return res.status(500).json(err);
        }
        res.json({ message: 'Đăng ký thành công!' });
    });
});

// Đăng nhập
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    db.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, results) => {
        if (err) return res.status(500).json(err);
        if (results.length === 0) return res.status(401).json({ error: 'Sai tài khoản hoặc mật khẩu!' });
        res.json({ message: 'Đăng nhập thành công', user: results[0] });
    });
});

// ================= API NHÂN SỰ CÓ TÌM KIẾM =================

app.get('/api/departments', (req, res) => {
    db.query('SELECT * FROM departments', (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// Danh sách NV + Tìm kiếm 
app.get('/api/employees', (req, res) => {
    const search = req.query.search || '';
    const sql = `
        SELECT e.*, d.dept_name AS department 
        FROM employees e 
        LEFT JOIN departments d ON e.dept_id = d.id 
        WHERE e.full_name COLLATE utf8mb4_general_ci LIKE ? 
           OR e.ma_nv COLLATE utf8mb4_general_ci LIKE ?
        ORDER BY e.id DESC
    `;
    const searchValue = `%${search}%`;
    db.query(sql, [searchValue, searchValue], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});


app.post('/api/employees', (req, res) => {
    const { ma_nv, full_name, phone, gender, dept_id, position, base_salary, status } = req.body;
    db.query('INSERT INTO employees (ma_nv, full_name, phone, gender, dept_id, position, base_salary, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
    [ma_nv, full_name, phone, gender, dept_id, position, base_salary, status], (err) => {
        if (err) {
            // Lỗi ER_DUP_ENTRY là do bị trùng mã có chữ UNIQUE trong database
            if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'Mã nhân viên này đã tồn tại trong hệ thống!' });
            return res.status(500).json({ error: 'Lỗi máy chủ!' });
        }
        res.json({ message: 'Thêm thành công' });
    });
});


app.put('/api/employees/:id', (req, res) => {
    const { id } = req.params;
    const { ma_nv, full_name, phone, gender, dept_id, position, base_salary, status } = req.body;
    db.query('UPDATE employees SET ma_nv=?, full_name=?, phone=?, gender=?, dept_id=?, position=?, base_salary=?, status=? WHERE id=?', 
    [ma_nv, full_name, phone, gender, dept_id, position, base_salary, status, id], (err) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'Mã nhân viên này đã tồn tại trong hệ thống!' });
            return res.status(500).json({ error: 'Lỗi máy chủ!' });
        }
        res.json({ message: 'Sửa thành công' });
    });
});

app.delete('/api/employees/:id', (req, res) => {
    db.query('DELETE FROM employees WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Xóa thành công' });
    });
});

app.listen(3000, () => console.log('Backend chạy port 3000'));