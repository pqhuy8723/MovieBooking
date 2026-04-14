import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";

function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookingCode = searchParams.get("booking_code");
  const [showModal, setShowModal] = useState(true);

  useEffect(() => {
    // Xóa booking code khỏi sessionStorage sau khi hiển thị
    if (bookingCode) {
      sessionStorage.removeItem("booking_code");
    }
  }, [bookingCode]);

  const handleClose = () => {
    setShowModal(false);
    navigate("/");
  };

  return (
    <div style={{ 
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center", 
      minHeight: "60vh",
      padding: "20px"
    }}>
      <Modal show={showModal} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title style={{ color: "#28a745" }}>
            Thanh toán thành công!
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div style={{ textAlign: "center", padding: "20px" }}>
            <div style={{ 
              fontSize: "48px", 
              color: "#28a745", 
              marginBottom: "20px" 
            }}>
              
            </div>
            <h3 style={{ color: "#333", marginBottom: "15px" }}>
              Cảm ơn bạn đã thanh toán!
            </h3>
            {bookingCode && (
              <p style={{ fontSize: "16px", color: "#555", marginBottom: "10px" }}>
                <strong>Mã đặt vé:</strong> {bookingCode}
              </p>
            )}
            <p style={{ fontSize: "16px", color: "#555", marginBottom: "20px" }}>
              Thông tin vé đã được gửi về email của bạn. 
              Vui lòng kiểm tra email để xem chi tiết vé đã đặt.
            </p>
            <p style={{ fontSize: "14px", color: "#777" }}>
              Bạn có thể xem lại vé trong trang cá nhân của mình.
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleClose}>
            Về trang chủ
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default PaymentSuccess;
