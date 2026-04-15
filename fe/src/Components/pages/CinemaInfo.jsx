import React from "react";
import "../../CSS/Nike.css";

function CinemaInfo() {
  const cinema = {
    name: "Movie 36 Cinema",
    address: "123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh",
    phone: "+84 28 3800 0000",
    email: "support@movie36.vn",
    hours: "Thứ 2 – Chủ Nhật: 09:00 – 23:00",
  };

  const amenities = [
    { emoji: "📶", title: "WiFi Miễn Phí", desc: "Kết nối internet tốc độ cao toàn rạp" },
    { emoji: "❄️", title: "Điều Hòa", desc: "Hệ thống điều hòa trung tâm hiện đại" },
    { emoji: "🛋️", title: "Ghế VIP", desc: "Ghế ngồi thoải mái, rộng rãi, có gối tựa" },
    { emoji: "📺", title: "Màn Hình 4K", desc: "Chất lượng hình ảnh sắc nét, độ phân giải cao" },
    { emoji: "🍿", title: "Quầy Ăn Uống", desc: "Bỏng ngô, nước ngọt, snack đa dạng" },
    { emoji: "🎁", title: "Quà Lưu Niệm", desc: "Shop quà lưu niệm phim ngay tại rạp" },
  ];

  const transport = [
    { emoji: "🚗", title: "Xe Ô Tô", desc: "Bãi đỗ xe rộng rãi, miễn phí 2 giờ đầu" },
    { emoji: "🚌", title: "Xe Buýt", desc: "Tuyến số 01, 05, 12, 20 dừng trước rạp" },
    { emoji: "🏍️", title: "Xe Máy", desc: "Bãi giữ xe an toàn, có bảo vệ 24/7" },
  ];

  const screens = [
    { name: "Phòng 1 — Standard", capacity: "200 ghế", type: "2D / 3D" },
    { name: "Phòng 2 — Standard", capacity: "180 ghế", type: "2D / 3D" },
    { name: "Phòng 3 — Deluxe", capacity: "150 ghế", type: "2D / 3D / IMAX" },
    { name: "Phòng 4 — VIP", capacity: "50 ghế", type: "VIP Premium" },
  ];

  const sectionHead = (title) => (
    <div style={{ borderBottom: '2px solid #111111', paddingBottom: '12px', marginBottom: '24px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: '700', textTransform: 'uppercase', color: '#111111', margin: 0 }}>{title}</h2>
    </div>
  );

  return (
    <div style={{ fontFamily: 'Helvetica, Arial, sans-serif', background: '#FFFFFF', minHeight: '80vh' }}>
      {/* Hero Banner */}
      <div style={{ background: '#111111', color: 'white', padding: '80px 48px' }}>
        <p style={{ fontSize: '12px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#707072', marginBottom: '12px' }}>Hệ thống rạp</p>
        <h1 style={{ fontSize: '56px', fontWeight: '700', textTransform: 'uppercase', lineHeight: '0.95', marginBottom: '16px' }}>
          {cinema.name}
        </h1>
        <p style={{ fontSize: '16px', color: '#CACACB', margin: 0 }}>
          Trải nghiệm điện ảnh đẳng cấp — Chất lượng Premium
        </p>
      </div>

      <div className="nike-page" style={{ paddingTop: '48px' }}>
        {/* Contact Info */}
        <div className="nike-section">
          {sectionHead("Thông Tin Liên Hệ")}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '32px' }}>
            {[
              { label: "Địa chỉ", value: cinema.address, ico: "📍" },
              { label: "Điện thoại", value: cinema.phone, ico: "📞" },
              { label: "Email", value: cinema.email, ico: "✉️" },
              { label: "Giờ mở cửa", value: cinema.hours, ico: "🕐" },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '24px' }}>{item.ico}</span>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9E9EA0', marginBottom: '4px' }}>{item.label}</div>
                  <div style={{ fontSize: '15px', fontWeight: '500', color: '#111111' }}>{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <hr className="nike-divider" />

        {/* Amenities */}
        <div className="nike-section">
          {sectionHead("Tiện Ích & Dịch Vụ")}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '24px' }}>
            {amenities.map((a, i) => (
              <div key={i} style={{ background: '#FAFAFA', padding: '24px', borderRadius: '0' }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>{a.emoji}</div>
                <div style={{ fontSize: '15px', fontWeight: '700', color: '#111111', marginBottom: '6px' }}>{a.title}</div>
                <div style={{ fontSize: '13px', color: '#707072', lineHeight: '1.6' }}>{a.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <hr className="nike-divider" />

        {/* Transport */}
        <div className="nike-section">
          {sectionHead("Phương Tiện Di Chuyển")}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '24px' }}>
            {transport.map((t, i) => (
              <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', padding: '20px', border: '1px solid #E5E5E5' }}>
                <span style={{ fontSize: '28px' }}>{t.emoji}</span>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: '#111111', marginBottom: '4px' }}>{t.title}</div>
                  <div style={{ fontSize: '13px', color: '#707072' }}>{t.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <hr className="nike-divider" />

        {/* Screens */}
        <div className="nike-section">
          {sectionHead("Phòng Chiếu")}
          <table className="nike-table">
            <thead>
              <tr>
                <th>Phòng</th>
                <th>Sức chứa</th>
                <th>Định dạng</th>
              </tr>
            </thead>
            <tbody>
              {screens.map((s, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: '500' }}>{s.name}</td>
                  <td style={{ color: '#707072' }}>{s.capacity}</td>
                  <td>
                    <span className="nike-badge-success">{s.type}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default CinemaInfo;
