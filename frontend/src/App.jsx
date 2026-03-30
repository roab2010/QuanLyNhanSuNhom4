import { useState, useEffect } from 'react'

// Đổi link này thành http://localhost:3000 nếu test dưới máy tính
const API_URL = 'https://quanlynhansunhom4.onrender.com'

function App() {
  const [employees, setEmployees] = useState([])
  const [departments, setDepartments] = useState([]) // State mới lưu danh sách phòng ban
  
  const [maNV, setMaNV] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [gender, setGender] = useState('Nam')
  const [deptId, setDeptId] = useState('') // Lưu ID của phòng ban thay vì tên
  const [position, setPosition] = useState('')
  const [salary, setSalary] = useState('')
  const [status, setStatus] = useState('Đang làm việc')
  
  const [editId, setEditId] = useState(null)

  // Gọi 2 API cùng lúc khi tải trang
  useEffect(() => {
    fetchEmployees()
    fetchDepartments()
  }, [])

  const fetchDepartments = () => {
    fetch(`${API_URL}/api/departments`)
      .then(res => res.json())
      .then(data => {
        setDepartments(data)
        if (data.length > 0) setDeptId(data[0].id) // Mặc định chọn phòng ban đầu tiên
      })
  }

  const fetchEmployees = () => {
    fetch(`${API_URL}/api/employees`)
      .then(res => res.json())
      .then(data => setEmployees(data))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const employeeData = { 
      ma_nv: maNV, 
      full_name: name, 
      phone: phone, 
      gender: gender,
      dept_id: deptId, // Gửi ID phòng ban đi
      position: position,
      base_salary: salary || 0, 
      status: status
    }

    const method = editId ? 'PUT' : 'POST'
    const url = editId ? `${API_URL}/api/employees/${editId}` : `${API_URL}/api/employees`

    await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(employeeData)
    })
    
    setEditId(null); setMaNV(''); setName(''); setPhone(''); setGender('Nam'); setPosition(''); setSalary(''); setStatus('Đang làm việc');
    fetchEmployees()
  }

  const handleDelete = async (id) => {
    if (window.confirm('Xác nhận xóa nhân viên này?')) {
      await fetch(`${API_URL}/api/employees/${id}`, { method: 'DELETE' })
      fetchEmployees()
    }
  }

  const handleEdit = (emp) => {
    setMaNV(emp.ma_nv || '') 
    setName(emp.full_name || '')
    setPhone(emp.phone || '')
    setGender(emp.gender || 'Nam')
    setDeptId(emp.dept_id || (departments.length > 0 ? departments[0].id : '')) // Gán lại ID phòng ban
    setPosition(emp.position || '')
    setSalary(emp.base_salary || '')
    setStatus(emp.status || 'Đang làm việc')
    setEditId(emp.id)
  }

  const formatCurrency = (amount) => {
    if (!amount) return '0 ₫'
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1100px', margin: '0 auto', color: '#333' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#2c3e50' }}>Hệ Thống Quản Lý Nhân Sự</h1>
      
      <div style={{ backgroundColor: '#f8f9fa', padding: '25px', marginBottom: '30px', borderRadius: '8px', border: '1px solid #ddd' }}>
        <h3 style={{ marginTop: 0, marginBottom: '20px', borderBottom: '2px solid #3498db', paddingBottom: '10px', display: 'inline-block' }}>
          {editId ? '✏️ Sửa thông tin nhân viên' : '➕ Thêm nhân viên mới'}
        </h3>
        
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
          
          <input type="text" placeholder="Mã NV (*)" value={maNV} onChange={(e) => setMaNV(e.target.value)} disabled={editId ? true : false} required style={inputStyle} />
          <input type="text" placeholder="Họ và Tên (*)" value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} />
          <input type="text" placeholder="Số điện thoại" value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} />
          
          <select value={gender} onChange={(e) => setGender(e.target.value)} style={inputStyle}>
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
            <option value="Khác">Khác</option>
          </select>

          {/* Menu Dropdown cho Phòng Ban */}
          <select value={deptId} onChange={(e) => setDeptId(e.target.value)} required style={inputStyle}>
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>{dept.dept_name}</option>
            ))}
          </select>

          <input type="text" placeholder="Chức vụ (*)" value={position} onChange={(e) => setPosition(e.target.value)} required style={inputStyle} />
          <input type="number" placeholder="Lương cơ bản (VNĐ)" value={salary} onChange={(e) => setSalary(e.target.value)} style={inputStyle} />

          <select value={status} onChange={(e) => setStatus(e.target.value)} style={inputStyle}>
            <option value="Đang làm việc">Đang làm việc</option>
            <option value="Thử việc">Thử việc</option>
            <option value="Nghỉ việc">Nghỉ việc</option>
          </select>
          
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button type="submit" style={{ padding: '10px 25px', backgroundColor: editId ? '#f39c12' : '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              {editId ? 'Lưu cập nhật' : 'Thêm nhân viên'}
            </button>
            {editId && (
              <button type="button" onClick={() => { setEditId(null); setMaNV(''); setName(''); setPhone(''); setGender('Nam'); setPosition(''); setSalary(''); setStatus('Đang làm việc'); }} style={{ padding: '10px 25px', marginLeft: '10px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                Hủy
              </button>
            )}
          </div>
        </form>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}>
          <thead>
            <tr style={{ backgroundColor: '#34495e', color: 'white', textAlign: 'left' }}>
              <th style={thStyle}>Mã NV</th>
              <th style={thStyle}>Họ Tên</th>
              <th style={thStyle}>SĐT</th>
              <th style={thStyle}>Giới Tính</th>
              <th style={thStyle}>Phòng Ban</th>
              <th style={thStyle}>Chức Vụ</th>
              <th style={thStyle}>Lương Cơ Bản</th>
              <th style={thStyle}>Trạng Thái</th>
              <th style={thStyle}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {employees.map(emp => (
              <tr key={emp.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={tdStyle}><strong>{emp.ma_nv}</strong></td>
                <td style={tdStyle}>{emp.full_name}</td>
                <td style={tdStyle}>{emp.phone}</td>
                <td style={tdStyle}>{emp.gender}</td>
                <td style={tdStyle}>{emp.department}</td> {/* Lấy tên phòng từ JOIN */}
                <td style={tdStyle}>{emp.position}</td>
                <td style={{...tdStyle, color: '#e67e22', fontWeight: 'bold'}}>{formatCurrency(emp.base_salary)}</td>
                <td style={{...tdStyle, color: emp.status === 'Nghỉ việc' ? 'red' : 'green'}}>{emp.status}</td>
                <td style={tdStyle}>
                  <button onClick={() => handleEdit(emp)} style={{ marginRight: '5px', padding: '5px 10px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>Sửa</button>
                  <button onClick={() => handleDelete(emp.id)} style={{ padding: '5px 10px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const inputStyle = { padding: '10px', borderRadius: '4px', border: '1px solid #ccc', width: '100%', boxSizing: 'border-box', fontSize: '14px' }
const thStyle = { padding: '12px 15px', border: '1px solid #ddd', whiteSpace: 'nowrap' }
const tdStyle = { padding: '10px 15px', border: '1px solid #ddd', verticalAlign: 'middle' }

export default App