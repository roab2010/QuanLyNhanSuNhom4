import { useState, useEffect } from 'react';
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiEye, FiX, FiUserCheck, FiUserX } from 'react-icons/fi';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'https://quanlynhansunhom4.onrender.com';

export default function Recruitment() {
  const [candidates, setCandidates] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [search, setSearch] = useState({ skills: '', experience: '' });
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [showHireModal, setShowHireModal] = useState(null);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', skills: '', experience: '', address: '', expected_salary: '', date_of_birth: '', status: 'Chờ phê duyệt' });
  const [hireForm, setHireForm] = useState({ ma_nv: '', dept_id: '', pos_id: '', type: 'Thử việc', base_salary: '' });

  const fetchCandidates = () => {
    const params = new URLSearchParams();
    if (search.skills) params.append('skills', search.skills);
    if (search.experience) params.append('experience', search.experience);
    fetch(`${API_URL}/api/candidates?${params}`).then(r => r.json()).then(setCandidates).catch(() => {});
  };

  const fetchDeptsAndPositions = () => {
    fetch(`${API_URL}/api/departments`).then(r => r.json()).then(setDepartments).catch(() => {});
    fetch(`${API_URL}/api/positions`).then(r => r.json()).then(setPositions).catch(() => {});
  };

  useEffect(() => { 
    fetchCandidates(); 
    fetchDeptsAndPositions();
  }, []);

  const resetForm = () => { setForm({ full_name: '', email: '', phone: '', skills: '', experience: '', address: '', expected_salary: '', date_of_birth: '', status: 'Chờ phê duyệt' }); setEditId(null); };

  const openEdit = (c) => {
    setForm({ full_name: c.full_name, email: c.email || '', phone: c.phone || '', skills: c.skills || '', experience: c.experience || '', address: c.address || '', expected_salary: c.expected_salary || '', date_of_birth: c.date_of_birth ? c.date_of_birth.split('T')[0] : '', status: c.status || 'Chờ phê duyệt' });
    setEditId(c.id); setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.full_name.trim()) { toast.error('Họ và tên không được để trống!'); return; }
    if (!form.email.trim()) { toast.error('Email không được để trống!'); return; }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { toast.error('Email không hợp lệ!'); return; }
    if (!form.phone.trim()) { toast.error('SĐT không được để trống!'); return; }
    if (!form.experience.trim()) { toast.error('Kinh nghiệm không được để trống!'); return; }
    if (!form.address.trim()) { toast.error('Địa chỉ không được để trống!'); return; }
    if (form.expected_salary === '' || isNaN(form.expected_salary)) { toast.error('Lương mong muốn phải là số!'); return; }
    const method = editId ? 'PUT' : 'POST';
    const url = editId ? `${API_URL}/api/candidates/${editId}` : `${API_URL}/api/candidates`;
    try {
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) return toast.error(data.error || 'Lỗi xử lý!');
      toast.success(editId ? 'Cập nhật thành công!' : 'Thêm ứng viên thành công!');
      setShowForm(false); resetForm(); fetchCandidates();
    } catch { toast.error('Lỗi kết nối!'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa ứng viên này?')) return;
    try {
      const res = await fetch(`${API_URL}/api/candidates/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) return toast.error(data.error || 'Lỗi khi xóa!');
      toast.success('Đã xóa!'); fetchCandidates();
    } catch { toast.error('Lỗi kết nối!'); }
  };

  const handleHireSubmit = async (e) => {
    e.preventDefault();
    if (!hireForm.ma_nv || !hireForm.dept_id || !hireForm.pos_id) {
       return toast.error('Vui lòng điền đủ Mã NV, Phòng ban và Vị trí!');
    }
    try {
      const res = await fetch(`${API_URL}/api/candidates/${showHireModal.id}/hire`, { 
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hireForm)
      });
      const data = await res.json();
      if (!res.ok) return toast.error(data.error || 'Lỗi khi tuyển dụng!');
      toast.success('Đã tuyển dụng và tạo hồ sơ nhân sự!');
      setShowHireModal(null);
      setHireForm({ ma_nv: '', dept_id: '', pos_id: '', type: 'Thử việc' });
      fetchCandidates();
    } catch { toast.error('Lỗi kết nối!'); }
  };

  const handleReject = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/candidates/${id}/reject`, { method: 'PUT' });
      if (!res.ok) return toast.error('Lỗi khi từ chối!');
      toast.success('Đã từ chối!'); fetchCandidates();
    } catch { toast.error('Lỗi kết nối!'); }
  };

  const statusColor = (s) => {
    if (s === 'Đã tuyển') return 'badge--success';
    if (s === 'Từ chối') return 'badge--danger';
    if (s === 'Ứng viên tiềm năng') return 'badge--warning';
    return 'badge--info';
  };

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <h2 className="page__title">Tuyển chọn & Sàng lọc</h2>
          <p className="page__subtitle">Quản lý ứng viên và quy trình tuyển dụng</p>
        </div>
        <div className="page__actions">
          <button className="btn btn--primary" onClick={() => { resetForm(); setShowForm(true); }}><FiPlus /> Thêm ứng viên</button>
        </div>
      </div>

      <div className="card" style={{marginBottom: '1.5rem'}}>
        <div className="filter-row">
          <div className="search-box">
            <FiSearch className="search-box__icon" />
            <input placeholder="Kỹ năng (Của bạn: react, laravel)..." value={search.skills} onChange={e => setSearch({...search, skills: e.target.value})} />
          </div>
          <div className="search-box">
            <FiSearch className="search-box__icon" />
            <input placeholder="Lọc theo kinh nghiệm..." value={search.experience} onChange={e => setSearch({...search, experience: e.target.value})} />
          </div>
          <button className="btn btn--secondary" onClick={fetchCandidates}>Lọc</button>
        </div>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr><th>Họ tên</th><th>Y/c Lương</th><th>Kỹ năng</th><th>Trạng thái</th><th>Hành động</th></tr>
            </thead>
            <tbody>
              {candidates.length === 0 ? (
                <tr><td colSpan="5" className="table__empty">Không có ứng viên</td></tr>
              ) : candidates.map(c => (
                <tr key={c.id}>
                  <td className="text-bold">{c.full_name}</td>
                  <td className="text-bold">{new Intl.NumberFormat('vi-VN').format(c.expected_salary || 0)}đ</td>
                  <td className="text-truncate" style={{maxWidth: '150px'}} title={c.skills}>{c.skills || '—'}</td>
                  <td><span className={`badge ${statusColor(c.status)}`}>{c.status}</span></td>
                  <td>
                    <div className="table__actions">
                      <button className="btn-icon btn-icon--view" onClick={() => setShowDetail(c)} title="Chi tiết"><FiEye /></button>
                      <button className="btn-icon btn-icon--edit" onClick={() => openEdit(c)} title="Sửa"><FiEdit2 /></button>
                      <button className="btn-icon btn-icon--delete" onClick={() => handleDelete(c.id)} title="Xóa"><FiTrash2 /></button>
                      {c.status !== 'Đã tuyển' && c.status !== 'Từ chối' && (
                        <>
                          <button className="btn-icon btn-icon--success" onClick={() => setShowHireModal(c)} title="Tuyển dụng"><FiUserCheck /></button>
                          <button className="btn-icon btn-icon--danger" onClick={() => handleReject(c.id)} title="Từ chối"><FiUserX /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal form */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal__header">
              <h3>{editId ? 'Sửa ứng viên' : 'Thêm ứng viên'}</h3>
              <button className="modal__close" onClick={() => setShowForm(false)}><FiX /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal__body">
              <div className="form-grid form-grid--2">
                <div className="form-group"><label>Họ tên *</label><input required value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} /></div>
                <div className="form-group"><label>Email *</label><input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
                <div className="form-group"><label>SĐT *</label><input required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
                <div className="form-group"><label>Ngày sinh *</label><input type="date" required value={form.date_of_birth} onChange={e => setForm({...form, date_of_birth: e.target.value})} /></div>
                <div className="form-group"><label>Địa chỉ *</label><input required value={form.address} onChange={e => setForm({...form, address: e.target.value})} /></div>
                <div className="form-group">
                  <label>Lương mong muốn *</label>
                  <input type="number" required value={form.expected_salary} onChange={e => setForm({...form, expected_salary: e.target.value})} placeholder="VD: 15000000" />
                </div>
                <div className="form-group"><label>Trạng thái</label>
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                    <option value="Chờ phê duyệt">Chờ phê duyệt</option>
                    <option value="Ứng viên tiềm năng">Ứng viên tiềm năng</option>
                  </select>
                </div>
              </div>
              <div className="form-group"><label>Kỹ năng *</label><textarea required rows={2} value={form.skills} onChange={e => setForm({...form, skills: e.target.value})} /></div>
              <div className="form-group"><label>Kinh nghiệm *</label><textarea required rows={2} value={form.experience} onChange={e => setForm({...form, experience: e.target.value})} /></div>
              <div className="modal__footer">
                <button type="button" className="btn btn--ghost" onClick={() => setShowForm(false)}>Hủy</button>
                <button type="submit" className="btn btn--primary">{editId ? 'Lưu' : 'Thêm'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tuyen dung (Assign Dept/Pos) */}
      {showHireModal && (
        <div className="modal-overlay" onClick={() => setShowHireModal(null)}>
          <div className="modal modal--sm" onClick={e => e.stopPropagation()}>
            <div className="modal__header">
              <h3>Tuyển dụng: {showHireModal.full_name}</h3>
              <button className="modal__close" onClick={() => setShowHireModal(null)}><FiX /></button>
            </div>
            <form onSubmit={handleHireSubmit} className="modal__body">
              <p style={{marginBottom: '1rem', fontSize: '0.9rem'}}>Vui lòng gán bộ phận và vị trí cho nhân sự mới.</p>
              <div className="form-group">
                <label>Mã nhân viên *</label>
                <input required value={hireForm.ma_nv} onChange={e => setHireForm({...hireForm, ma_nv: e.target.value.toUpperCase()})} placeholder="VD: NV001" />
              </div>
              <div className="form-grid form-grid--2">
                <div className="form-group">
                  <label>Phòng ban *</label>
                  <select required value={hireForm.dept_id} onChange={e => setHireForm({...hireForm, dept_id: e.target.value})}>
                    <option value="">-- Chọn --</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.dept_name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Vị trí *</label>
                  <select required value={hireForm.pos_id} onChange={e => setHireForm({...hireForm, pos_id: e.target.value})}>
                    <option value="">-- Chọn --</option>
                    {positions.map(p => <option key={p.id} value={p.id}>{p.pos_name}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Loại nhân viên</label>
                <select value={hireForm.type} onChange={e => setHireForm({...hireForm, type: e.target.value})}>
                  <option value="Thử việc">Thử việc</option>
                  <option value="Chính thức">Chính thức</option>
                </select>
              </div>
              <div className="form-group">
                <label>Mức lương thỏa thuận *</label>
                <input type="number" required value={hireForm.base_salary} onChange={e => setHireForm({...hireForm, base_salary: e.target.value})} />
              </div>
              <div className="modal__footer">
                <button type="button" className="btn btn--ghost" onClick={() => setShowHireModal(null)}>Hủy</button>
                <button type="submit" className="btn btn--success">Hoàn tất tuyển dụng</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal chi tiet */}
      {showDetail && (
        <div className="modal-overlay" onClick={() => setShowDetail(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal__header">
              <h3>Chi tiết ứng viên</h3>
              <button className="modal__close" onClick={() => setShowDetail(null)}><FiX /></button>
            </div>
            <div className="modal__body">
              <div className="detail-grid">
                <div><strong>Họ tên:</strong> {showDetail.full_name}</div>
                <div><strong>Email:</strong> {showDetail.email || '—'}</div>
                <div><strong>SĐT:</strong> {showDetail.phone || '—'}</div>
                <div><strong>Ngày sinh:</strong> {showDetail.date_of_birth ? new Date(showDetail.date_of_birth).toLocaleDateString('vi-VN') : '—'}</div>
                <div><strong>Địa chỉ:</strong> {showDetail.address || '—'}</div>
                <div><strong>Lương mong muốn:</strong> {new Intl.NumberFormat('vi-VN').format(showDetail.expected_salary || 0)}đ</div>
                <div><strong>Trạng thái:</strong> <span className={`badge ${statusColor(showDetail.status)}`}>{showDetail.status}</span></div>
                <div className="detail-grid__full"><strong>Kỹ năng:</strong> {showDetail.skills || '—'}</div>
                <div className="detail-grid__full"><strong>Kinh nghiệm:</strong> {showDetail.experience || '—'}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
