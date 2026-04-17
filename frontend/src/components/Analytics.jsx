import { useState, useEffect } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { FiFilter } from 'react-icons/fi';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const API_URL = import.meta.env.VITE_API_URL || 'https://quanlynhansunhom4.onrender.com';

const CHART_COLORS = ['#00D1FF', '#7DD3FC', '#38BDF8', '#0EA5E9', '#0284C7', '#0369A1', '#075985', '#0C4A6E', '#164E63'];

export default function Analytics() {
  const [deptData, setDeptData] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState([]);
  const [payrollStats, setPayrollStats] = useState([]);
  const [filterDept, setFilterDept] = useState('');
  const [filterEmp, setFilterEmp] = useState('');
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetch(`${API_URL}/api/analytics/by-department`).then(r => r.json()).then(setDeptData).catch(() => {});
    fetch(`${API_URL}/api/employees`).then(r => r.json()).then(setEmployees).catch(() => {});
    fetch(`${API_URL}/api/departments`).then(r => r.json()).then(setDepartments).catch(() => {});
  }, []);

  useEffect(() => {
    const params = new URLSearchParams({ year: filterYear });
    if (filterEmp) params.append('emp_id', filterEmp);
    fetch(`${API_URL}/api/analytics/attendance-stats?${params}`).then(r => r.json()).then(setAttendanceStats).catch(() => {});
    fetch(`${API_URL}/api/analytics/payroll-stats?${params}`).then(r => r.json()).then(setPayrollStats).catch(() => {});
  }, [filterEmp, filterYear]);

  const deptChartData = {
    labels: deptData.map(d => d.dept_name),
    datasets: [{
      data: deptData.map(d => d.member_count),
      backgroundColor: CHART_COLORS.slice(0, deptData.length),
      borderWidth: 0,
    }]
  };

  const deptBarData = {
    labels: deptData.map(d => d.dept_name),
    datasets: [{
      label: 'Số nhân viên',
      data: deptData.map(d => d.member_count),
      backgroundColor: 'rgba(0, 209, 255, 0.6)',
      borderColor: '#00D1FF',
      borderWidth: 2,
      borderRadius: 8,
    }]
  };

  const months = Array.from({length: 12}, (_, i) => `T${i + 1}`);

  const attendanceChartData = {
    labels: months,
    datasets: [
      {
        label: 'Ngày đi làm',
        data: months.map((_, i) => {
          const found = attendanceStats.find(a => a.month === i + 1);
          return found ? found.work_days : 0;
        }),
        backgroundColor: 'rgba(0, 209, 255, 0.5)',
        borderColor: '#00D1FF',
        borderWidth: 2,
        borderRadius: 6,
      },
      {
        label: 'Ngày nghỉ phép',
        data: months.map((_, i) => {
          const found = attendanceStats.find(a => a.month === i + 1);
          return found ? found.leave_days : 0;
        }),
        backgroundColor: 'rgba(255, 107, 107, 0.5)',
        borderColor: '#FF6B6B',
        borderWidth: 2,
        borderRadius: 6,
      }
    ]
  };

  const payrollChartData = {
    labels: months,
    datasets: [{
      label: 'Lương (VNĐ)',
      data: months.map((_, i) => {
        const found = payrollStats.find(p => p.month === i + 1);
        return found ? Number(found.total) : 0;
      }),
      fill: true,
      backgroundColor: 'rgba(0, 209, 255, 0.1)',
      borderColor: '#00D1FF',
      borderWidth: 2,
      tension: 0.4,
      pointBackgroundColor: '#00D1FF',
      pointRadius: 4,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: '#bbc9cf', font: { family: 'Inter' } } } },
    scales: {
      x: { ticks: { color: '#859399' }, grid: { color: 'rgba(59, 73, 78, 0.3)' } },
      y: { ticks: { color: '#859399' }, grid: { color: 'rgba(59, 73, 78, 0.3)' } }
    }
  };

  const filteredEmps = filterDept ? employees.filter(e => String(e.dept_id) === filterDept) : employees;

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <h2 className="page__title">Phân tích Nhân sự</h2>
          <p className="page__subtitle">Trực quan hóa dữ liệu nhân sự và hiệu suất</p>
        </div>
      </div>

      <div className="grid grid--2">
        <div className="card">
          <h3 className="card__title">Tỷ lệ nhân sự theo Phòng ban</h3>
          <div className="chart-container chart-container--sm">
            <Doughnut data={deptChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#bbc9cf', padding: 16, font: { family: 'Inter' } } } } }} />
          </div>
        </div>
        <div className="card">
          <h3 className="card__title">Sơ đồ nhân sự theo Phòng ban</h3>
          <div className="chart-container chart-container--sm">
            <Bar data={deptBarData} options={{...chartOptions, plugins: { ...chartOptions.plugins, legend: { display: false } }}} />
          </div>
        </div>
      </div>

      <div className="card" style={{marginTop: '1.5rem'}}>
        <div className="card__header">
          <h3 className="card__title"><FiFilter style={{marginRight: 8}} />Lọc theo Phòng ban & Nhân viên</h3>
          <div className="filter-row">
            <select className="filter-select" value={filterDept} onChange={e => { setFilterDept(e.target.value); setFilterEmp(''); }}>
              <option value="">Tất cả phòng ban</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.dept_name}</option>)}
            </select>
            <select className="filter-select" value={filterEmp} onChange={e => setFilterEmp(e.target.value)}>
              <option value="">Tất cả nhân viên</option>
              {filteredEmps.map(e => <option key={e.id} value={e.id}>{e.full_name} ({e.ma_nv})</option>)}
            </select>
            <select className="filter-select" value={filterYear} onChange={e => setFilterYear(e.target.value)}>
              {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid--2" style={{marginTop: '1.5rem'}}>
        <div className="card">
          <h3 className="card__title">Ngày đi làm & Nghỉ phép theo tháng</h3>
          <div className="chart-container">
            <Bar data={attendanceChartData} options={chartOptions} />
          </div>
        </div>
        <div className="card">
          <h3 className="card__title">Lương theo tháng</h3>
          <div className="chart-container">
            <Line data={payrollChartData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}
