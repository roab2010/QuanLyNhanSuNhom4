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

// Lời chào trang chủ
app.get('/', (req, res) => {
    res.send('<h2>🚀 Backend đang chạy (Mô hình 2 bảng: Departments & Employees)</h2>');
});

// 1. API Lấy danh sách Phòng Ban (Để hiển thị lên Dropdown)
app.get('/api/departments', (req, res) => {
    db.query('SELECT * FROM departments', (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// 2. API Lấy danh sách Nhân viên (Dùng JOIN để lấy tên phòng ban)
app.get('/api/employees', (req, res) => {
    const sql = `
        SELECT e.*, d.dept_name AS department 
        FROM employees e 
        LEFT JOIN departments d ON e.dept_id = d.id 
        ORDER BY e.id DESC
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// 3. API Thêm nhân viên (Lưu dept_id thay vì tên phòng)
app.post('/api/employees', (req, res) => {
    const { ma_nv, full_name, phone, gender, dept_id, position, base_salary, status } = req.body;
    const sql = 'INSERT INTO employees (ma_nv, full_name, phone, gender, dept_id, position, base_salary, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    db.query(sql, [ma_nv, full_name, phone, gender, dept_id, position, base_salary, status], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Thêm thành công' });
    });
});

// 4. API Sửa nhân viên
app.put('/api/employees/:id', (req, res) => {
    const { id } = req.params;
    const { full_name, phone, gender, dept_id, position, base_salary, status } = req.body;
    const sql = 'UPDATE employees SET full_name=?, phone=?, gender=?, dept_id=?, position=?, base_salary=?, status=? WHERE id=?';
    db.query(sql, [full_name, phone, gender, dept_id, position, base_salary, status, id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Sửa thành công' });
    });
});

// 5. API Xóa nhân viên
app.delete('/api/employees/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM employees WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Xóa thành công' });
    });
});

app.listen(3000, () => console.log('Backend đang chạy ở port 3000'));