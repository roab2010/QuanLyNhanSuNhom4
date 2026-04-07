// Nap cac thu vien can thiet cho backend.
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

// Tao ung dung Express.
const app = express();

// Cho phep frontend goi API va tu dong doc body JSON.
app.use(cors());
app.use(express.json());

// Lay port tu bien moi truong, neu khong co thi mac dinh la 3000.
const PORT = process.env.PORT || 3000;

// Tao ket noi toi co so du lieu TiDB Cloud.
const db = mysql.createConnection({
  host: 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
  port: 4000,
  user: 'Bpt2R419So3M3SM.root',
  password: 'OzZK28gTAwN7QORP',
  database: 'quan_ly_nhan_su',
  ssl: { rejectUnauthorized: true },
});

// ================= API XAC THUC =================

// Dang ky tai khoan moi.
app.post('/api/register', (req, res) => {
  const { username, password, fullname } = req.body;

  db.query(
    'INSERT INTO users (username, password, fullname) VALUES (?, ?, ?)',
    [username, password, fullname],
    (err) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ error: 'Ten dang nhap da ton tai!' });
        }

        return res.status(500).json(err);
      }

      return res.json({ message: 'Dang ky thanh cong!' });
    },
  );
});

// Dang nhap bang username va password.
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  db.query(
    'SELECT * FROM users WHERE username = ? AND password = ?',
    [username, password],
    (err, results) => {
      if (err) {
        return res.status(500).json(err);
      }

      if (results.length === 0) {
        return res.status(401).json({ error: 'Sai tai khoan hoac mat khau!' });
      }

      return res.json({ message: 'Dang nhap thanh cong', user: results[0] });
    },
  );
});

// ================= API PHONG BAN VA NHAN SU =================

// Lay tat ca phong ban.
app.get('/api/departments', (req, res) => {
  db.query('SELECT * FROM departments', (err, results) => {
    if (err) {
      return res.status(500).json(err);
    }

    return res.json(results);
  });
});

// Lay danh sach nhan vien va tim kiem theo ten hoac ma nhan vien.
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
    if (err) {
      return res.status(500).json(err);
    }

    return res.json(results);
  });
});

// Them nhan vien moi.
app.post('/api/employees', (req, res) => {
  const {
    ma_nv,
    full_name,
    phone,
    gender,
    dept_id,
    position,
    base_salary,
    status,
  } = req.body;

  db.query(
    'INSERT INTO employees (ma_nv, full_name, phone, gender, dept_id, position, base_salary, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [ma_nv, full_name, phone, gender, dept_id, position, base_salary, status],
    (err) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({
            error: 'Ma nhan vien nay da ton tai trong he thong!',
          });
        }

        return res.status(500).json({ error: 'Loi may chu!' });
      }

      return res.json({ message: 'Them thanh cong' });
    },
  );
});

// Cap nhat nhan vien theo id.
app.put('/api/employees/:id', (req, res) => {
  const { id } = req.params;
  const {
    ma_nv,
    full_name,
    phone,
    gender,
    dept_id,
    position,
    base_salary,
    status,
  } = req.body;

  db.query(
    'UPDATE employees SET ma_nv = ?, full_name = ?, phone = ?, gender = ?, dept_id = ?, position = ?, base_salary = ?, status = ? WHERE id = ?',
    [ma_nv, full_name, phone, gender, dept_id, position, base_salary, status, id],
    (err) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({
            error: 'Ma nhan vien nay da ton tai trong he thong!',
          });
        }

        return res.status(500).json({ error: 'Loi may chu!' });
      }

      return res.json({ message: 'Sua thanh cong' });
    },
  );
});

// Xoa nhan vien theo id.
app.delete('/api/employees/:id', (req, res) => {
  db.query('DELETE FROM employees WHERE id = ?', [req.params.id], (err) => {
    if (err) {
      return res.status(500).json(err);
    }

    return res.json({ message: 'Xoa thanh cong' });
  });
});

// Khoi dong server.
app.listen(PORT, () => {
  console.log(`Backend dang chay tai cong ${PORT}`);
});
