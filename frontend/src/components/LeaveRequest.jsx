import { useState, useEffect } from 'react';
import { FiPlus, FiCheck, FiX, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'https://quanlynhansunhom4.onrender.com';

export default function LeaveRequest() {
  const [requests, setRequests] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [form, setForm] = useState({ emp_id: '', from_date: '', to_date: '', reason: '' });

  const fetchRequests = () => {
    let url = `${API_URL}/api/leave-requests`;
    if (statusFilter) url += `?status=${encodeURIComponent(statusFilter)}`;
    fetch(url).then(r => r.json()).then(setRequests).catch(() => {});
  };

  useEffect(() => {
    fetchRequests();
    fetch(`${API_URL}/api/employees`).then(r => r.json()).then(setEmployees).catch(() => {});
    fetch(`${API_URL}/api/departments`).then(r => r.json()).then(setDepartments).catch(() => {});
  }, [statusFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.emp_id) { toast.error('Vui lòng chọn nhân viên!'); return; }
    if (!form.from_date) { toast.error('Ngày bắt đầu không được để trống!'); return; }
    if (!form.to_date) { toast.error('Ngày kết thúc không được để trống!'); return; }
    if (new Date(form.to_date) < new Date(form.from_date)) { toast.error('Ngày kết thúc phải sau ngày bắt đầu!'); return; }
    if (!form.reason.trim()) { toast.error('Lý do nghỉ phép không được để trống!'); return; }
    try {
      const res = await fetch(`${API_URL}/api/leave-requests`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) return toast.error(data.error);
      toast.success('Đăng ký nghỉ phép thành công!');
      setShowForm(false); setForm({ emp_id: '', from_date: '', to_date: '', reason: '' }); fetchRequests();
    } catch { toast.error('Lỗi!'); }
  };

  const handleApprove = async (id) => {
    await fetch(`${API_URL}/api/leave-requests/${id}/approve`, { method: 'PUT' });
    toast.success('Đã duyệt!'); fetchRequests();
  };

  const handleReject = async (id) => {
    await fetch(`${API_URL}/api/leave-requests/${id}/reject`, { method: 'PUT' });
    toast.success('Đã từ chối!'); fetchRequests();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa đơn nghỉ phép này?')) return;
    await fetch(`${API_URL}/api/leave-requests/${id}`, { method: 'DELETE' });
    toast.success('Đã xóa!'); fetchRequests();
  };

  const statusColor = (s) => {
    if (s === 'Đã duyệt') return 'badge--success';
    if (s === 'Từ chối') return 'badge--danger';
    return 'badge--warning';
  };

  const calcDays = (from, to) => {
    if (!from || !to) return 0;
    return Math.ceil((new Date(to) - new Date(from)) / (1000 * 60 * 60 * 24)) + 1;
  };

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <h2 className="page__title">Quản lý Nghỉ phép</h2>
          <p className="page__subtitle">Duyệt và quản lý đơn xin nghỉ phép</p>
        </div>
        <div className="page__actions">
          <button className="btn btn--primary" onClick={() => setShowForm(true)}><FiPlus /> Đăng ký nghỉ phép</button>
        </div>
      </div>

      <div className="card" style={{marginBottom: '1rem', padding: '0.5rem'}}>
        <div className="tabs">
          <button className={`tab ${statusFilter === '' ? 'active' : ''}`} onClick={() => setStatusFilter('')}>Tất cả</button>
          <button className={`tab ${statusFilter === 'Chờ duyệt' ? 'active' : ''}`} onClick={() => setStatusFilter('Chờ duyệt')}>Chờ duyệt</button>
          <button className={`tab ${statusFilter === 'Đã duyệt' ? 'active' : ''}`} onClick={() => setStatusFilter('Đã duyệt')}>Đã duyệt</button>
          <button className={`tab ${statusFilter === 'Từ chối' ? 'active' : ''}`} onClick={() => setStatusFilter('Từ chối')}>Từ chối</button>
        </div>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr><th>Nhân viên</th><th>Phòng ban</th><th>Từ ngày</th><th>Đến ngày</th><th>Số ngày</th><th>Lý do</th><th>Trạng thái</th><th>Ngày tạo</th><th>Hành động</th></tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr><td colSpan="9" className="table__empty">Không có đơn nghỉ phép</td></tr>
              ) : requests.map(r => (
                <tr key={r.id}>
                  <td className="text-bold">{r.full_name || '—'}</td>
                  <td><span className="badge badge--info">{r.dept_name || '—'}</span></td>
                  <td>{r.from_date ? new Date(r.from_date).toLocaleDateString('vi-VN') : '—'}</td>
                  <td>{r.to_date ? new Date(r.to_date).toLocaleDateString('vi-VN') : '—'}</td>
                  <td className="text-center">{calcDays(r.from_date, r.to_date)}</td>
                  <td className="text-truncate">{r.reason || '—'}</td>
                  <td><span className={`badge ${statusColor(r.status)}`}>{r.status}</span></td>
                  <td>{r.created_at ? new Date(r.created_at).toLocaleDateString('vi-VN') : '—'}</td>
                  <td>
                    <div className="table__actions">
                      {r.status === 'Chờ duyệt' && (
                        <>
                          <button className="btn-icon btn-icon--success" onClick={() => handleApprove(r.id)} title="Duyệt"><FiCheck /></button>
                          <button className="btn-icon btn-icon--danger" onClick={() => handleReject(r.id)} title="Từ chối"><FiX /></button>
                        </>
                      )}
                      <button className="btn-icon btn-icon--delete" onClick={() => handleDelete(r.id)} title="Xóa"><FiTrash2 /></button>
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
              <h3>Đăng ký nghỉ phép</h3>
              <button className="modal__close" onClick={() => setShowForm(false)}><FiX /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal__body">
              <div className="form-group"><label>Nhân viên *</label>
                <select required value={form.emp_id} onChange={e => setForm({...form, emp_id: e.target.value})}>
                  <option value="">-- Chọn nhân viên --</option>
                  {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.full_name} ({emp.ma_nv}) - {departments.find(d => d.id === emp.dept_id)?.dept_name || ''}</option>)}
                </select>
              </div>
              <div className="form-grid form-grid--2">
                <div className="form-group"><label>Từ ngày *</label>
                  <input type="date" required value={form.from_date} onChange={e => setForm({...form, from_date: e.target.value})} />
                </div>
                <div className="form-group"><label>Đến ngày *</label>
                  <input type="date" required value={form.to_date} onChange={e => setForm({...form, to_date: e.target.value})} />
                </div>
              </div>
              <div className="form-group"><label>Lý do *</label>
                <textarea required rows={3} value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} placeholder="Nhập lý do nghỉ phép..." />
              </div>
              <div className="modal__footer">
                <button type="button" className="btn btn--ghost" onClick={() => setShowForm(false)}>Hủy</button>
                <button type="submit" className="btn btn--primary">Gửi đơn</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
