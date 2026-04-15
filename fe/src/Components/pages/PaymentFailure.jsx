import { useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import "../../CSS/Nike.css";

function PaymentFailure() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const error = searchParams.get("error");

  useEffect(() => {
    sessionStorage.removeItem("booking_code");
  }, []);

  const getErrorMessage = () => {
    switch (error) {
      case "checksum_failed": return "Lỗi xác thực thanh toán. Vui lòng thử lại.";
      case "server_error": return "Lỗi hệ thống. Vui lòng thử lại sau.";
      default: return "Thanh toán không thành công. Vui lòng thử lại hoặc chọn phương thức khác.";
    }
  };

  return (
    <div className="nike-payment-wrap">
      <div className="nike-payment-card">
        <span className="nike-payment-icon">❌</span>
        <h1 className="nike-h1" style={{ marginBottom: '16px' }}>THANH TOÁN THẤT BẠI</h1>
        <p className="nike-body" style={{ color: '#707072', marginBottom: '8px' }}>
          {getErrorMessage()}
        </p>
        <p className="nike-caption" style={{ marginBottom: '32px' }}>
          Nếu bạn đã bị trừ tiền, vui lòng liên hệ hỗ trợ để được hoàn tiền.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button className="btn-nike-primary" onClick={() => navigate(-1)}>Thử lại</button>
          <Link to="/" className="btn-nike-secondary">Về trang chủ</Link>
        </div>
      </div>
    </div>
  );
}

export default PaymentFailure;
