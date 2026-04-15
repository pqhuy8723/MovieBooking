import React from "react";
import { Link } from "react-router-dom";
import "../../CSS/Nike.css";

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="nike-footer">
      <div className="nike-footer-grid">
        <div>
          <div className="nike-footer-brand">Movie 36</div>
          <p style={{ fontSize: '14px', color: '#CACACB', lineHeight: '1.75', maxWidth: '240px' }}>
            Trải nghiệm đặt vé xem phim nhanh chóng, tiện lợi và hiện đại nhất.
          </p>
        </div>

        <div className="nike-footer-col">
          <h4>Khám phá</h4>
          <ul>
            <li><Link to="/movie">Phim đang chiếu</Link></li>
            <li><Link to="/showtime">Lịch chiếu</Link></li>
            <li><Link to="/info">Hệ thống rạp</Link></li>
            <li><Link to="/price">Giá vé</Link></li>
          </ul>
        </div>

        <div className="nike-footer-col">
          <h4>Hỗ trợ</h4>
          <ul>
            <li><a href="#">Câu hỏi thường gặp</a></li>
            <li><a href="#">Chính sách đổi vé</a></li>
            <li><a href="#">Điều khoản sử dụng</a></li>
            <li><a href="#">Chính sách bảo mật</a></li>
          </ul>
        </div>

        <div className="nike-footer-col">
          <h4>Liên hệ</h4>
          <ul>
            <li><a href="tel:+842838000000">+84 28 3800 0000</a></li>
            <li><a href="mailto:support@movie36.vn">support@movie36.vn</a></li>
            <li><a href="#">Hà Nội & Hồ Chí Minh</a></li>
          </ul>
        </div>
      </div>

      <div className="nike-footer-bottom">
        <span>© {year} Movie 36. All Rights Reserved.</span>
        <div style={{ display: 'flex', gap: '24px' }}>
          <a href="#" style={{ color: '#CACACB', textDecoration: 'none' }}>Bảo mật</a>
          <a href="#" style={{ color: '#CACACB', textDecoration: 'none' }}>Điều khoản</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
