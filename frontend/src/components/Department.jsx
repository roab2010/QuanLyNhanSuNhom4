import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'https://quanlynhansunhom4.onrender.com';

export default function Department() {
  const [departments, setDepartments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ dept_name: '', description: '' });

  const fetchDepts = () => {
    fetch(`${API_URL}/api/departments`).then(r => r.json()).then(setDepartments).catch(() => {});
  };

  useEffect(() => { fetchDepts(); }, []);

  const resetForm = () => { setForm({ dept_name: '', description: '' }); setEditId(null); };

  const openEdit = (d) => {
    setForm({ dept_name: d.dept_name, description: d.description || '' });
    setEditId(d.id); setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.dept_name.trim()) return toast.error('Tên phòng ban không được để trống!');

    const method = editId ? 'PUT' : 'POST';
    const url = editId ? `${API_URL}/api/departments/${editId}` : `${API_URL}/api/departments`;
    try {
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) return toast.error(data.error);
      toast.success(editId ? 'Cập nhật thành công!' : 'Thêm phòng ban thành công!');
      setShowForm(false); resetForm(); fetchDepts();
    } catch { toast.error('Lỗi!'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa phòng ban này? Nhân viên thuộc phòng ban sẽ không còn phòng ban.')) return;
    await fetch(`${API_URL}/api/departments/${id}`, { method: 'DELETE' });
    toast.success('Đã xóa!'); fetchDepts();
  };

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <h2 className="page__title">Quản lý Phòng ban</h2>
          <p className="page__subtitle">Tổ chức và quản lý các phòng ban trong công ty</p>
        </div>
        <div className="page__actions">
          <button className="btn btn--primary" onClick={() => { resetForm(); setShowForm(true); }}><FiPlus /> Thêm phòng ban</button>
        </div>
      </div>

      <div className="grid grid--3">
        {departments.length === 0 ? (
          <div className="card" style={{gridColumn: '1 / -1'}}><p className="table__empty">Chưa có phòng ban nào</p></div>
        ) : departments.map(d => (
          <div key={d.id} className="card card--dept">
            <div className="dept-card">
              <div className="dept-card__icon">{d.dept_name.charAt(0)}</div>
              <div className="dept-card__info">
                <h3 className="dept-card__name">{d.dept_name}</h3>
                <p className="dept-card__desc">{d.description || 'Không có mô tả'}</p>
                <div className="dept-card__meta">
                  <span className="badge badge--info">ID: {d.id}</span>
                  <span className="dept-card__count">{d.member_count || 0} thành viên</span>
                </div>
              </div>
              <div className="dept-card__actions">
                <button className="btn-icon btn-icon--edit" onClick={() => openEdit(d)}><FiEdit2 /></button>
                <button className="btn-icon btn-icon--delete" onClick={() => handleDelete(d.id)}><FiTrash2 /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal modal--sm" onClick={e => e.stopPropagation()}>
            <div className="modal__header">
              <h3>{editId ? 'Sửa phòng ban' : 'Thêm phòng ban mới'}</h3>
              <button className="modal__close" onClick={() => setShowForm(false)}><FiX /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal__body">
              <div className="form-group">
                <label>Tên phòng ban *</label>
                <input required value={form.dept_name} onChange={e => setForm({...form, dept_name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Mô tả</label>
                <textarea rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
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
