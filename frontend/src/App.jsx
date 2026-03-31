import { useState, useEffect } from 'react';
const API_URL = 'https://quanlynhansunhom4.onrender.com'; // Địa chỉ Backend đã được deploy lên Render

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [authForm, setAuthForm] = useState({ username: '', password: '', fullname: '' });

  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [empForm, setEmpForm] = useState({
    ma_nv: '', full_name: '', phone: '', gender: 'Nam', dept_id: '', position: '', base_salary: '', status: 'Đang làm việc'
  });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    if (currentUser) {
      fetchDepartments();
      fetchEmployees();
    }
  }, [currentUser, searchQuery]);

  const fetchDepartments = () => {
    fetch(`${API_URL}/api/departments`)
      .then(res => res.json())
      .then(data => {
        setDepartments(data);
        if (data.length > 0 && !empForm.dept_id) setEmpForm(f => ({ ...f, dept_id: data[0].id }));
      });
  };

  const fetchEmployees = () => {
    // encodeURIComponent giúp giữ nguyên vẹn dấu tiếng Việt khi gửi lên Backend
    fetch(`${API_URL}/api/employees?search=${encodeURIComponent(searchQuery)}`)
      .then(res => res.json())
      .then(data => setEmployees(data));
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLoginMode ? '/api/login' : '/api/register';
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm)
      });
      const data = await res.json();
      if (!res.ok) return alert(data.error || 'Có lỗi xảy ra!');
      if (isLoginMode) setCurrentUser(data.user);
      else {
        alert('Đăng ký thành công! Vui lòng đăng nhập.');
        setIsLoginMode(true);
      }
    } catch (err) { console.error(err); }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAuthForm({ username: '', password: '', fullname: '' });
  };

  const handleEmpSubmit = async (e) => {
    e.preventDefault();
    const method = editId ? 'PUT' : 'POST';
    const url = editId ? `${API_URL}/api/employees/${editId}` : `${API_URL}/api/employees`;

    try {
      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...empForm, base_salary: empForm.base_salary || 0 })
      });
      const data = await res.json();
      
      // BẮT LỖI TỪ BACKEND Ở ĐÂY (Vd: Trùng mã NV)
      if (!res.ok) {
        return alert(data.error || 'Có lỗi xảy ra, vui lòng kiểm tra lại!');
      }

      setEditId(null);
      setEmpForm({ ma_nv: '', full_name: '', phone: '', gender: 'Nam', dept_id: departments[0]?.id || '', position: '', base_salary: '', status: 'Đang làm việc' });
      fetchEmployees();
      alert(editId ? 'Cập nhật thành công!' : 'Thêm nhân viên mới thành công!');
    } catch (err) {
      console.error(err);
      alert('Lỗi kết nối đến máy chủ!');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa nhân viên này?')) {
      await fetch(`${API_URL}/api/employees/${id}`, { method: 'DELETE' });
      fetchEmployees();
    }
  };

  const handleEdit = (emp) => {
    setEmpForm({
      ma_nv: emp.ma_nv, full_name: emp.full_name, phone: emp.phone, gender: emp.gender,
      dept_id: emp.dept_id, position: emp.position, base_salary: emp.base_salary, status: emp.status
    });
    setEditId(emp.id);
  };

  const formatMoney = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

  // Giao diện Đăng Nhập (Giữ nguyên phong cách Pastel)
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sky-50 p-4 font-sans text-gray-800">
        <div className="bg-white p-10 rounded-[30px] shadow-2xl shadow-sky-200/50 w-full max-w-md border border-white">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">HRM <span className="text-blue-500">FG04</span></h1>
            <p className="text-slate-500 text-sm">{isLoginMode ? 'Đăng nhập vào không gian làm việc' : 'Tạo tài khoản quản trị mới'}</p>
          </div>
          <form onSubmit={handleAuthSubmit} className="space-y-5">
            {!isLoginMode && <input type="text" placeholder="Họ và tên" required className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none" value={authForm.fullname} onChange={e => setAuthForm({...authForm, fullname: e.target.value})} />}
            <input type="text" placeholder="Tên đăng nhập" required className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none" value={authForm.username} onChange={e => setAuthForm({...authForm, username: e.target.value})} />
            <input type="password" placeholder="Mật khẩu" required className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none" value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} />
            <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-500/30 transition-all">{isLoginMode ? 'Đăng Nhập' : 'Đăng Ký'}</button>
          </form>
          <div className="mt-8 text-center text-sm text-slate-500">
            {isLoginMode ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
            <button onClick={() => setIsLoginMode(!isLoginMode)} className="text-blue-600 font-semibold hover:underline">{isLoginMode ? 'Đăng ký' : 'Đăng nhập'}</button>
          </div>
        </div>
      </div>
    );
  }

  // Giao diện Dashboard (Có Sidebar)
  return (
    <div className="min-h-screen bg-sky-50 font-sans text-slate-800 flex flex-col md:flex-row">
      
      {/* SIDEBAR BÊN TRÁI */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-100 flex flex-col md:h-screen md:sticky top-0 shadow-lg shadow-sky-100/50">
        <div className="p-6 text-center border-b border-slate-50 hidden md:block">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">HRM <span className="text-blue-500">FG04</span></h1>
        </div>
        <nav className="flex-1 p-4 flex md:flex-col gap-2 overflow-x-auto md:overflow-visible">
          <a href="#" className="flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-600 rounded-2xl font-semibold whitespace-nowrap">
            👥 Quản lý Nhân sự
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 rounded-2xl font-medium transition-colors whitespace-nowrap">
            🏢 Phòng ban
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 rounded-2xl font-medium transition-colors whitespace-nowrap">
            🕒 Chấm công
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 rounded-2xl font-medium transition-colors whitespace-nowrap">
            📝 Xin nghỉ phép
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 rounded-2xl font-medium transition-colors whitespace-nowrap">
            💰 Bảng lương
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 rounded-2xl font-medium transition-colors whitespace-nowrap">
            📊 Thống kê
          </a>
        </nav>
        <div className="p-4 border-t border-slate-50 hidden md:block">
           <div className="bg-slate-50 p-4 rounded-2xl flex flex-col items-center">
              <div className="w-10 h-10 bg-blue-200 text-blue-700 rounded-full flex items-center justify-center font-bold mb-2">
                {currentUser.username.charAt(0).toUpperCase()}
              </div>
              <p className="text-sm font-semibold text-slate-700">{currentUser.fullname || currentUser.username}</p>
              <button onClick={handleLogout} className="mt-2 text-xs text-red-500 hover:underline font-medium">Đăng xuất</button>
           </div>
        </div>
      </aside>

      {/* NỘI DUNG CHÍNH (MAIN CONTENT) */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Danh sách Nhân viên</h2>
            <p className="text-slate-500 text-sm mt-1">Quản lý hồ sơ và thông tin liên lạc</p>
          </div>
          <div className="relative w-full md:w-80">
            <input type="text" placeholder="🔍 Tìm tên hoặc mã NV..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} 
                   className="w-full pl-10 pr-4 py-3 bg-white border-none rounded-2xl shadow-sm focus:ring-4 focus:ring-blue-100 outline-none transition-all" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Form Thêm/Sửa */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-[30px] shadow-xl shadow-sky-100/50 border border-white sticky top-8">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <span className="bg-blue-100 text-blue-600 p-2 rounded-xl">{editId ? '✏️' : '+'}</span>
                {editId ? 'Cập nhật hồ sơ' : 'Thêm nhân sự mới'}
              </h3>
              
              <form onSubmit={handleEmpSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="Mã NV *" value={empForm.ma_nv} onChange={e => setEmpForm({...empForm, ma_nv: e.target.value.toUpperCase()})} required className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-200 outline-none uppercase placeholder:normal-case" />
                  <select value={empForm.gender} onChange={e => setEmpForm({...empForm, gender: e.target.value})} required className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-200 outline-none">
                    <option value="Nam">Nam</option><option value="Nữ">Nữ</option>
                  </select>
                </div>
                
                <input type="text" placeholder="Họ và Tên *" value={empForm.full_name} onChange={e => setEmpForm({...empForm, full_name: e.target.value})} required className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-200 outline-none" />
                <input type="text" placeholder="Số điện thoại *" value={empForm.phone} onChange={e => setEmpForm({...empForm, phone: e.target.value.replace(/[^0-9]/g, '')})} required maxLength="11"className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-200 outline-none"/>
                
                <div className="grid grid-cols-2 gap-4">
                  <select value={empForm.dept_id} onChange={e => setEmpForm({...empForm, dept_id: e.target.value})} required className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-200 outline-none">
                    {departments.map(d => <option key={d.id} value={d.id}>{d.dept_name}</option>)}
                  </select>
                  <input type="text" placeholder="Chức vụ *" value={empForm.position} onChange={e => setEmpForm({...empForm, position: e.target.value})} required className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-200 outline-none" />
                </div>

                <input type="number" placeholder="Lương cơ bản (VNĐ) *" value={empForm.base_salary} onChange={e => setEmpForm({...empForm, base_salary: e.target.value})} required className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-200 outline-none" />
                <select value={empForm.status} onChange={e => setEmpForm({...empForm, status: e.target.value})} required className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-200 outline-none">
                  <option value="Đang làm việc">Đang làm việc</option>
                  <option value="Thử việc">Thử việc</option>
                  <option value="Nghỉ việc">Nghỉ việc</option>
                </select>

                <div className="pt-2 flex gap-3">
                  <button type="submit" className={`flex-1 text-white font-bold py-4 rounded-2xl shadow-lg transition-all ${editId ? 'bg-orange-400 hover:bg-orange-500 shadow-orange-500/30' : 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/30'}`}>
                    {editId ? 'Lưu Thay Đổi' : 'Xác Nhận Thêm'}
                  </button>
                  {editId && (
                    <button type="button" onClick={() => { setEditId(null); setEmpForm({ ma_nv: '', full_name: '', phone: '', gender: 'Nam', dept_id: departments[0]?.id || '', position: '', base_salary: '', status: 'Đang làm việc' }); }} className="px-6 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-2xl transition-all">
                      Hủy
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Bảng dữ liệu */}
          <div className="lg:col-span-2">
            <div className="bg-white p-2 md:p-6 rounded-[30px] shadow-xl shadow-sky-100/50 border border-white overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-100 uppercase text-xs tracking-wider">
                      <th className="p-4 font-semibold">Mã NV</th>
                      <th className="p-4 font-semibold">Nhân viên</th>
                      <th className="p-4 font-semibold">Giới tính</th>
                      <th className="p-4 font-semibold">Liên hệ</th>
                      <th className="p-4 font-semibold">Công việc</th>
                      <th className="p-4 font-semibold text-right">Lương</th>
                      <th className="p-4 font-semibold text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {employees.length === 0 ? (
                      <tr><td colSpan="7" className="p-8 text-center text-slate-400">Không tìm thấy dữ liệu.</td></tr>
                    ) : employees.map(emp => (
                      <tr key={emp.id} className="hover:bg-sky-50/50 transition-colors group">
                        <td className="p-4 text-sm font-bold text-blue-500">{emp.ma_nv}</td>
                        <td className="p-4 font-bold text-slate-800">{emp.full_name}</td>
                        <td className="p-4 text-sm text-slate-600">{emp.gender}</td>
                        <td className="p-4 text-sm text-slate-600">{emp.phone}</td>
                        <td className="p-4">
                          <div className="font-medium text-slate-800 text-sm">{emp.position}</div>
                          <div className="text-xs text-slate-500 bg-slate-100 inline-block px-2 py-1 rounded-lg mt-1">{emp.department}</div>
                        </td>
                        <td className="p-4 text-right">
                          <div className="font-bold text-slate-800">{formatMoney(emp.base_salary)}</div>
                          <div className={`text-xs font-semibold mt-1 ${emp.status === 'Đang làm việc' ? 'text-emerald-500' : emp.status === 'Thử việc' ? 'text-orange-400' : 'text-red-400'}`}>• {emp.status}</div>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex justify-center gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEdit(emp)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-all" title="Sửa">✏️</button>
                            <button onClick={() => handleDelete(emp.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Xóa">🗑️</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default App;