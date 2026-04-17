import { useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Sidebar from './components/Sidebar';
import LoginPage from './components/LoginPage';
import EmployeeList from './components/EmployeeList';
import Analytics from './components/Analytics';
import Recruitment from './components/Recruitment';
import Attendance from './components/Attendance';
import Payroll from './components/Payroll';
import LeaveRequest from './components/LeaveRequest';
import Department from './components/Department';
import Statistics from './components/Statistics';
import Awards from './components/Awards';
import Profile from './components/Profile';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeView, setActiveView] = useState('employees');

  const handleLogin = (user) => {
    setCurrentUser(user);
    setActiveView('employees');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveView('employees');
  };

  const handleProfileUpdate = (updatedUser) => {
    setCurrentUser(updatedUser);
  };

  if (!currentUser) {
    return (
      <>
        <LoginPage onLogin={handleLogin} />
        <ToastContainer position="top-right" autoClose={3000} theme="dark" />
      </>
    );
  }

  const renderView = () => {
    switch (activeView) {
      case 'employees': return <EmployeeList />;
      case 'analytics': return <Analytics />;
      case 'recruitment': return <Recruitment />;
      case 'attendance': return <Attendance />;
      case 'payroll': return <Payroll />;
      case 'leave': return <LeaveRequest />;
      case 'departments': return <Department />;
      case 'statistics': return <Statistics />;
      case 'awards': return <Awards />;
      case 'profile': return <Profile user={currentUser} onUpdate={handleProfileUpdate} onBack={() => setActiveView('employees')} />;
      default: return <EmployeeList />;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar
        activeView={activeView}
        onNavigate={setActiveView}
        user={currentUser}
        onLogout={handleLogout}
        onProfile={() => setActiveView('profile')}
      />
      <main className="main-content">
        {renderView()}
      </main>
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
    </div>
  );
}
