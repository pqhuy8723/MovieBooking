import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";

function PaymentFailure() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const error = searchParams.get("error");
  const [showModal, setShowModal] = useState(true);

  useEffect(() => {
    // Xóa booking code khỏi sessionStorage nếu có
    sessionStorage.removeItem("booking_code");
  }, []);

  const handleClose = () => {
    setShowModal(false);
    navigate("/");
  };

  const getErrorMessage = () => {
    switch (error) {
      case "checksum_failed":
        return "Lỗi xác thực thanh toán. Vui lòng thử lại.";
      case "server_error":
        return "Lỗi hệ thống. Vui lòng thử lại sau.";
      default:
        return "Thanh toán không thành công. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.";
    }
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
          <Modal.Title style={{ color: "#dc3545" }}>
            Thanh toán thất bại
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div style={{ textAlign: "center", padding: "20px" }}>
            <div style={{ 
              fontSize: "48px", 
              color: "#dc3545", 
              marginBottom: "20px" 
            }}>
              
            </div>
            <h3 style={{ color: "#333", marginBottom: "15px" }}>
              Rất tiếc, thanh toán không thành công
            </h3>
            <p style={{ fontSize: "16px", color: "#555", marginBottom: "20px" }}>
              {getErrorMessage()}
            </p>
            <p style={{ fontSize: "14px", color: "#777" }}>
              Nếu bạn đã thanh toán, vui lòng liên hệ với chúng tôi để được hỗ trợ.
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Về trang chủ
          </Button>
          <Button variant="primary" onClick={() => {
            setShowModal(false);
            navigate(-1); // Quay lại trang trước
          }}>
            Thử lại
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default PaymentFailure;
