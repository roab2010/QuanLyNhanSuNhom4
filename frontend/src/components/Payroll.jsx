import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiPrinter, FiUserCheck } from 'react-icons/fi';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'https://quanlynhansunhom4.onrender.com';

const formatMoney = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v || 0);

export default function Payroll() {
  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [form, setForm] = useState({ emp_id: '', month: new Date().getMonth() + 1, year: new Date().getFullYear(), base_salary: '', actual_work_days: '', bonus: '0', deductions: '0' });

  const fetchPayrolls = () => {
    const params = new URLSearchParams();
    if (filterMonth) params.append('month', filterMonth);
    if (filterYear) params.append('year', filterYear);
    fetch(`${API_URL}/api/payrolls?${params}`).then(r => r.json()).then(setPayrolls).catch(() => {});
  };

  useEffect(() => {
    fetch(`${API_URL}/api/employees`).then(r => r.json()).then(setEmployees).catch(() => {});
  }, []);

  useEffect(() => { fetchPayrolls(); }, [filterMonth, filterYear]);

  const resetForm = () => { setForm({ emp_id: '', month: new Date().getMonth() + 1, year: new Date().getFullYear(), base_salary: '', actual_work_days: '', bonus: '0', deductions: '0' }); setEditId(null); };

  const openEdit = (p) => {
    setForm({ emp_id: String(p.emp_id), month: p.month, year: p.year, base_salary: p.base_salary, actual_work_days: p.actual_work_days, bonus: p.bonus, deductions: p.deductions });
    setEditId(p.id); setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.emp_id) return toast.error('Vui lòng chọn nhân viên!');
    if (!form.base_salary || parseFloat(form.base_salary) <= 0) return toast.error('Lương cơ bản phải lớn hơn 0!');
    if (!form.actual_work_days || parseInt(form.actual_work_days) < 0) return toast.error('Số ngày công không hợp lệ!');

    const method = editId ? 'PUT' : 'POST';
    const url = editId ? `${API_URL}/api/payrolls/${editId}` : `${API_URL}/api/payrolls`;
    try {
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) return toast.error(data.error);
      toast.success(editId ? 'Cập nhật thành công!' : 'Thêm bảng lương thành công!');
      setShowForm(false); resetForm(); fetchPayrolls();
    } catch { toast.error('Lỗi!'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa bảng lương này?')) return;
    await fetch(`${API_URL}/api/payrolls/${id}`, { method: 'DELETE' });
    toast.success('Đã xóa!'); fetchPayrolls();
  };

  const handleRunPayroll = async () => {
    if (!filterMonth || !filterYear) return toast.error('Vui lòng chọn tháng và năm để chốt lương!');
    if (!window.confirm(`Bạn có chắc chắn muốn chốt lương cho tất cả nhân viên trong tháng ${filterMonth}/${filterYear}?`)) return;
    
    try {
      const res = await fetch(`${API_URL}/api/payrolls/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month: parseInt(filterMonth), year: parseInt(filterYear) })
      });
      const data = await res.json();
      if (!res.ok) return toast.error(data.error);
      toast.success(data.message);
      fetchPayrolls();
    } catch { toast.error('Lỗi khi chốt lương!'); }
  };

  const handlePrint = () => {
    const printContent = document.getElementById('payroll-table');
    const win = window.open('', '', 'width=1200,height=800');
    win.document.write(`<html><head><title>Bảng Lương</title><style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      h2 { text-align: center; margin-bottom: 20px; }
      table { width: 100%; border-collapse: collapse; }
      th, td { border: 1px solid #333; padding: 8px; text-align: left; font-size: 12px; }
      th { background: #f0f0f0; }
      .text-right { text-align: right; }
      .note { margin-top: 20px; font-size: 11px; }
      .note p { margin: 4px 0; }
    </style></head><body>
      <h2>BẢNG LƯƠNG NHÂN VIÊN</h2>
      <p style="text-align:center">Tháng ${filterMonth || '—'} / ${filterYear || '—'}</p>
      ${printContent.outerHTML}
      <div class="note">
        <p><strong>Công thức:</strong> Lương theo ngày công = (Lương cơ bản / 26) × Số ngày làm</p>
        <p><strong>Tổng lương = </strong>Lương theo ngày công + Thưởng - Khấu trừ</p>
      </div>
    </body></html>`);
    win.document.close();
    win.print();
  };

  // Tinh tong luong preview
  const calcTotal = () => {
    const daily = (parseFloat(form.base_salary) || 0) / 26;
    return daily * (parseInt(form.actual_work_days) || 0) + (parseFloat(form.bonus) || 0) - (parseFloat(form.deductions) || 0);
  };

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <h2 className="page__title">Tính lương</h2>
          <p className="page__subtitle">Quản lý bảng lương nhân viên</p>
        </div>
        <div className="page__actions">
          <button className="btn btn--secondary" onClick={handlePrint}><FiPrinter /> In bảng lương</button>
          <button className="btn btn--primary" onClick={() => { resetForm(); setShowForm(true); }}><FiPlus /> Thêm bảng lương</button>
        </div>
      </div>

      <div className="card" style={{marginBottom: '1.5rem'}}>
        <div className="filter-row">
          <select className="filter-select" value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
            <option value="">Tất cả tháng</option>
            {Array.from({length: 12}, (_, i) => <option key={i+1} value={i+1}>Tháng {i+1}</option>)}
          </select>
          <select className="filter-select" value={filterYear} onChange={e => setFilterYear(e.target.value)}>
            <option value="">Năm</option>
            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button className="btn btn--success" onClick={handleRunPayroll}>
            <FiUserCheck /> Chốt lương tháng {filterMonth && filterYear ? `${filterMonth}/${filterYear}` : ''}
          </button>
        </div>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table className="table" id="payroll-table">
            <thead>
              <tr><th>Tên NV</th><th>Ngày sinh</th><th>Phòng ban</th><th>Chức vụ</th><th>Tháng</th><th>Lương CB</th><th>Ngày công</th><th>Thưởng</th><th>Khấu trừ</th><th>Tổng lương</th><th className="no-print">Hành động</th></tr>
            </thead>
            <tbody>
              {payrolls.length === 0 ? (
                <tr><td colSpan="11" className="table__empty">Không có dữ liệu</td></tr>
              ) : payrolls.map(p => (
                <tr key={p.id}>
                  <td className="text-bold">{p.full_name || '—'}</td>
                  <td>{p.date_of_birth ? new Date(p.date_of_birth).toLocaleDateString('vi-VN') : '—'}</td>
                  <td><span className="badge badge--info">{p.dept_name || '—'}</span></td>
                  <td>{p.pos_name || '—'}</td>
                  <td>{p.month}/{p.year}</td>
                  <td className="text-right">{formatMoney(p.base_salary)}</td>
                  <td className="text-center">{p.actual_work_days}</td>
                  <td className="text-right text-success">{formatMoney(p.bonus)}</td>
                  <td className="text-right text-danger">{formatMoney(p.deductions)}</td>
                  <td className="text-right text-bold">{formatMoney(p.total_salary)}</td>
                  <td className="no-print">
                    <div className="table__actions">
                      <button className="btn-icon btn-icon--edit" onClick={() => openEdit(p)}><FiEdit2 /></button>
                      <button className="btn-icon btn-icon--delete" onClick={() => handleDelete(p.id)}><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{marginTop: '1rem'}}>
        <p className="text-muted" style={{fontSize: '0.85rem'}}>
          <strong>📌 Công thức:</strong> Lương theo ngày công = (Lương cơ bản / 26) × Số ngày làm | Thưởng = Bonus (chuyên cần, KPI, lễ…) | Khấu trừ = Trừ (nghỉ không phép, đi trễ, phạt…)
        </p>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal__header">
              <h3>{editId ? 'Sửa bảng lương' : 'Thêm bảng lương mới'}</h3>
              <button className="modal__close" onClick={() => setShowForm(false)}><FiX /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal__body">
              <div className="form-grid form-grid--2">
                <div className="form-group"><label>Nhân viên *</label>
                  <select required value={form.emp_id} onChange={e => {
                    const emp = employees.find(x => String(x.id) === e.target.value);
                    setForm({...form, emp_id: e.target.value, base_salary: emp ? emp.base_salary : ''});
                  }}>
                    <option value="">-- Chọn --</option>
                    {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.full_name} ({emp.ma_nv})</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Tháng *</label>
                  <select required value={form.month} onChange={e => setForm({...form, month: e.target.value})}>
                    {Array.from({length: 12}, (_, i) => <option key={i+1} value={i+1}>Tháng {i+1}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Năm *</label>
                  <input type="number" required value={form.year} onChange={e => setForm({...form, year: e.target.value})} />
                </div>
                <div className="form-group"><label>Lương cơ bản *</label>
                  <input type="number" required value={form.base_salary} onChange={e => setForm({...form, base_salary: e.target.value})} />
                </div>
                <div className="form-group"><label>Số ngày công *</label>
                  <input type="number" required value={form.actual_work_days} onChange={e => setForm({...form, actual_work_days: e.target.value})} />
                </div>
                <div className="form-group"><label>Thưởng</label>
                  <input type="number" value={form.bonus} onChange={e => setForm({...form, bonus: e.target.value})} />
                </div>
                <div className="form-group"><label>Khấu trừ</label>
                  <input type="number" value={form.deductions} onChange={e => setForm({...form, deductions: e.target.value})} />
                </div>
              </div>
              <div className="payroll-preview">
                <strong>Tổng lương dự kiến: </strong>{formatMoney(calcTotal())}
              </div>
              <div className="modal__footer">
                <button type="button" className="btn btn--ghost" onClick={() => setShowForm(false)}>Hủy</button>
                <button type="submit" className="btn btn--primary">{editId ? 'Lưu' : 'Thêm'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
