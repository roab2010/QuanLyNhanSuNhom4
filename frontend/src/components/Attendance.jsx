import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'https://quanlynhansunhom4.onrender.com';

export default function Attendance() {
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [filterEmp, setFilterEmp] = useState('');
  const [form, setForm] = useState({ emp_id: '', check_in: '', check_out: '', work_date: '', method: 'Manual', status: 'Đúng giờ', note: '' });

  const fetchRecords = () => {
    const params = new URLSearchParams({ month: filterMonth, year: filterYear });
    if (filterEmp) params.append('emp_id', filterEmp);
    fetch(`${API_URL}/api/attendance?${params}`).then(r => r.json()).then(setRecords).catch(() => {});
  };

  useEffect(() => {
    fetch(`${API_URL}/api/employees`).then(r => r.json()).then(setEmployees).catch(() => {});
  }, []);

  useEffect(() => { fetchRecords(); }, [filterMonth, filterYear, filterEmp]);

  const resetForm = () => { setForm({ emp_id: '', check_in: '', check_out: '', work_date: '', method: 'Manual', status: 'Đúng giờ', note: '' }); setEditId(null); };

  const openEdit = (r) => {
    setForm({
      emp_id: String(r.emp_id), work_date: r.work_date ? r.work_date.split('T')[0] : '',
      check_in: r.check_in ? r.check_in.replace(' ', 'T').slice(0, 16) : '', 
      check_out: r.check_out ? r.check_out.replace(' ', 'T').slice(0, 16) : '',
      method: r.method || 'Manual', status: r.status || 'Đúng giờ', note: r.note || ''
    });
    setEditId(r.id); setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.emp_id) return toast.error('Vui lòng chọn nhân viên!');
    if (!form.work_date) return toast.error('Vui lòng chọn ngày làm việc!');

    const method = editId ? 'PUT' : 'POST';
    const url = editId ? `${API_URL}/api/attendance/${editId}` : `${API_URL}/api/attendance`;
    try {
      const payload = { ...form, check_in: form.check_in || null, check_out: form.check_out || null };
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) return toast.error(data.error);
      toast.success(editId ? 'Cập nhật thành công!' : 'Thêm chấm công thành công!');
      setShowForm(false); resetForm(); fetchRecords();
    } catch { toast.error('Lỗi!'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa bản ghi chấm công này?')) return;
    await fetch(`${API_URL}/api/attendance/${id}`, { method: 'DELETE' });
    toast.success('Đã xóa!'); fetchRecords();
  };

  const statusColor = (s) => {
    if (s === 'Đúng giờ') return 'badge--success';
    if (s === 'Đi trễ') return 'badge--warning';
    if (s === 'Về sớm') return 'badge--info';
    if (s === 'Trễ/Sớm') return 'badge--danger';
    return 'badge--danger';
  };

  const formatTime = (t) => t ? new Date(t).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '—';

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <h2 className="page__title">Chấm công</h2>
          <p className="page__subtitle">Quản lý chấm công nhân viên</p>
        </div>
        <div className="page__actions">
          <button className="btn btn--primary" onClick={() => { resetForm(); setShowForm(true); }}><FiPlus /> Thêm chấm công thủ công</button>
        </div>
      </div>

      <div className="card" style={{marginBottom: '1.5rem'}}>
        <div className="filter-row">
          <select className="filter-select" value={filterEmp} onChange={e => setFilterEmp(e.target.value)}>
            <option value="">Tất cả nhân viên</option>
            {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.full_name} ({emp.ma_nv})</option>)}
          </select>
          <select className="filter-select" value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
            {Array.from({length: 12}, (_, i) => <option key={i+1} value={i+1}>Tháng {i+1}</option>)}
          </select>
          <select className="filter-select" value={filterYear} onChange={e => setFilterYear(e.target.value)}>
            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr><th>Mã NV</th><th>Nhân viên</th><th>Phòng ban</th><th>Ngày</th><th>Check In</th><th>Check Out</th><th>Phạt</th><th>Trạng thái</th><th>Hành động</th></tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr><td colSpan="9" className="table__empty">Không có dữ liệu</td></tr>
              ) : records.map(r => (
                <tr key={r.id}>
                  <td className="text-bold text-accent">{r.ma_nv || '—'}</td>
                  <td className="text-bold">{r.full_name || '—'}</td>
                  <td><span className="badge badge--info">{r.dept_name || '—'}</span></td>
                  <td>{r.work_date ? new Date(r.work_date).toLocaleDateString('vi-VN') : '—'}</td>
                  <td>{formatTime(r.check_in)}</td>
                  <td>{formatTime(r.check_out)}</td>
                  <td className="text-danger">{r.penalty_fee > 0 ? `${new Intl.NumberFormat('vi-VN').format(r.penalty_fee)}đ` : '—'}</td>
                  <td><span className={`badge ${statusColor(r.status)}`}>{r.status}</span></td>
                  <td>
                    <div className="table__actions">
                      <button className="btn-icon btn-icon--edit" onClick={() => openEdit(r)}><FiEdit2 /></button>
                      <button className="btn-icon btn-icon--delete" onClick={() => handleDelete(r.id)}><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal__header">
              <h3>{editId ? 'Sửa chấm công' : 'Thêm chấm công thủ công'}</h3>
              <button className="modal__close" onClick={() => setShowForm(false)}><FiX /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal__body">
              <div className="form-grid form-grid--2">
                <div className="form-group"><label>Nhân viên *</label>
                  <select required value={form.emp_id} onChange={e => setForm({...form, emp_id: e.target.value})}>
                    <option value="">-- Chọn --</option>
                    {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.full_name} ({emp.ma_nv})</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Ngày làm việc *</label>
                  <input type="date" required value={form.work_date} onChange={e => setForm({...form, work_date: e.target.value})} />
                </div>
                <div className="form-group"><label>Check In</label>
                  <input type="datetime-local" value={form.check_in} onChange={e => setForm({...form, check_in: e.target.value})} />
                </div>
                <div className="form-group"><label>Check Out</label>
                  <input type="datetime-local" value={form.check_out} onChange={e => setForm({...form, check_out: e.target.value})} />
                </div>
                <div className="form-group"><label>Phương thức</label>
                  <select value={form.method} onChange={e => setForm({...form, method: e.target.value})}>
                    <option value="Manual">Thủ công</option><option value="Card">Thẻ</option>
                  </select>
                </div>
                <div className="form-group"><label>Trạng thái</label>
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                    <option value="Đúng giờ">Đúng giờ</option><option value="Đi trễ">Đi trễ</option>
                    <option value="Về sớm">Về sớm</option><option value="Nghỉ">Nghỉ</option>
                  </select>
                </div>
                <div className="form-group" style={{gridColumn: 'span 2'}}><label>Ghi chú</label>
                  <input placeholder="Lý do trễ/pháp/nghỉ..." value={form.note || ''} onChange={e => setForm({...form, note: e.target.value})} />
                </div>
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
