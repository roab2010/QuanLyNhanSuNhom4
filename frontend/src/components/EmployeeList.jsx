import { useState, useEffect } from 'react';
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiEye, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'https://quanlynhansunhom4.onrender.com';

export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    ma_nv: '', full_name: '', email: '', phone: '', address: '', gender: 'Nam',
    date_of_birth: '', hire_date: '', avatar_url: '', dept_id: '', pos_id: '',
    skills: '', experience: '', work_hours_per_day: 8, status: 'Đang làm việc', type: 'Chính thức', base_salary: ''
  });

  const fetchEmployees = () => {
    fetch(`${API_URL}/api/employees?search=${encodeURIComponent(search)}`)
      .then(r => r.json()).then(setEmployees).catch(() => {});
  };

  useEffect(() => {
    fetch(`${API_URL}/api/departments`).then(r => r.json()).then(setDepartments).catch(() => {});
    fetch(`${API_URL}/api/positions`).then(r => r.json()).then(setPositions).catch(() => {});
  }, []);

  useEffect(() => { fetchEmployees(); }, [search]);

  const resetForm = () => {
    setForm({ ma_nv: '', full_name: '', email: '', phone: '', address: '', gender: 'Nam', date_of_birth: '', hire_date: '', avatar_url: '', dept_id: '', pos_id: '', skills: '', experience: '', work_hours_per_day: 8, status: 'Đang làm việc', type: 'Chính thức', base_salary: '' });
    setEditId(null);
  };

  const openAdd = () => { resetForm(); setShowForm(true); };
  const openEdit = (emp) => {
    setForm({
      ma_nv: emp.ma_nv || '', full_name: emp.full_name || '', email: emp.email || '',
      phone: emp.phone || '', address: emp.address || '', gender: emp.gender || 'Nam',
      date_of_birth: emp.date_of_birth ? emp.date_of_birth.split('T')[0] : '',
      hire_date: emp.hire_date ? emp.hire_date.split('T')[0] : '',
      avatar_url: emp.avatar_url || '', dept_id: emp.dept_id ? String(emp.dept_id) : '',
      pos_id: emp.pos_id ? String(emp.pos_id) : '', skills: emp.skills || '',
      experience: emp.experience || '', work_hours_per_day: emp.work_hours_per_day || 8,
      status: emp.status || 'Đang làm việc', type: emp.type || 'Chính thức',
      base_salary: emp.base_salary || ''
    });
    setEditId(emp.id);
    setShowForm(true);
  };

  const validateForm = () => {
    if (!form.ma_nv.trim()) { toast.error('Mã nhân viên không được để trống!'); return false; }
    if (!form.full_name.trim()) { toast.error('Họ và tên không được để trống!'); return false; }
    if (!form.phone.trim()) { toast.error('Số điện thoại không được để trống!'); return false; }
    if (!/^[0-9]{9,11}$/.test(form.phone.trim())) { toast.error('Số điện thoại không hợp lệ (9-11 số)!'); return false; }
    if (!form.email.trim()) { toast.error('Email không được để trống!'); return false; }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) { toast.error('Email không hợp lệ!'); return false; }
    if (!form.address.trim()) { toast.error('Địa chỉ không được để trống!'); return false; }
    if (!form.dept_id) { toast.error('Vui lòng chọn phòng ban!'); return false; }
    if (!form.pos_id) { toast.error('Vui lòng chọn vị trí!'); return false; }
    if (!form.date_of_birth) { toast.error('Ngày sinh không được để trống!'); return false; }
    if (!form.hire_date) { toast.error('Ngày tuyển không được để trống!'); return false; }
    if (!form.skills.trim()) { toast.error('Kỹ năng không được để trống!'); return false; }
    if (!form.experience.trim()) { toast.error('Kinh nghiệm không được để trống!'); return false; }
    if (form.base_salary === '' || isNaN(form.base_salary)) { toast.error('Lương cơ bản phải là số!'); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    const method = editId ? 'PUT' : 'POST';
    const url = editId ? `${API_URL}/api/employees/${editId}` : `${API_URL}/api/employees`;
    try {
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) return toast.error(data.error);
      toast.success(editId ? 'Cập nhật thành công!' : 'Thêm nhân viên thành công!');
      setShowForm(false); resetForm(); fetchEmployees();
    } catch { toast.error('Lỗi kết nối!'); }
  };

  const handleDelete = async (id) => {
    if (!id) return;
    if (!window.confirm('Bạn có chắc muốn xóa nhân viên này? (Toàn bộ dữ liệu liên quan như chấm công, lương, khen thưởng cũng sẽ bị xóa)')) return;
    try {
      const res = await fetch(`${API_URL}/api/employees/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        return toast.error(data.error || 'Lỗi khi xóa nhân viên!');
      }
      toast.success('Xóa nhân viên thành công!');
      fetchEmployees();
    } catch {
      toast.error('Lỗi kết nối máy chủ!');
    }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '—';

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <h2 className="page__title">Danh sách Nhân sự</h2>
          <p className="page__subtitle">Quản lý thông tin nhân viên trong hệ thống</p>
        </div>
        <div className="page__actions">
          <div className="search-box">
            <FiSearch className="search-box__icon" />
            <input placeholder="Tìm tên, mã NV, email..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="btn btn--primary" onClick={openAdd}><FiPlus /> Thêm nhân sự</button>
        </div>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Ảnh</th><th>Tên nhân sự</th><th>Loại NV</th><th>Lương CB</th>
                <th>Phòng ban</th><th>Vị trí</th><th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr><td colSpan="7" className="table__empty">Không có dữ liệu</td></tr>
              ) : employees.map(emp => (
                <tr key={emp.id}>
                  <td>
                    <div className="avatar avatar--sm">
                      {emp.avatar_url ? <img src={emp.avatar_url} alt="" /> : <span>{(emp.full_name || '?')[0]}</span>}
                    </div>
                  </td>
                  <td className="text-bold">{emp.full_name}</td>
                  <td>
                    <span className={`badge ${emp.type === 'Thử việc' ? 'badge--info' : 'badge--success'}`}>{emp.type}</span>
                  </td>
                  <td className="text-bold">{new Intl.NumberFormat('vi-VN').format(emp.base_salary || 0)}đ</td>
                  <td><span className="badge badge--secondary">{emp.department || '—'}</span></td>
                  <td>{emp.position_name || '—'}</td>
                  <td>
                    <div className="table__actions">
                      <button className="btn-icon btn-icon--view" onClick={() => setShowDetail(emp)} title="Xem chi tiết"><FiEye /></button>
                      <button className="btn-icon btn-icon--edit" onClick={() => openEdit(emp)} title="Sửa"><FiEdit2 /></button>
                      <button className="btn-icon btn-icon--delete" onClick={() => handleDelete(emp.id)} title="Xóa"><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal them/sua */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal modal--lg" onClick={e => e.stopPropagation()}>
            <div className="modal__header">
              <h3>{editId ? 'Cập nhật nhân viên' : 'Thêm nhân viên mới'}</h3>
              <button className="modal__close" onClick={() => setShowForm(false)}><FiX /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal__body">
              <div className="form-grid form-grid--3">
                <div className="form-group">
                  <label>Mã NV *</label>
                  <input required value={form.ma_nv} onChange={e => setForm({...form, ma_nv: e.target.value.toUpperCase()})} />
                </div>
                <div className="form-group">
                  <label>Họ và tên *</label>
                  <input required value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="email@example.com" />
                </div>
                <div className="form-group">
                  <label>SĐT *</label>
                  <input required value={form.phone} onChange={e => setForm({...form, phone: e.target.value.replace(/[^0-9]/g, '')})} maxLength={11} />
                </div>
                <div className="form-group">
                  <label>Giới tính</label>
                  <select value={form.gender} onChange={e => setForm({...form, gender: e.target.value})}>
                    <option value="Nam">Nam</option><option value="Nữ">Nữ</option><option value="Khác">Khác</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Ngày sinh *</label>
                  <input type="date" required value={form.date_of_birth} onChange={e => setForm({...form, date_of_birth: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Ngày tuyển *</label>
                  <input type="date" required value={form.hire_date} onChange={e => setForm({...form, hire_date: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Phòng ban *</label>
                  <select required value={form.dept_id} onChange={e => setForm({...form, dept_id: e.target.value})}>
                    <option value="">-- Chọn --</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.dept_name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Vị trí *</label>
                  <select required value={form.pos_id} onChange={e => setForm({...form, pos_id: e.target.value})}>
                    <option value="">-- Chọn --</option>
                    {positions.map(p => <option key={p.id} value={p.id}>{p.pos_name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Giờ làm/ngày</label>
                  <input type="number" value={form.work_hours_per_day} onChange={e => setForm({...form, work_hours_per_day: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Trạng thái</label>
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                    <option value="Đang làm việc">Đang làm việc</option>
                    <option value="Thử việc">Thử việc</option>
                    <option value="Nghỉ việc">Nghỉ việc</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Loại nhân viên</label>
                  <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                    <option value="Chính thức">Chính thức</option>
                    <option value="Thử việc">Thử việc</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Lương cơ bản *</label>
                  <input type="number" required value={form.base_salary} onChange={e => setForm({...form, base_salary: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>URL ảnh đại diện</label>
                  <input value={form.avatar_url} onChange={e => setForm({...form, avatar_url: e.target.value})} placeholder="https://..." />
                </div>
              </div>
              <div className="form-group">
                <label>Địa chỉ *</label>
                <input required value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="VD: 123 Đường ABC, Quận XYZ, TP.HCM" />
              </div>
              <div className="form-grid form-grid--2">
                <div className="form-group">
                  <label>Kỹ năng *</label>
                  <textarea required rows={2} value={form.skills} onChange={e => setForm({...form, skills: e.target.value})} placeholder="VD: React, Node.js, SQL..." />
                </div>
                <div className="form-group">
                  <label>Kinh nghiệm *</label>
                  <textarea required rows={2} value={form.experience} onChange={e => setForm({...form, experience: e.target.value})} placeholder="VD: 3 năm phát triển web..." />
                </div>
              </div>
              <div className="modal__footer">
                <button type="button" className="btn btn--ghost" onClick={() => setShowForm(false)}>Hủy</button>
                <button type="submit" className="btn btn--primary">{editId ? 'Lưu thay đổi' : 'Thêm nhân viên'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal xem chi tiet */}
      {showDetail && (
        <div className="modal-overlay" onClick={() => setShowDetail(null)}>
          <div className="modal modal--md" onClick={e => e.stopPropagation()}>
            <div className="modal__header">
              <h3>Chi tiết nhân viên</h3>
              <button className="modal__close" onClick={() => setShowDetail(null)}><FiX /></button>
            </div>
            <div className="modal__body">
              <div className="detail-card">
                <div className="detail-card__avatar">
                  {showDetail.avatar_url ? <img src={showDetail.avatar_url} alt="" /> :
                    <div className="avatar avatar--lg"><span>{(showDetail.full_name || '?')[0]}</span></div>}
                </div>
                <h3 className="detail-card__name">{showDetail.full_name}</h3>
                <span className={`badge ${showDetail.status === 'Đang làm việc' ? 'badge--success' : showDetail.status === 'Thử việc' ? 'badge--warning' : 'badge--danger'}`}>
                  {showDetail.status}
                </span>
                <div className="detail-grid">
                  <div><strong>Mã NV:</strong> {showDetail.ma_nv}</div>
                  <div><strong>Email:</strong> {showDetail.email || '—'}</div>
                  <div><strong>SĐT:</strong> {showDetail.phone || '—'}</div>
                  <div><strong>Giới tính:</strong> {showDetail.gender}</div>
                  <div><strong>Ngày sinh:</strong> {formatDate(showDetail.date_of_birth)}</div>
                  <div><strong>Ngày tuyển:</strong> {formatDate(showDetail.hire_date)}</div>
                  <div><strong>Loại nhân viên:</strong> {showDetail.type || 'Chính thức'}</div>
                  <div><strong>Lương cơ bản:</strong> <span className="text-bold" style={{color: 'var(--primary)'}}>{new Intl.NumberFormat('vi-VN').format(showDetail.base_salary || 0)}đ</span></div>
                  <div><strong>Phòng ban:</strong> {showDetail.department || '—'}</div>
                  <div><strong>Vị trí:</strong> {showDetail.position_name || '—'}</div>
                  <div><strong>Giờ làm/ngày:</strong> {showDetail.work_hours_per_day || 8}h</div>
                  <div><strong>Địa chỉ:</strong> {showDetail.address || '—'}</div>
                  <div className="detail-grid__full"><strong>Kỹ năng:</strong> {showDetail.skills || '—'}</div>
                  <div className="detail-grid__full"><strong>Kinh nghiệm:</strong> {showDetail.experience || '—'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
