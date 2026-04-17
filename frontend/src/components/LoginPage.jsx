import { useState } from 'react';
import { FiUser, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

const API_URL = import.meta.env.VITE_API_URL || 'https://quanlynhansunhom4.onrender.com';

export default function LoginPage({ onLogin }) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ username: '', password: '', fullname: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const endpoint = isLoginMode ? '/api/login' : '/api/register';
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Có lỗi xảy ra!');
        setLoading(false);
        return;
      }

      if (isLoginMode) {
        onLogin(data.user);
      } else {
        setIsLoginMode(true);
        setError('');
        setForm({ username: '', password: '', fullname: '' });
        alert('Đăng ký thành công! Vui lòng đăng nhập.');
      }
    } catch {
      setError('Không thể kết nối đến máy chủ!');
    }
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-page__bg">
        <div className="login-page__orb login-page__orb--1" />
        <div className="login-page__orb login-page__orb--2" />
        <div className="login-page__orb login-page__orb--3" />
      </div>

      <div className="login-card">
        <div className="login-card__header">
          <div className="login-card__logo">⚡</div>
          <h1 className="login-card__title">NextGen <span className="text-accent">HR</span></h1>
          <p className="login-card__subtitle">
            {isLoginMode ? 'Đăng nhập vào hệ thống quản lý' : 'Tạo tài khoản quản trị mới'}
          </p>
        </div>

        {error && <div className="login-card__error">{error}</div>}

        <form onSubmit={handleSubmit} className="login-card__form">
          {!isLoginMode && (
            <div className="form-field">
              <div className="form-field__icon"><FiUser /></div>
              <input
                type="text"
                placeholder="Họ và tên"
                required
                value={form.fullname}
                onChange={(e) => setForm({ ...form, fullname: e.target.value })}
              />
            </div>
          )}

          <div className="form-field">
            <div className="form-field__icon"><FiUser /></div>
            <input
              type="text"
              placeholder="Tên đăng nhập"
              required
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
          </div>

          <div className="form-field">
            <div className="form-field__icon"><FiLock /></div>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Mật khẩu"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <button type="button" className="form-field__toggle" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          <button type="submit" className="btn btn--primary btn--full" disabled={loading}>
            {loading ? 'Đang xử lý...' : isLoginMode ? 'Đăng Nhập' : 'Đăng Ký'}
          </button>
        </form>

        <div className="login-card__footer">
          {isLoginMode ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
          <button className="login-card__switch" onClick={() => { setIsLoginMode(!isLoginMode); setError(''); }}>
            {isLoginMode ? 'Đăng ký' : 'Đăng nhập'}
          </button>
        </div>
      </div>
    </div>
  );
}
