import { useState } from 'react';
import { FiUser, FiMail, FiShield, FiSave, FiArrowLeft } from 'react-icons/fi';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'https://quanlynhansunhom4.onrender.com';

export default function Profile({ user, onUpdate, onBack }) {
  const [form, setForm] = useState({
    fullname: user?.fullname || '',
    avatar_url: user?.avatar_url || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullname.trim()) return toast.error('Họ và tên không được để trống!');
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/profile/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Cập nhật hồ sơ thành công!');
        onUpdate({ ...user, ...form });
      } else {
        toast.error(data.error || 'Lỗi cập nhật!');
      }
    } catch {
      toast.error('Lỗi kết nối!');
    }
    setSaving(false);
  };

  return (
    <div className="page">
      <div className="page__header">
        <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
          <button className="btn btn--ghost" onClick={onBack} title="Quay lại">
            <FiArrowLeft />
          </button>
          <div>
            <h2 className="page__title">Hồ sơ cá nhân</h2>
            <p className="page__subtitle">Quản lý thông tin tài khoản của bạn</p>
          </div>
        </div>
      </div>

      <div className="grid grid--profile">
        <div className="card profile-card">
          <div className="profile-card__avatar">
            {form.avatar_url ? (
              <img src={form.avatar_url} alt="" className="profile-card__img" />
            ) : (
              <div className="avatar avatar--xl">
                <span>{(user?.fullname || user?.username || 'U').charAt(0).toUpperCase()}</span>
              </div>
            )}
          </div>
          <h3 className="profile-card__name">{user?.fullname || user?.username}</h3>
          <span className="badge badge--info">{user?.role || 'Admin'}</span>
          <p className="profile-card__meta">@{user?.username}</p>
          <p className="profile-card__meta">Tham gia: {user?.created_at ? new Date(user.created_at).toLocaleDateString('vi-VN') : '—'}</p>
        </div>

        <div className="card">
          <h3 className="card__title">Chỉnh sửa thông tin</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label><FiUser style={{marginRight: 6}} />Tên đăng nhập</label>
              <input value={user?.username || ''} disabled className="input--disabled" />
            </div>
            <div className="form-group">
              <label><FiShield style={{marginRight: 6}} />Vai trò</label>
              <input value={user?.role || 'admin'} disabled className="input--disabled" />
            </div>
            <div className="form-group">
              <label><FiUser style={{marginRight: 6}} />Họ và tên <span className="text-danger">*</span></label>
              <input value={form.fullname} onChange={e => setForm({...form, fullname: e.target.value})} placeholder="Nhập họ và tên..." />
            </div>
            <div className="form-group">
              <label><FiMail style={{marginRight: 6}} />URL ảnh đại diện</label>
              <input value={form.avatar_url} onChange={e => setForm({...form, avatar_url: e.target.value})} placeholder="https://..." />
            </div>
            {form.avatar_url && (
              <div className="profile-preview">
                <img src={form.avatar_url} alt="Preview" />
              </div>
            )}
            <button type="submit" className="btn btn--primary btn--full" disabled={saving} style={{marginTop: '1rem'}}>
              <FiSave /> {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
