import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../CSS/AdminLayout.css';
import {
  Person,
  Film,
  Globe,
  Collection,
  Tags,
  Display,
  Ticket,
  People,
  PersonBadge,
  Building,
  Grid,
  Tag,
} from 'react-bootstrap-icons';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="admin-layout-container">
      <nav className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h2>ADMIN Movie</h2>
        </div>

        <div className="admin-nav">
          <NavLink to="/account" className={({ isActive }) => `admin-nav-link ${isActive ? 'active-tab' : ''}`}>
            <Person size={20} /> Tài Khoản
          </NavLink>
          <NavLink to="/movies" className={({ isActive }) => `admin-nav-link ${isActive ? 'active-tab' : ''}`}>
            <Film size={20} /> Phim
          </NavLink>
          <NavLink to="/languages" className={({ isActive }) => `admin-nav-link ${isActive ? 'active-tab' : ''}`}>
            <Globe size={20} /> Ngôn Ngữ
          </NavLink>
          <NavLink to="/genres" className={({ isActive }) => `admin-nav-link ${isActive ? 'active-tab' : ''}`}>
            <Tags size={20} /> Thể Loại
          </NavLink>
          <NavLink to="/actors" className={({ isActive }) => `admin-nav-link ${isActive ? 'active-tab' : ''}`}>
            <People size={20} /> Diễn Viên
          </NavLink>
          <NavLink to="/directors" className={({ isActive }) => `admin-nav-link ${isActive ? 'active-tab' : ''}`}>
            <PersonBadge size={20} /> Đạo Diễn
          </NavLink>
          <NavLink to="/movietypes" className={({ isActive }) => `admin-nav-link ${isActive ? 'active-tab' : ''}`}>
            <Collection size={20} /> Định Dạng
          </NavLink>
          <NavLink to="/cinemas" className={({ isActive }) => `admin-nav-link ${isActive ? 'active-tab' : ''}`}>
            <Building size={20} /> Rạp Chiếu
          </NavLink>
          <NavLink to="/screens" className={({ isActive }) => `admin-nav-link ${isActive ? 'active-tab' : ''}`}>
            <Display size={20} /> Phòng Chiếu
          </NavLink>
          <NavLink to="/seats" className={({ isActive }) => `admin-nav-link ${isActive ? 'active-tab' : ''}`}>
            <Grid size={20} /> Ghế Ngồi
          </NavLink>
          <NavLink to="/pricings" className={({ isActive }) => `admin-nav-link ${isActive ? 'active-tab' : ''}`}>
            <Tag size={20} /> Bảng Giá
          </NavLink>
          <NavLink to="/tickets" className={({ isActive }) => `admin-nav-link ${isActive ? 'active-tab' : ''}`}>
            <Ticket size={20} /> Vé
          </NavLink>
        </div>
      </nav>

      <main className="admin-content">
        <div className="admin-topbar">
          <div className="admin-user-info">
            <span style={{ fontWeight: '500', fontSize: '16px', color: '#111111' }}>
              Hello, {user?.fullName || "Admin"}
            </span>
            <button className="admin-logout-btn" style={{ backgroundColor: "white", color: "#111111", border: "1.5px solid #CACACB" }} onClick={() => navigate('/')}>Trang chủ</button>
            <button className="admin-logout-btn" onClick={handleLogout}>Đăng xuất</button>
          </div>
        </div>

        <div className="admin-page-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
