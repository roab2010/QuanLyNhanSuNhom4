// ============================================================
// Backend API - He Thong Quan Ly Nhan Su NextGen
// ============================================================

const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Ket noi TiDB Cloud. Sử dụng Pool để tránh mất kết nối
const pool = mysql.createPool({
  host: 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
  port: 4000,
  user: 'Bpt2R419So3M3SM.root',
  password: 'OzZK28gTAwN7QORP',
  database: 'quan_ly_nhan_su',
  ssl: { rejectUnauthorized: true },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Helper: chay query tra ve Promise.
const query = (sql, params = []) =>
  new Promise((resolve, reject) => {
    pool.query(sql, params, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });

// ==================== AUTH ====================

// Dang ky.
app.post('/api/register', async (req, res) => {
  try {
    const { username, password, fullname } = req.body;
    if (!username || !username.trim()) return res.status(400).json({ error: 'Tên đăng nhập không được để trống!' });
    if (!password || password.length < 4) return res.status(400).json({ error: 'Mật khẩu phải có ít nhất 4 ký tự!' });
    if (!fullname || !fullname.trim()) return res.status(400).json({ error: 'Họ và tên không được để trống!' });
    await query(
      'INSERT INTO users (username, password, fullname) VALUES (?, ?, ?)',
      [username.trim(), password, fullname.trim()]
    );
    res.json({ message: 'Đăng ký thành công!' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY')
      return res.status(400).json({ error: 'Tên đăng nhập đã tồn tại!' });
    res.status(500).json({ error: 'Lỗi máy chủ!' });
  }
});

// Dang nhap.
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const results = await query(
      'SELECT * FROM users WHERE username = ? AND password = ?',
      [username, password]
    );
    if (results.length === 0)
      return res.status(401).json({ error: 'Sai tài khoản hoặc mật khẩu!' });
    const user = results[0];
    delete user.password;
    res.json({ message: 'Đăng nhập thành công', user });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi máy chủ!' });
  }
});

// Lay ho so ca nhan.
app.get('/api/profile/:id', async (req, res) => {
  try {
    const results = await query('SELECT id, username, fullname, avatar_url, role, created_at FROM users WHERE id = ?', [req.params.id]);
    if (results.length === 0) return res.status(404).json({ error: 'Không tìm thấy!' });
    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi máy chủ!' });
  }
});

// Cap nhat ho so ca nhan.
app.put('/api/profile/:id', async (req, res) => {
  try {
    const { fullname, avatar_url } = req.body;
    if (!fullname || !fullname.trim()) return res.status(400).json({ error: 'Họ và tên không được để trống!' });
    await query('UPDATE users SET fullname = ?, avatar_url = ? WHERE id = ?', [fullname.trim(), avatar_url || null, req.params.id]);
    res.json({ message: 'Cập nhật thành công!' });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi máy chủ!' });
  }
});

// ==================== EMPLOYEES ====================

// Lay danh sach nhan vien.
app.get('/api/employees', async (req, res) => {
  try {
    const search = req.query.search || '';
    const deptId = req.query.dept_id || '';
    let sql = `
      SELECT e.*, d.dept_name AS department, p.pos_name AS position_name
      FROM employees e
      LEFT JOIN departments d ON e.dept_id = d.id
      LEFT JOIN positions p ON e.pos_id = p.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      sql += ` AND (e.full_name COLLATE utf8mb4_general_ci LIKE ? OR e.ma_nv COLLATE utf8mb4_general_ci LIKE ? OR e.email LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (deptId) {
      sql += ` AND e.dept_id = ?`;
      params.push(deptId);
    }

    sql += ` ORDER BY e.id DESC`;
    const results = await query(sql, params);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi máy chủ!' });
  }
});

// Lay chi tiet nhan vien.
app.get('/api/employees/:id', async (req, res) => {
  try {
    const results = await query(
      `SELECT e.*, d.dept_name AS department, p.pos_name AS position_name
       FROM employees e
       LEFT JOIN departments d ON e.dept_id = d.id
       LEFT JOIN positions p ON e.pos_id = p.id
       WHERE e.id = ?`,
      [req.params.id]
    );
    if (results.length === 0) return res.status(404).json({ error: 'Không tìm thấy!' });
    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi máy chủ!' });
  }
});

// Them nhan vien.
app.post('/api/employees', async (req, res) => {
  try {
    const { ma_nv, full_name, email, phone, address, gender, date_of_birth, hire_date, avatar_url, dept_id, pos_id, skills, experience, work_hours_per_day, status, type, base_salary } = req.body;
    // Validation.
    if (!ma_nv || !ma_nv.trim()) return res.status(400).json({ error: 'Mã nhân viên không được để trống!' });
    
    // Kiem tra thu cong ma_nv
    const existing = await query('SELECT id FROM employees WHERE ma_nv = ?', [ma_nv.trim()]);
    if (existing.length > 0) return res.status(400).json({ error: 'Mã nhân viên đã tồn tại!' });
    if (base_salary === undefined || isNaN(base_salary)) return res.status(400).json({ error: 'Lương cơ bản phải là số!' });
    if (!full_name || !full_name.trim()) return res.status(400).json({ error: 'Họ và tên không được để trống!' });
    if (!phone || !phone.trim()) return res.status(400).json({ error: 'Số điện thoại không được để trống!' });
    if (phone && !/^[0-9]{9,11}$/.test(phone.trim())) return res.status(400).json({ error: 'Số điện thoại không hợp lệ (9-11 số)!' });
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return res.status(400).json({ error: 'Email không hợp lệ!' });
    if (!email || !email.trim()) return res.status(400).json({ error: 'Email không được để trống!' });
    if (!address || !address.trim()) return res.status(400).json({ error: 'Địa chỉ không được để trống!' });
    if (!dept_id) return res.status(400).json({ error: 'Vui lòng chọn phòng ban!' });
    if (!pos_id) return res.status(400).json({ error: 'Vui lòng chọn vị trí!' });
    if (!date_of_birth) return res.status(400).json({ error: 'Ngày sinh không được để trống!' });
    if (!hire_date) return res.status(400).json({ error: 'Ngày tuyển không được để trống!' });
    if (!skills || !skills.trim()) return res.status(400).json({ error: 'Kỹ năng không được để trống!' });
    if (!experience || !experience.trim()) return res.status(400).json({ error: 'Kinh nghiệm không được để trống!' });

    await query(
      `INSERT INTO employees (ma_nv, full_name, email, phone, address, gender, date_of_birth, hire_date, avatar_url, dept_id, pos_id, skills, experience, work_hours_per_day, status, type, base_salary)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [ma_nv.trim(), full_name.trim(), email.trim(), phone.trim(), address.trim(), gender || 'Nam', date_of_birth, hire_date, avatar_url || null, dept_id, pos_id, skills.trim(), experience.trim(), work_hours_per_day || 8, status || 'Đang làm việc', type || 'Chính thức', base_salary || 0]
    );
    res.json({ message: 'Thêm nhân viên thành công!' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY')
      return res.status(400).json({ error: 'Mã nhân viên hoặc email đã tồn tại!' });
    res.status(500).json({ error: 'Lỗi máy chủ!' });
  }
});

// Cap nhat nhan vien.
app.put('/api/employees/:id', async (req, res) => {
  try {
    const { ma_nv, full_name, email, phone, address, gender, date_of_birth, hire_date, avatar_url, dept_id, pos_id, skills, experience, work_hours_per_day, status, type, base_salary } = req.body;
    // Validation.
    if (!ma_nv || !ma_nv.trim()) return res.status(400).json({ error: 'Mã nhân viên không được để trống!' });
    if (!full_name || !full_name.trim()) return res.status(400).json({ error: 'Họ và tên không được để trống!' });
    if (!phone || !phone.trim()) return res.status(400).json({ error: 'Số điện thoại không được để trống!' });
    if (phone && !/^[0-9]{9,11}$/.test(phone.trim())) return res.status(400).json({ error: 'Số điện thoại không hợp lệ (9-11 số)!' });
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return res.status(400).json({ error: 'Email không hợp lệ!' });
    if (!email || !email.trim()) return res.status(400).json({ error: 'Email không được để trống!' });
    if (!address || !address.trim()) return res.status(400).json({ error: 'Địa chỉ không được để trống!' });
    if (!dept_id) return res.status(400).json({ error: 'Vui lòng chọn phòng ban!' });
    if (!pos_id) return res.status(400).json({ error: 'Vui lòng chọn vị trí!' });
    if (!date_of_birth) return res.status(400).json({ error: 'Ngày sinh không được để trống!' });
    if (!hire_date) return res.status(400).json({ error: 'Ngày tuyển không được để trống!' });
    if (!skills || !skills.trim()) return res.status(400).json({ error: 'Kỹ năng không được để trống!' });
    if (!experience || !experience.trim()) return res.status(400).json({ error: 'Kinh nghiệm không được để trống!' });

    await query(
      `UPDATE employees SET ma_nv=?, full_name=?, email=?, phone=?, address=?, gender=?, date_of_birth=?, hire_date=?, avatar_url=?, dept_id=?, pos_id=?, skills=?, experience=?, work_hours_per_day=?, status=?, type=?, base_salary=? WHERE id=?`,
      [ma_nv.trim(), full_name.trim(), email.trim(), phone.trim(), address.trim(), gender, date_of_birth, hire_date, avatar_url || null, dept_id, pos_id, skills.trim(), experience.trim(), work_hours_per_day || 8, status, type || 'Chính thức', base_salary || 0, req.params.id]
    );
    res.json({ message: 'Cập nhật thành công!' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY')
      return res.status(400).json({ error: 'Mã nhân viên hoặc email đã tồn tại!' });
    res.status(500).json({ error: 'Lỗi máy chủ!' });
  }
});

// Xoa nhan vien.
app.delete('/api/employees/:id', async (req, res) => {
  try {
    const id = req.params.id;
    // Xoa cascading cac bang lien quan.
    await query('UPDATE departments SET manager_id = NULL WHERE manager_id = ?', [id]);
    await query('DELETE FROM attendance WHERE emp_id = ?', [id]);
    await query('DELETE FROM payrolls WHERE emp_id = ?', [id]);
    await query('DELETE FROM leave_requests WHERE emp_id = ?', [id]);
    await query('DELETE FROM awards WHERE emp_id = ?', [id]);
    await query('DELETE FROM employees WHERE id = ?', [id]);
    res.json({ message: 'Xóa thành công!' });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi máy chủ khi xóa nhân viên!' });
  }
});

// ==================== DEPARTMENTS ====================

// Lay danh sach phong ban kem so thanh vien.
app.get('/api/departments', async (req, res) => {
  try {
    const results = await query(
      `SELECT d.*, COUNT(e.id) AS member_count
       FROM departments d
       LEFT JOIN employees e ON d.id = e.dept_id
       GROUP BY d.id
       ORDER BY d.id`
    );
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi máy chủ!' });
  }
});

// Them phong ban.
app.post('/api/departments', async (req, res) => {
  try {
    const { dept_name, description, manager_id } = req.body;
    if (!dept_name || !dept_name.trim()) return res.status(400).json({ error: 'Tên phòng ban không được để trống!' });
    await query('INSERT INTO departments (dept_name, description, manager_id) VALUES (?, ?, ?)', [dept_name.trim(), description || null, manager_id || null]);
    res.json({ message: 'Thêm phòng ban thành công!' });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi máy chủ!' });
  }
});

// Sua phong ban.
app.put('/api/departments/:id', async (req, res) => {
  try {
    const { dept_name, description, manager_id } = req.body;
    await query('UPDATE departments SET dept_name=?, description=?, manager_id=? WHERE id=?', [dept_name, description || null, manager_id || null, req.params.id]);
    res.json({ message: 'Cập nhật phòng ban thành công!' });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi máy chủ!' });
  }
});

// Xoa phong ban.
app.delete('/api/departments/:id', async (req, res) => {
  try {
    // Chuyen nhan vien ve null truoc khi xoa.
    await query('UPDATE employees SET dept_id = NULL WHERE dept_id = ?', [req.params.id]);
    await query('DELETE FROM departments WHERE id = ?', [req.params.id]);
    res.json({ message: 'Xóa phòng ban thành công!' });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi máy chủ!' });
  }
});

// ==================== POSITIONS ====================

// Lay danh sach vi tri.
app.get('/api/positions', async (req, res) => {
  try {
    const results = await query('SELECT * FROM positions ORDER BY id');
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi máy chủ!' });
  }
});

// Them vi tri.
app.post('/api/positions', async (req, res) => {
  try {
    const { pos_name, base_salary_config } = req.body;
    await query('INSERT INTO positions (pos_name, base_salary_config) VALUES (?, ?)', [pos_name, base_salary_config || 0]);
    res.json({ message: 'Thêm vị trí thành công!' });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi máy chủ!' });
  }
});

// ==================== ATTENDANCE ====================

// Lay danh sach cham cong.
app.get('/api/attendance', async (req, res) => {
  try {
    const { emp_id, month, year } = req.query;
    let sql = `
      SELECT a.*, e.full_name, e.ma_nv, d.dept_name
      FROM attendance a
      LEFT JOIN employees e ON a.emp_id = e.id
      LEFT JOIN departments d ON e.dept_id = d.id
      WHERE 1=1
    `;
    const params = [];
    if (emp_id) { sql += ` AND a.emp_id = ?`; params.push(emp_id); }
    if (month) { sql += ` AND MONTH(a.work_date) = ?`; params.push(month); }
    if (year) { sql += ` AND YEAR(a.work_date) = ?`; params.push(year); }
    sql += ` ORDER BY a.work_date DESC, a.id DESC`;
    const results = await query(sql, params);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi máy chủ!' });
  }
});

// Them cham cong (Logic di tre / ve som chuyên nghiệp).
app.post('/api/attendance', async (req, res) => {
  try {
    const { emp_id, work_date, check_in, check_out, status, note } = req.body;
    if (!emp_id || !work_date) return res.status(400).json({ error: 'Vui lòng điền đủ mã NV và ngày làm việc!' });
    
    // Logic Di tre / Ve som
    // Quy dinh: 08:00 - 17:00. Cham chuoc 15p.
    const GRACE_PERIOD = 15;
    const SHIFT_START = "08:00";
    const SHIFT_END = "17:00";
    const WEIGHT_THRESHOLD = 120;
    // Helper: Parse time from any string (HH:mm or ISO)
    const getHM = (str) => {
      if (!str) return [0, 0];
      const t = String(str).includes('T') ? String(str).split('T')[1] : (String(str).includes(' ') ? String(str).split(' ')[1] : str);
      return t.slice(0, 5).split(':').map(Number);
    };

    let lateMinutes = 0;
    let earlyMinutes = 0;
    let workWeight = 1.0;
    let penaltyFee = 0;
    let finalStatus = status || 'Đúng giờ';

    if (check_in && status !== 'Nghỉ' && status !== 'Nghỉ phép') {
      const [h, m] = getHM(check_in);
      const [sh, sm] = SHIFT_START.split(':').map(Number);
      const diff = (h * 60 + m) - (sh * 60 + sm);
      if (diff > 10) { // Grace 10p cho vinh vien
        lateMinutes = diff;
        if (diff <= 30) {
          finalStatus = 'Đi trễ nhẹ';
          penaltyFee = 50000;
        } else {
          finalStatus = 'Đi trễ nặng';
          penaltyFee = 100000;
        }
        if (diff > WEIGHT_THRESHOLD) workWeight -= 0.5;
      }
    }

    if (check_out && status !== 'Nghỉ' && status !== 'Nghỉ phép') {
      const [h, m] = getHM(check_out);
      const [eh, em] = SHIFT_END.split(':').map(Number);
      const diff = (eh * 60 + em) - (h * 60 + m);
      if (diff > 10) { // Grace 10p ve som
        earlyMinutes = diff;
        penaltyFee += 50000;
        finalStatus = (lateMinutes > 10) ? 'Trễ/Sớm' : 'Về sớm';
        if (diff > WEIGHT_THRESHOLD) workWeight -= 0.5;
      }
    }

    if (status === 'Nghỉ' || status === 'Nghỉ phép') workWeight = 0;
    if (workWeight < 0) workWeight = 0;

    await query(
      'INSERT INTO attendance (emp_id, work_date, check_in, check_out, status, note, late_minutes, early_minutes, work_weight, method, penalty_fee) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [emp_id, work_date, check_in || null, check_out || null, finalStatus, note || null, lateMinutes, earlyMinutes, workWeight, req.body.method || 'Manual', penaltyFee]
    );
    res.json({ message: 'Lưu chấm công thành công!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi máy chủ!' });
  }
});

// Sua cham cong.
app.put('/api/attendance/:id', async (req, res) => {
  try {
    const { emp_id, work_date, check_in, check_out, status, note } = req.body;
    
    const GRACE_PERIOD = 15;
    const SHIFT_START = "08:00";
    const SHIFT_END = "17:00";
    const WEIGHT_THRESHOLD = 120;
    // Helper
    const getHM = (str) => {
      if (!str) return [0, 0];
      const t = String(str).includes('T') ? String(str).split('T')[1] : (String(str).includes(' ') ? String(str).split(' ')[1] : str);
      return t.slice(0, 5).split(':').map(Number);
    };

    let lateMinutes = 0;
    let earlyMinutes = 0;
    let workWeight = 1.0;
    let penaltyFee = 0;
    let finalStatus = status || 'Đúng giờ';

    if (check_in && status !== 'Nghỉ' && status !== 'Nghỉ phép') {
      const [h, m] = getHM(check_in);
      const [sh, sm] = SHIFT_START.split(':').map(Number);
      const diff = (h * 60 + m) - (sh * 60 + sm);
      if (diff > 10) {
        lateMinutes = diff;
        if (diff <= 30) {
          finalStatus = 'Đi trễ nhẹ';
          penaltyFee = 50000;
        } else {
          finalStatus = 'Đi trễ nặng';
          penaltyFee = 100000;
        }
        if (diff > WEIGHT_THRESHOLD) workWeight -= 0.5;
      }
    }

    if (check_out && status !== 'Nghỉ' && status !== 'Nghỉ phép') {
      const [h, m] = getHM(check_out);
      const [eh, em] = SHIFT_END.split(':').map(Number);
      const diff = (eh * 60 + em) - (h * 60 + m);
      if (diff > 10) {
        earlyMinutes = diff;
        penaltyFee += 50000;
        finalStatus = (lateMinutes > 10) ? 'Trễ/Sớm' : 'Về sớm';
        if (diff > WEIGHT_THRESHOLD) workWeight -= 0.5;
      }
    }

    if (status === 'Nghỉ' || status === 'Nghỉ phép') workWeight = 0;
    if (workWeight < 0) workWeight = 0;

    await query(
      'UPDATE attendance SET work_date=?, check_in=?, check_out=?, status=?, note=?, late_minutes=?, early_minutes=?, work_weight=?, method=?, penalty_fee=? WHERE id=?',
      [work_date, check_in || null, check_out || null, finalStatus, note || null, lateMinutes, earlyMinutes, workWeight, req.body.method || 'Manual', penaltyFee, req.params.id]
    );
    res.json({ message: 'Cập nhật chấm công thành công!' });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi máy chủ!' });
  }
});

// Xoa cham cong.
app.delete('/api/attendance/:id', async (req, res) => {
  try {
    await query('DELETE FROM attendance WHERE id = ?', [req.params.id]);
    res.json({ message: 'Xóa chấm công thành công!' });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi máy chủ!' });
  }
});

// ==================== PAYROLLS ====================

// Chot bang luong tu dong.
app.post('/api/payrolls/run', async (req, res) => {
  try {
    const { month, year } = req.body;
    if (!month || !year) return res.status(400).json({ error: 'Tháng và năm không hợp lệ!' });

    // Lay danh sach nhan vien dang lam viec
    const employees = await query("SELECT id, base_salary, type FROM employees WHERE status != 'Nghỉ việc'");
    let count = 0;

    for (const emp of employees) {
      // Tinh ngay cong (weighted) va Tong tien phat (penalty_fee)
      const attRows = await query(
        "SELECT SUM(work_weight) as total_weight, SUM(penalty_fee) as total_penalty FROM attendance WHERE emp_id = ? AND MONTH(work_date) = ? AND YEAR(work_date) = ? AND status != 'Nghỉ'",
        [emp.id, month, year]
      );
      const att = attRows[0] || {};

      // Tinh tong tien khen thuong (awards)
      const awRows = await query(
        "SELECT COALESCE(SUM(amount), 0) as total_award FROM awards WHERE emp_id = ? AND MONTH(award_date) = ? AND YEAR(award_date) = ?",
        [emp.id, month, year]
      );
      const aw = awRows[0] || {};
      
      const workDays = parseFloat(att.total_weight) || 0;
      const totalPenalty = parseFloat(att.total_penalty) || 0;
      const totalAward = parseFloat(aw.total_award) || 0;
      const baseSalary = parseFloat(emp.base_salary) || 0;
      
      console.log(`Debug Payroll [Month ${month}/${year}] [Emp ${emp.id}]: Days=${workDays}, Award=${totalAward}, Penalty=${totalPenalty}`);

      // Cong thuc: ((Lương CB * ti le / 26) * Ngày công) + Thưởng - Phạt
      const rate = emp.type === 'Thử việc' ? 0.85 : 1;
      const calculatedSalary = ((baseSalary * rate) / 26) * workDays + totalAward - totalPenalty;

      // Xoa du lieu cu
      await query("DELETE FROM payrolls WHERE emp_id = ? AND month = ? AND year = ?", [emp.id, month, year]);

      // Insert moi
      await query(
        "INSERT INTO payrolls (emp_id, month, year, base_salary, actual_work_days, bonus, deductions, total_salary) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [emp.id, month, year, baseSalary, workDays, totalAward, totalPenalty, calculatedSalary]
      );
      count++;
    }

    res.json({ message: `Đã chốt lương thành công cho ${count} nhân sự!` });
  } catch (err) {
    console.error('Loi chot luong:', err);
    res.status(500).json({ error: 'Lỗi máy chủ khi chạy lương!' });
  }
});

// Lay danh sach bang luong.
app.get('/api/payrolls', async (req, res) => {
  try {
    const { month, year } = req.query;
    let sql = `
      SELECT pr.*, e.full_name, e.ma_nv, e.date_of_birth, d.dept_name, p.pos_name
      FROM payrolls pr
      LEFT JOIN employees e ON pr.emp_id = e.id
      LEFT JOIN departments d ON e.dept_id = d.id
      LEFT JOIN positions p ON e.pos_id = p.id
      WHERE 1=1
    `;
    const params = [];
    if (month) { sql += ` AND pr.month = ?`; params.push(month); }
    if (year) { sql += ` AND pr.year = ?`; params.push(year); }
    sql += ` ORDER BY pr.id DESC`;
    const results = await query(sql, params);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi máy chủ!' });
  }
});

// Them bang luong moi (tinh tong luong tu dong).
app.post('/api/payrolls', async (req, res) => {
  try {
    const { emp_id, month, year, base_salary, actual_work_days, bonus, deductions } = req.body;
    if (!emp_id) return res.status(400).json({ error: 'Vui lòng chọn nhân viên!' });
    if (!month || !year) return res.status(400).json({ error: 'Tháng và năm không được để trống!' });
    if (!base_salary || parseFloat(base_salary) <= 0) return res.status(400).json({ error: 'Lương cơ bản phải lớn hơn 0!' });
    if (!actual_work_days || parseInt(actual_work_days) <= 0) return res.status(400).json({ error: 'Số ngày công phải lớn hơn 0!' });
    // Cong thuc: Luong = (base_salary / 26) * actual_work_days + bonus - deductions
    const dailySalary = (parseFloat(base_salary) || 0) / 26;
    const totalSalary = dailySalary * (parseInt(actual_work_days) || 0) + (parseFloat(bonus) || 0) - (parseFloat(deductions) || 0);
    await query(
      'INSERT INTO payrolls (emp_id, month, year, base_salary, actual_work_days, bonus, deductions, total_salary) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [emp_id, month, year, base_salary, actual_work_days, bonus || 0, deductions || 0, totalSalary]
    );
    res.json({ message: 'Thêm bảng lương thành công!' });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi máy chủ!' });
  }
});

// Sua bang luong.
app.put('/api/payrolls/:id', async (req, res) => {
  try {
    const { emp_id, month, year, base_salary, actual_work_days, bonus, deductions } = req.body;
    const dailySalary = (parseFloat(base_salary) || 0) / 26;
    const totalSalary = dailySalary * (parseInt(actual_work_days) || 0) + (parseFloat(bonus) || 0) - (parseFloat(deductions) || 0);
    await query(
      'UPDATE payrolls SET emp_id=?, month=?, year=?, base_salary=?, actual_work_days=?, bonus=?, deductions=?, total_salary=? WHERE id=?',
      [emp_id, month, year, base_salary || 0, actual_work_days || 0, bonus || 0, deductions || 0, totalSalary, req.params.id]
    );
    res.json({ message: 'Cập nhật bảng lương thành công!' });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi máy chủ!' });
  }
});

// Xoa bang luong.
app.delete('/api/payrolls/:id', async (req, res) => {
  try {
    await query('DELETE FROM payrolls WHERE id = ?', [req.params.id]);
    res.json({ message: 'Xóa bảng lương thành công!' });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi máy chủ!' });
  }
});

// ==================== LEAVE REQUESTS ====================

// Lay danh sach don nghi phep.
app.get('/api/leave-requests', async (req, res) => {
  try {
    const { status } = req.query;
    let sql = `
       SELECT lr.*, e.full_name, e.ma_nv, d.dept_name
       FROM leave_requests lr
       LEFT JOIN employees e ON lr.emp_id = e.id
       LEFT JOIN departments d ON e.dept_id = d.id
       WHERE 1=1
    `;
    const params = [];
    if (status) {
      sql += ` AND lr.status = ?`;
      params.push(status);
    }
    sql += ` ORDER BY lr.created_at DESC`;
    const results = await query(sql, params);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi máy chủ!' });
  }
});

// Dang ky nghi phep.
app.post('/api/leave-requests', async (req, res) => {
  try {
    const { emp_id, from_date, to_date, reason } = req.body;
    if (!emp_id) return res.status(400).json({ error: 'Vui lòng chọn nhân viên!' });
    if (!from_date) return res.status(400).json({ error: 'Ngày bắt đầu không được để trống!' });
    if (!to_date) return res.status(400).json({ error: 'Ngày kết thúc không được để trống!' });
    if (new Date(to_date) < new Date(from_date)) return res.status(400).json({ error: 'Ngày kết thúc phải sau ngày bắt đầu!' });
    if (!reason || !reason.trim()) return res.status(400).json({ error: 'Lý do nghỉ phép không được để trống!' });
    await query(
      'INSERT INTO leave_requests (emp_id, from_date, to_date, reason) VALUES (?, ?, ?, ?)',
      [emp_id, from_date, to_date, reason.trim()]
    );
    res.json({ message: 'Đăng ký nghỉ phép thành công!' });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi máy chủ!' });
  }
});

// Duyet don nghi phep.
app.put('/api/leave-requests/:id/approve', async (req, res) => {
  try {
    await query("UPDATE leave_requests SET status = 'Đã duyệt' WHERE id = ?", [req.params.id]);
    res.json({ message: 'Đã duyệt đơn nghỉ phép!' });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi máy chủ!' });
  }
});

// Tu choi don nghi phep.
app.put('/api/leave-requests/:id/reject', async (req, res) => {
  try {
    await query("UPDATE leave_requests SET status = 'Từ chối' WHERE id = ?", [req.params.id]);
    res.json({ message: 'Đã từ chối đơn nghỉ phép!' });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi máy chủ!' });
  }
});

// Xoa don nghi phep.
app.delete('/api/leave-requests/:id', async (req, res) => {
  try {
    await query('DELETE FROM leave_requests WHERE id = ?', [req.params.id]);
    res.json({ message: 'Xóa đơn nghỉ phép thành công!' });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi máy chủ!' });
  }
});

// ==================== CANDIDATES ====================

// Lay danh sach ung vien.
app.get('/api/candidates', async (req, res) => {
  try {
    const { skills, experience, status } = req.query;
    let sql = 'SELECT * FROM candidates WHERE 1=1';
    const params = [];
    
    if (skills) {
      // Tach theo dau phay va tim kiem tung tu khoa (AND logic)
      const keywords = skills.split(',').filter(s => s.trim() !== '');
      keywords.forEach(kw => {
        sql += ` AND skills LIKE ?`;
        params.push(`%${kw.trim()}%`);
      });
    }
    
    if (experience) { sql += ` AND experience LIKE ?`; params.push(`%${experience}%`); }
    if (status) { sql += ` AND status = ?`; params.push(status); }
    sql += ' ORDER BY applied_date DESC';
    const results = await query(sql, params);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi máy chủ!' });
  }
});

// Lay chi tiet ung vien.
app.get('/api/candidates/:id', async (req, res) => {
  try {
    const results = await query('SELECT * FROM candidates WHERE id = ?', [req.params.id]);
    if (results.length === 0) return res.status(404).json({ error: 'Không tìm thấy!' });
    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi máy chủ!' });
  }
});

// Them ung vien.
app.post('/api/candidates', async (req, res) => {
  try {
    const { full_name, email, phone, skills, experience, address, status, expected_salary, date_of_birth } = req.body;
    if (!full_name || !full_name.trim()) return res.status(400).json({ error: 'Họ và tên không được để trống!' });
    if (!email || !email.trim()) return res.status(400).json({ error: 'Email không được để trống!' });
    if (!phone || !phone.trim()) return res.status(400).json({ error: 'SĐT không được để trống!' });
    if (!skills || !skills.trim()) return res.status(400).json({ error: 'Kỹ năng không được để trống!' });
    if (!experience || !experience.trim()) return res.status(400).json({ error: 'Kinh nghiệm không được để trống!' });
    if (!address || !address.trim()) return res.status(400).json({ error: 'Địa chỉ không được để trống!' });
    if (expected_salary === undefined || isNaN(expected_salary)) return res.status(400).json({ error: 'Lương mong muốn phải là số!' });

    await query(
      'INSERT INTO candidates (full_name, email, phone, skills, experience, address, status, expected_salary, date_of_birth) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [full_name.trim(), email.trim(), phone.trim(), skills.trim(), experience.trim(), address.trim(), status || 'Chờ phê duyệt', expected_salary || 0, date_of_birth || null]
    );
    res.json({ message: 'Thêm ứng viên thành công!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi máy chủ!' });
  }
});

// Sua ung vien.
app.put('/api/candidates/:id', async (req, res) => {
  try {
    const { full_name, email, phone, skills, experience, address, status, expected_salary, date_of_birth } = req.body;
    await query(
      'UPDATE candidates SET full_name=?, email=?, phone=?, skills=?, experience=?, address=?, status=?, expected_salary=?, date_of_birth=? WHERE id=?',
      [full_name, email || null, phone || null, skills || null, experience || null, address || null, status, expected_salary || 0, date_of_birth || null, req.params.id]
    );
    res.json({ message: 'Cập nhật ứng viên thành công!' });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi máy chủ!' });
  }
});

// Tuyen dung ung vien.
app.put('/api/candidates/:id/hire', async (req, res) => {
  try {
    const { ma_nv, dept_id, pos_id, type, base_salary } = req.body;
    if (!ma_nv || !dept_id || !pos_id) {
       return res.status(400).json({ error: 'Vui lòng cung cấp Mã nhân viên, Phòng ban và Vị trí!' });
    }

    // Kiem tra thu cong ma_nv neu index UNIQUE chua hoat dong
    const existing = await query('SELECT id FROM employees WHERE ma_nv = ?', [ma_nv.trim()]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Mã nhân viên đã tồn tại trong hệ thống!' });
    }

    // Lay thong tin ung vien
    const cand = await query('SELECT * FROM candidates WHERE id = ?', [req.params.id]);
    if (cand.length === 0) return res.status(404).json({ error: 'Không tìm thấy ứng viên!' });
    const c = cand[0];

    // Them vao bang employees
    await query(
      `INSERT INTO employees (ma_nv, full_name, email, phone, address, gender, date_of_birth, hire_date, dept_id, pos_id, skills, experience, status, type, base_salary)
       VALUES (?, ?, ?, ?, ?, 'Nam', ?, NOW(), ?, ?, ?, ?, 'Đang làm việc', ?, ?)`,
      [ma_nv.trim(), c.full_name, c.email, c.phone, c.address || 'Chưa cập nhật', c.date_of_birth || '1990-01-01', dept_id, pos_id, c.skills, c.experience, type || 'Thử việc', base_salary || c.expected_salary || 0]
    );

    // Cap nhat trang thai ung vien
    await query("UPDATE candidates SET status = 'Đã tuyển' WHERE id = ?", [req.params.id]);
    res.json({ message: 'Đã tuyển dụng và chuyển thông tin sang hồ sơ nhân sự!' });
  } catch (err) {
    console.error('Loi tuyen dung:', err);
    if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'Mã nhân viên đã tồn tại!' });
    res.status(500).json({ error: 'Lỗi máy chủ!' });
  }
});

// Tu choi ung vien.
app.put('/api/candidates/:id/reject', async (req, res) => {
  try {
    await query("UPDATE candidates SET status = 'Từ chối' WHERE id = ?", [req.params.id]);
    res.json({ message: 'Đã từ chối ứng viên!' });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi máy chủ!' });
  }
});

// Xoa ung vien.
app.delete('/api/candidates/:id', async (req, res) => {
  try {
    await query('DELETE FROM candidates WHERE id = ?', [req.params.id]);
    res.json({ message: 'Xóa ứng viên thành công!' });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi máy chủ!' });
  }
});

// ==================== AWARDS ====================

// Lay danh sach khen thuong.
app.get('/api/awards', async (req, res) => {
  try {
    const results = await query(
      `SELECT a.*, e.full_name, e.ma_nv, d.dept_name
       FROM awards a
       LEFT JOIN employees e ON a.emp_id = e.id
       LEFT JOIN departments d ON e.dept_id = d.id
       ORDER BY a.award_date DESC`
    );
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi máy chủ!' });
  }
});

// Them khen thuong.
app.post('/api/awards', async (req, res) => {
  try {
    const { emp_id, title, amount, award_date } = req.body;
    if (!emp_id) return res.status(400).json({ error: 'Vui lòng chọn nhân viên!' });
    if (!title || !title.trim()) return res.status(400).json({ error: 'Danh hiệu không được để trống!' });
    if (!award_date) return res.status(400).json({ error: 'Ngày khen thưởng không được để trống!' });
    await query(
      'INSERT INTO awards (emp_id, title, amount, award_date) VALUES (?, ?, ?, ?)',
      [emp_id, title.trim(), amount || 0, award_date]
    );
    res.json({ message: 'Thêm khen thưởng thành công!' });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi máy chủ!' });
  }
});

// Sua khen thuong.
app.put('/api/awards/:id', async (req, res) => {
  try {
    const { emp_id, title, amount, award_date } = req.body;
    await query(
      'UPDATE awards SET emp_id=?, title=?, amount=?, award_date=? WHERE id=?',
      [emp_id, title, amount || 0, award_date || null, req.params.id]
    );
    res.json({ message: 'Cập nhật khen thưởng thành công!' });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi máy chủ!' });
  }
});

// Xoa khen thuong.
app.delete('/api/awards/:id', async (req, res) => {
  try {
    await query('DELETE FROM awards WHERE id = ?', [req.params.id]);
    res.json({ message: 'Xóa khen thưởng thành công!' });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi máy chủ!' });
  }
});

// ==================== ANALYTICS ====================

// Tong quan.
app.get('/api/analytics/overview', async (req, res) => {
  try {
    const [empCount] = await query("SELECT COUNT(*) as total FROM employees WHERE status != 'Nghỉ việc'");
    const [probCount] = await query("SELECT COUNT(*) as total FROM employees WHERE type = 'Thử việc' AND status != 'Nghỉ việc'");
    const [deptCount] = await query('SELECT COUNT(*) as total FROM departments');
    const [totalPayroll] = await query('SELECT SUM(total_salary) as total FROM payrolls');
    const [leaveCount] = await query("SELECT COUNT(*) as total FROM leave_requests WHERE status = 'Chờ duyệt'");
    const [candidateCount] = await query("SELECT COUNT(*) as total FROM candidates WHERE status = 'Chờ phê duyệt'");
    res.json({
      totalEmployees: empCount.total,
      totalProbation: probCount.total,
      totalDepartments: deptCount.total,
      totalPayroll: totalPayroll.total || 0,
      pendingLeaves: leaveCount.total,
      pendingCandidates: candidateCount.total,
    });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi máy chủ!' });
  }
});

// Thong ke theo phong ban.
app.get('/api/analytics/by-department', async (req, res) => {
  try {
    const results = await query(
      `SELECT d.dept_name, COUNT(e.id) as member_count
       FROM departments d
       LEFT JOIN employees e ON d.id = e.dept_id AND e.status != 'Nghỉ việc'
       GROUP BY d.id, d.dept_name
       ORDER BY member_count DESC`
    );
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi máy chủ!' });
  }
});

// Thong ke cham cong theo nhan vien.
app.get('/api/analytics/attendance-stats', async (req, res) => {
  try {
    const { emp_id, year } = req.query;
    const y = year || new Date().getFullYear();
    let sql = `
      SELECT
        MONTH(a.work_date) as month,
        COUNT(CASE WHEN a.status != 'Nghỉ' THEN 1 END) as work_days,
        COUNT(CASE WHEN a.status = 'Nghỉ' THEN 1 END) as leave_days
      FROM attendance a
      WHERE YEAR(a.work_date) = ?
    `;
    const params = [y];
    if (emp_id) { sql += ` AND a.emp_id = ?`; params.push(emp_id); }
    sql += ` GROUP BY MONTH(a.work_date) ORDER BY month`;
    const results = await query(sql, params);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi máy chủ!' });
  }
});

// Thong ke luong theo thang.
app.get('/api/analytics/payroll-stats', async (req, res) => {
  try {
    const { emp_id, year } = req.query;
    const y = year || new Date().getFullYear();
    let sql = `
      SELECT pr.month, SUM(pr.total_salary) as total
      FROM payrolls pr
      WHERE pr.year = ?
    `;
    const params = [y];
    if (emp_id) { sql += ` AND pr.emp_id = ?`; params.push(emp_id); }
    sql += ` GROUP BY pr.month ORDER BY pr.month`;
    const results = await query(sql, params);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi máy chủ!' });
  }
});

// Thong ke luong theo phong ban.
app.get('/api/analytics/payroll-by-dept', async (req, res) => {
  try {
    const { month, year } = req.query;
    let sql = `
      SELECT d.dept_name, SUM(pr.total_salary) as total_salary, COUNT(pr.id) as emp_count
      FROM payrolls pr
      LEFT JOIN employees e ON pr.emp_id = e.id
      LEFT JOIN departments d ON e.dept_id = d.id
      WHERE 1=1
    `;
    const params = [];
    if (month) { sql += ` AND pr.month = ?`; params.push(month); }
    if (year) { sql += ` AND pr.year = ?`; params.push(year); }
    sql += ` GROUP BY d.id, d.dept_name ORDER BY total_salary DESC`;
    const results = await query(sql, params);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi máy chủ!' });
  }
});

// Khoi dong server.
app.listen(PORT, () => {
  console.log(`Backend dang chay tai cong ${PORT}`);
});
