import { useState, useEffect } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { FiUsers, FiGrid, FiDollarSign, FiCalendar, FiUserCheck } from 'react-icons/fi';

const API_URL = import.meta.env.VITE_API_URL || 'https://quanlynhansunhom4.onrender.com';
const formatMoney = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v || 0);

const COLORS = ['#00D1FF', '#7DD3FC', '#38BDF8', '#0EA5E9', '#0284C7', '#06B6D4', '#22D3EE', '#67E8F9', '#A5F3FC'];

export default function Statistics() {
  const [overview, setOverview] = useState({});
  const [deptData, setDeptData] = useState([]);
  const [payrollByDept, setPayrollByDept] = useState([]);
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetch(`${API_URL}/api/analytics/overview`).then(r => r.json()).then(setOverview).catch(() => {});
    fetch(`${API_URL}/api/analytics/by-department`).then(r => r.json()).then(setDeptData).catch(() => {});
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/api/analytics/payroll-by-dept?month=${filterMonth}&year=${filterYear}`)
      .then(r => r.json()).then(setPayrollByDept).catch(() => {});
  }, [filterMonth, filterYear]);

  const statCards = [
    { label: 'Tổng nhân viên', value: overview.totalEmployees || 0, icon: FiUsers, color: '#00D1FF' },
    { label: 'Nhân viên thử việc', value: overview.totalProbation || 0, icon: FiUserCheck, color: '#A5F3FC' },
    { label: 'Tổng phòng ban', value: overview.totalDepartments || 0, icon: FiGrid, color: '#7DD3FC' },
    { label: 'Tổng chi lương', value: formatMoney(overview.totalPayroll), icon: FiDollarSign, color: '#38BDF8' },
    { label: 'Nghỉ phép chờ duyệt', value: overview.pendingLeaves || 0, icon: FiCalendar, color: '#FF6B6B' },
  ];

  const deptChartData = {
    labels: deptData.map(d => d.dept_name),
    datasets: [{
      data: deptData.map(d => d.member_count),
      backgroundColor: COLORS.slice(0, deptData.length),
      borderWidth: 0,
    }]
  };

  const payrollChartData = {
    labels: payrollByDept.map(d => d.dept_name || 'Chưa phân'),
    datasets: [{
      label: 'Tổng lương (VNĐ)',
      data: payrollByDept.map(d => Number(d.total_salary)),
      backgroundColor: 'rgba(0, 209, 255, 0.6)',
      borderColor: '#00D1FF',
      borderWidth: 2,
      borderRadius: 8,
    }]
  };

  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { labels: { color: '#bbc9cf', font: { family: 'Inter' } } } },
    scales: {
      x: { ticks: { color: '#859399' }, grid: { color: 'rgba(59, 73, 78, 0.3)' } },
      y: { ticks: { color: '#859399', callback: (v) => v >= 1000000 ? (v/1000000).toFixed(0) + 'M' : v.toLocaleString() }, grid: { color: 'rgba(59, 73, 78, 0.3)' } }
    }
  };

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <h2 className="page__title">Thống kê & Báo cáo</h2>
          <p className="page__subtitle">Tổng quan hệ thống quản lý nhân sự</p>
        </div>
      </div>

      <div className="stat-cards">
        {statCards.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="stat-card">
              <div className="stat-card__icon" style={{background: `${s.color}20`, color: s.color}}><Icon /></div>
              <div className="stat-card__info">
                <p className="stat-card__label">{s.label}</p>
                <p className="stat-card__value">{s.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid--2" style={{marginTop: '1.5rem'}}>
        <div className="card">
          <h3 className="card__title">Phân bố nhân sự theo phòng ban</h3>
          <div className="chart-container chart-container--sm">
            <Doughnut data={deptChartData} options={{
              responsive: true, maintainAspectRatio: false,
              plugins: { legend: { position: 'bottom', labels: { color: '#bbc9cf', padding: 12, font: { family: 'Inter' } } } }
            }} />
          </div>
        </div>

        <div className="card">
          <div className="card__header">
            <h3 className="card__title">Chi tiết lương theo phòng ban</h3>
            <div className="filter-row filter-row--compact">
              <select className="filter-select" value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
                {Array.from({length: 12}, (_, i) => <option key={i+1} value={i+1}>T{i+1}</option>)}
              </select>
              <select className="filter-select" value={filterYear} onChange={e => setFilterYear(e.target.value)}>
                {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
          <div className="chart-container chart-container--sm">
            <Bar data={payrollChartData} options={{...chartOptions, plugins: {...chartOptions.plugins, legend: {display: false}}}} />
          </div>
        </div>
      </div>

      {/* Bang chi tiet luong theo phong ban */}
      <div className="card" style={{marginTop: '1.5rem'}}>
        <h3 className="card__title">Bảng chi tiết lương theo phòng ban — Tháng {filterMonth}/{filterYear}</h3>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr><th>Phòng ban</th><th>Số nhân viên</th><th className="text-right">Tổng lương</th><th className="text-right">Trung bình/người</th></tr>
            </thead>
            <tbody>
              {payrollByDept.length === 0 ? (
                <tr><td colSpan="4" className="table__empty">Không có dữ liệu</td></tr>
              ) : payrollByDept.map((d, i) => (
                <tr key={i}>
                  <td className="text-bold">{d.dept_name || 'Chưa phân'}</td>
                  <td>{d.emp_count}</td>
                  <td className="text-right text-bold">{formatMoney(d.total_salary)}</td>
                  <td className="text-right">{formatMoney(d.emp_count > 0 ? d.total_salary / d.emp_count : 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
