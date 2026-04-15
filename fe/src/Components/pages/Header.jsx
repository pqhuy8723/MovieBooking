import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../CSS/Nike.css";

function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [greeting, setGreeting] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 11) setGreeting("Chào buổi sáng");
    else if (hour < 13) setGreeting("Chào buổi trưa");
    else if (hour < 18) setGreeting("Chào buổi chiều");
    else setGreeting("Chào buổi tối");
  }, [location.pathname]);

  const handleLogout = async (e) => {
    e.preventDefault();
    await logout();
  };

  const isActive = (path) => location.pathname === path ? "active-tab" : "";

  return (
    <header className="nike-header">
      {/* Promo Bar */}
      <div className="nike-promo-bar">
        Đặt vé nhanh — Xem phim hay mỗi ngày
      </div>

      {/* Main Nav */}
      <nav className="nike-navbar">
        {/* Logo */}
        <Link to="/" className="nike-navbar-logo" style={{ display: 'flex', alignItems: 'center' }}>
          <img src="/assets/Logo/black_on_trans.png" alt="Movie 36" style={{ height: '36px' }} />
        </Link>

        {/* Center Links */}
        <ul className="nike-navbar-nav" style={{ margin: 0 }}>
          <li><Link to="/showtime" className={`nike-nav-link ${isActive("/showtime")}`}>Lịch Chiếu</Link></li>
          <li><Link to="/movie" className={`nike-nav-link ${isActive("/movie")}`}>Phim</Link></li>
          <li><Link to="/info" className={`nike-nav-link ${isActive("/info")}`}>Rạp</Link></li>
          <li><Link to="/price" className={`nike-nav-link ${isActive("/price")}`}>Giá Vé</Link></li>
        </ul>

        {/* Right Actions */}
        <div className="nike-navbar-actions">
          {isAuthenticated && user ? (
            <>
              <Link to={`/profile/${user.id}`} style={{ fontSize: '14px', fontWeight: '500', color: '#111111', textDecoration: 'none' }}>
                {greeting}, <strong>{user.fullName}</strong>
              </Link>
              <a
                href="#"
                onClick={handleLogout}
                style={{ fontSize: '14px', fontWeight: '500', color: '#707072', textDecoration: 'none' }}
                title="Đăng xuất"
              >
                Đăng xuất
              </a>
            </>
          ) : (
            <>
              <Link to="/login" style={{ fontSize: '14px', fontWeight: '500', color: '#111111', textDecoration: 'none' }}>
                Đăng nhập
              </Link>
              <Link
                to="/login"
                className="btn-nike-primary"
                style={{ padding: '8px 20px', fontSize: '14px' }}
              >
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Header;
