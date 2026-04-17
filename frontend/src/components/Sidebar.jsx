import { useState } from 'react';
import {
  FiUsers, FiBarChart2, FiUserCheck, FiClock, FiDollarSign,
  FiCalendar, FiGrid, FiPieChart, FiAward, FiLogOut, FiChevronLeft, FiChevronRight
} from 'react-icons/fi';

const menuItems = [
  { key: 'employees', label: 'Danh sách nhân sự', icon: FiUsers },
  { key: 'analytics', label: 'Phân tích nhân sự', icon: FiBarChart2 },
  { key: 'recruitment', label: 'Tuyển chọn & Sàng lọc', icon: FiUserCheck },
  { key: 'attendance', label: 'Chấm công', icon: FiClock },
  { key: 'payroll', label: 'Tính lương', icon: FiDollarSign },
  { key: 'leave', label: 'Nghỉ phép', icon: FiCalendar },
  { key: 'departments', label: 'Quản lý phòng ban', icon: FiGrid },
  { key: 'statistics', label: 'Thống kê báo cáo', icon: FiPieChart },
  { key: 'awards', label: 'Khen thưởng', icon: FiAward },
];

export default function Sidebar({ activeView, onNavigate, user, onLogout, onProfile }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>
      <div className="sidebar__header">
        <div className="sidebar__logo">
          <span className="sidebar__logo-icon">⚡</span>
          {!collapsed && <span className="sidebar__logo-text">NextGen <span className="text-accent">HR</span></span>}
        </div>
        <button className="sidebar__toggle" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
        </button>
      </div>

      <nav className="sidebar__nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.key;
          return (
            <button
              key={item.key}
              className={`sidebar__item ${isActive ? 'sidebar__item--active' : ''}`}
              onClick={() => onNavigate(item.key)}
              title={collapsed ? item.label : ''}
            >
              <span className="sidebar__item-indicator" />
              <Icon className="sidebar__item-icon" />
              {!collapsed && <span className="sidebar__item-label">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="sidebar__footer">
        <div className="sidebar__user" onClick={onProfile} role="button" tabIndex={0}>
          <div className="sidebar__avatar">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="" />
            ) : (
              <span>{(user?.fullname || user?.username || 'U').charAt(0).toUpperCase()}</span>
            )}
          </div>
          {!collapsed && (
            <div className="sidebar__user-info">
              <p className="sidebar__user-name">{user?.fullname || user?.username}</p>
              <p className="sidebar__user-role">{user?.role || 'Admin'}</p>
            </div>
          )}
        </div>
        <button className="sidebar__logout" onClick={onLogout} title="Đăng xuất">
          <FiLogOut />
          {!collapsed && <span>Đăng xuất</span>}
        </button>
      </div>
    </aside>
  );
}
