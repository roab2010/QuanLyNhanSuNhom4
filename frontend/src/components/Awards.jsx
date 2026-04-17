import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiAward } from 'react-icons/fi';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'https://quanlynhansunhom4.onrender.com';
const formatMoney = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v || 0);

export default function Awards() {
  const [awards, setAwards] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ emp_id: '', title: '', amount: '', award_date: '' });

  const fetchAwards = () => {
    fetch(`${API_URL}/api/awards`).then(r => r.json()).then(setAwards).catch(() => {});
  };

  useEffect(() => {
    fetchAwards();
    fetch(`${API_URL}/api/employees`).then(r => r.json()).then(setEmployees).catch(() => {});
  }, []);

  const resetForm = () => { setForm({ emp_id: '', title: '', amount: '', award_date: '' }); setEditId(null); };

  const openEdit = (a) => {
    setForm({ emp_id: String(a.emp_id), title: a.title || '', amount: a.amount || '', award_date: a.award_date ? a.award_date.split('T')[0] : '' });
    setEditId(a.id); setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.emp_id) { toast.error('Vui lòng chọn nhân viên!'); return; }
    if (!form.title.trim()) { toast.error('Danh hiệu không được để trống!'); return; }
    if (!form.award_date) { toast.error('Ngày khen thưởng không được để trống!'); return; }
    const method = editId ? 'PUT' : 'POST';
    const url = editId ? `${API_URL}/api/awards/${editId}` : `${API_URL}/api/awards`;
    try {
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) return toast.error(data.error);
      toast.success(editId ? 'Cập nhật thành công!' : 'Thêm khen thưởng thành công!');
      setShowForm(false); resetForm(); fetchAwards();
    } catch { toast.error('Lỗi!'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa khen thưởng này?')) return;
    await fetch(`${API_URL}/api/awards/${id}`, { method: 'DELETE' });
    toast.success('Đã xóa!'); fetchAwards();
  };

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <h2 className="page__title">Khen thưởng</h2>
          <p className="page__subtitle">Quản lý khen thưởng nhân viên</p>
        </div>
        <div className="page__actions">
          <button className="btn btn--primary" onClick={() => { resetForm(); setShowForm(true); }}><FiPlus /> Thêm khen thưởng</button>
        </div>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr><th>Nhân viên</th><th>Mã NV</th><th>Phòng ban</th><th>Danh hiệu</th><th className="text-right">Số tiền</th><th>Ngày</th><th>Hành động</th></tr>
            </thead>
            <tbody>
              {awards.length === 0 ? (
                <tr><td colSpan="7" className="table__empty">Chưa có khen thưởng</td></tr>
              ) : awards.map(a => (
                <tr key={a.id}>
                  <td className="text-bold">{a.full_name || '—'}</td>
                  <td className="text-accent">{a.ma_nv || '—'}</td>
                  <td><span className="badge badge--info">{a.dept_name || '—'}</span></td>
                  <td>
                    <div className="award-title">
                      <FiAward className="award-title__icon" />
                      <span>{a.title}</span>
                    </div>
                  </td>
                  <td className="text-right text-bold text-success">{formatMoney(a.amount)}</td>
                  <td>{a.award_date ? new Date(a.award_date).toLocaleDateString('vi-VN') : '—'}</td>
                  <td>
                    <div className="table__actions">
                      <button className="btn-icon btn-icon--edit" onClick={() => openEdit(a)}><FiEdit2 /></button>
                      <button className="btn-icon btn-icon--delete" onClick={() => handleDelete(a.id)}><FiTrash2 /></button>
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
          <div className="modal modal--sm" onClick={e => e.stopPropagation()}>
            <div className="modal__header">
              <h3>{editId ? 'Sửa khen thưởng' : 'Thêm khen thưởng'}</h3>
              <button className="modal__close" onClick={() => setShowForm(false)}><FiX /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal__body">
              <div className="form-group"><label>Nhân viên *</label>
                <select required value={form.emp_id} onChange={e => setForm({...form, emp_id: e.target.value})}>
                  <option value="">-- Chọn --</option>
                  {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.full_name} ({emp.ma_nv})</option>)}
                </select>
              </div>
              <div className="form-group"><label>Danh hiệu *</label>
                <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="VD: Nhân viên xuất sắc Q1" />
              </div>
              <div className="form-grid form-grid--2">
                <div className="form-group"><label>Số tiền thưởng</label>
                  <input type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} />
                </div>
                <div className="form-group"><label>Ngày khen thưởng *</label>
                  <input type="date" required value={form.award_date} onChange={e => setForm({...form, award_date: e.target.value})} />
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
