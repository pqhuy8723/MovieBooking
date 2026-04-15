import React from "react";
import { Link } from "react-router-dom";
import "../../CSS/Nike.css";

function TicketPricing() {
  const tiers = [
    {
      type: "Người Lớn",
      emoji: "🎟️",
      price: 90000,
      desc: "Từ 18 tuổi trở lên",
      rules: [
        "Xuất trình CMND/CCCD khi mua vé",
        "Không áp dụng cùng khuyến mãi khác",
        "Vé không hoàn trả sau khi mua",
      ],
    },
    {
      type: "Trẻ Em",
      emoji: "🧒",
      price: 60000,
      desc: "Dưới 12 tuổi",
      highlight: true,
      rules: [
        "Xuất trình giấy khai sinh hoặc hộ chiếu",
        "Phải có phụ huynh đi kèm",
        "Chỉ áp dụng cho phim phù hợp",
      ],
    },
    {
      type: "Sinh Viên",
      emoji: "🎓",
      price: 75000,
      desc: "Dưới 22 tuổi, có thẻ sinh viên",
      rules: [
        "Xuất trình thẻ sinh viên hợp lệ",
        "Áp dụng tất cả ngày trong tuần",
        "Không áp dụng suất chiếu đặc biệt",
      ],
    },
  ];

  const movieRatings = [
    { code: "P", color: "#007D48", bg: "#DFFFB9", label: "Phổ Thông", desc: "Phù hợp mọi lứa tuổi. Không có yếu tố bạo lực hay nội dung 18+." },
    { code: "C13", color: "#D30005", bg: "#FFE5E5", label: "13+", desc: "Trẻ em dưới 13 tuổi cần có cha mẹ hoặc người giám hộ đi kèm." },
    { code: "C16", color: "#D33918", bg: "#FFE2D6", label: "16+", desc: "Chỉ phù hợp cho khán giả từ 16 tuổi trở lên." },
    { code: "C18", color: "#111111", bg: "#E5E5E5", label: "18+", desc: "Dành riêng cho người lớn. Có thể chứa nội dung bạo lực hoặc nhạy cảm." },
  ];

  return (
    <div style={{ fontFamily: 'Helvetica, Arial, sans-serif', background: '#FFFFFF', minHeight: '80vh' }}>
      {/* Hero */}
      <div style={{ background: '#111111', padding: '80px 48px', color: 'white' }}>
        <p style={{ fontSize: '12px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#707072', marginBottom: '12px' }}>
          Giá vé
        </p>
        <h1 style={{ fontSize: '56px', fontWeight: '700', textTransform: 'uppercase', lineHeight: '0.95', margin: 0 }}>
          BẢNG GIÁ VÉ
        </h1>
      </div>

      <div className="nike-page" style={{ paddingTop: '48px' }}>
        {/* Price Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2px', marginBottom: '64px' }}>
          {tiers.map((tier, i) => (
            <div
              key={i}
              style={{
                padding: '40px 32px',
                background: tier.highlight ? '#111111' : '#FAFAFA',
                color: tier.highlight ? 'white' : '#111111',
                position: 'relative',
              }}
            >
              {tier.highlight && (
                <div style={{ position: 'absolute', top: '16px', right: '16px', background: '#D30005', color: 'white', fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '30px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Phổ biến
                </div>
              )}
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>{tier.emoji}</div>
              <div style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', color: tier.highlight ? '#CACACB' : '#9E9EA0', marginBottom: '8px' }}>
                {tier.desc}
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px', color: 'inherit' }}>{tier.type}</h2>
              <div style={{ fontSize: '40px', fontWeight: '700', marginBottom: '24px', lineHeight: '1' }}>
                {tier.price.toLocaleString()}
                <span style={{ fontSize: '18px', fontWeight: '400', marginLeft: '6px', opacity: 0.7 }}>đ</span>
              </div>

              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', padding: 0, margin: 0 }}>
                {tier.rules.map((rule, j) => (
                  <li key={j} style={{ fontSize: '14px', color: tier.highlight ? '#CACACB' : '#707072', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <span style={{ color: tier.highlight ? '#CACACB' : '#111111', fontWeight: '700', marginTop: '1px' }}>—</span>
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Movie Ratings */}
        <div style={{ borderTop: '2px solid #111111', paddingTop: '48px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '24px' }}>
            Phân Loại Độ Tuổi
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
            {movieRatings.map((r, i) => (
              <div key={i} style={{ padding: '24px', border: '1px solid #E5E5E5' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <span style={{
                    background: r.bg, color: r.color,
                    fontSize: '14px', fontWeight: '700',
                    padding: '4px 12px', borderRadius: '30px',
                  }}>
                    {r.code}
                  </span>
                  <span style={{ fontSize: '16px', fontWeight: '700', color: '#111111' }}>{r.label}</span>
                </div>
                <p style={{ fontSize: '13px', color: '#707072', margin: 0, lineHeight: '1.6' }}>{r.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ background: '#F5F5F5', padding: '48px', textAlign: 'center', marginTop: '64px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '12px' }}>
            Sẵn sàng xem phim?
          </h2>
          <p style={{ color: '#707072', marginBottom: '24px', fontSize: '16px' }}>
            Chọn phim yêu thích và đặt vé ngay hôm nay.
          </p>
          <Link to="/movie" className="btn-nike-primary">Xem phim đang chiếu</Link>
        </div>
      </div>
    </div>
  );
}

export default TicketPricing;
