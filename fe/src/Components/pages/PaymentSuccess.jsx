import { useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import "../../CSS/Nike.css";

function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookingCode = searchParams.get("booking_code");

  useEffect(() => {
    if (bookingCode) sessionStorage.removeItem("booking_code");
  }, [bookingCode]);

  return (
    <div className="nike-payment-wrap">
      <div className="nike-payment-card">
        <span className="nike-payment-icon">✅</span>
        <h1 className="nike-h1" style={{ marginBottom: '16px' }}>THANH TOÁN THÀNH CÔNG</h1>
        <p className="nike-body" style={{ color: '#707072', marginBottom: '8px' }}>
          Cảm ơn bạn đã đặt vé!
        </p>
        {bookingCode && (
          <div style={{ background: '#F5F5F5', borderRadius: '8px', padding: '16px 24px', margin: '24px 0', display: 'inline-block' }}>
            <span style={{ fontSize: '12px', fontWeight: '500', textTransform: 'uppercase', color: '#707072', letterSpacing: '0.08em' }}>Mã đặt vé</span>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#111111', letterSpacing: '2px', marginTop: '4px' }}>
              {bookingCode}
            </div>
          </div>
        )}
        <p className="nike-caption" style={{ marginBottom: '32px' }}>
          Thông tin vé đã được gửi về email của bạn. Vui lòng kiểm tra để xem chi tiết.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Link to="/" className="btn-nike-primary">Về trang chủ</Link>
          <Link to="/profile/me" className="btn-nike-secondary">Xem vé của tôi</Link>
        </div>
      </div>
    </div>
  );
}

export default PaymentSuccess;
