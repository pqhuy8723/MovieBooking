import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Container, Row, Col, Form, Button, Modal, Table } from "react-bootstrap";
import { Lock, PencilSquare } from 'react-bootstrap-icons';
import { InputGroup, FormControl } from 'react-bootstrap';
import authService from "../../services/authService";
import bookingService from "../../services/bookingService";

function UserProfile() {
  const { id } = useParams();
  const [show, setShow] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    gender: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [userData, setUserData] = useState(null);
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const responseData = await authService.getMe();
        const userInfo = responseData.data || responseData;
        setUserData(userInfo);

        setFormData({
          full_name: userInfo.fullName || "",
          email: userInfo.email || "",
          phone: userInfo.phone || "",
          gender: userInfo.gender || "",
        });

        const bookingsRes = await bookingService.getMyBookings();
        const ticketsList = bookingsRes.data?.data || bookingsRes.data || [];
        setTickets(ticketsList);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const filterTickets = (ticket) => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    return (
      (ticket.bookingCode || "").toLowerCase().includes(lowerSearchTerm) ||
      (ticket.movieTitle || "").toLowerCase().includes(lowerSearchTerm) ||
      (ticket.cinemaName || "").toLowerCase().includes(lowerSearchTerm)
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const handleClose = () => {
    setShow(false);
    setPasswordData({
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setErrors({});
  };
  const handleShow = () => setShow(true);

  const handleCloseEdit = () => {
    setShowEdit(false);
    setErrors({});
  };
  const handleShowEdit = () => setShowEdit(true);

  const handleModalClose = () => {
    setShowSuccessModal(false);
    setSuccessMessage("");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setErrors({ ...errors, [name]: "" });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value,
    });
    setErrors({ ...errors, [name]: "" });
  };

  const validateFields = () => {
    const validationErrors = {};
    if (!formData.full_name) validationErrors.full_name = "Họ và tên không được bỏ trống!";
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const validatePasswordFields = () => {
    const validationErrors = {};
    if (!passwordData.oldPassword)
      validationErrors.oldPassword = "Mật khẩu hiện tại không được bỏ trống!";
    if (!passwordData.newPassword || passwordData.newPassword.length < 6)
      validationErrors.newPassword = "Mật khẩu mới phải có ít nhất 6 ký tự!";
    if (!passwordData.confirmPassword)
      validationErrors.confirmPassword = "Vui lòng xác nhận mật khẩu!";
    else if (passwordData.newPassword !== passwordData.confirmPassword)
      validationErrors.confirmPassword = "Mật khẩu xác nhận không khớp!";
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateFields()) return;
    setUpdating(true);
    setTimeout(() => {
      setSuccessMessage("Tính năng cập nhật đang được hoàn thiện!");
      setShowSuccessModal(true);
      setUpdating(false);
      handleCloseEdit();
    }, 500);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!validatePasswordFields()) return;

    try {
      setUpdating(true);
      await authService.changePassword({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      });
      setSuccessMessage("Đổi mật khẩu thành công!");
      setShowSuccessModal(true);
      handleClose();
    } catch (err) {
      const msg = err.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại!";
      setErrors({ oldPassword: msg });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "50vh" }}>
        <div className="spinner-border text-dark" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '80vh', padding: '48px 0', fontFamily: 'Helvetica, Arial, sans-serif' }}>
      <Container style={{ maxWidth: '960px' }}>

        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 style={{ fontFamily: 'Helvetica, sans-serif', fontWeight: '700', fontSize: '32px', textTransform: 'uppercase', color: '#111111', margin: 0, letterSpacing: '0.5px' }}>
            Tài Khoản & Cài Đặt
          </h2>
          <div className="d-flex gap-3">
            <button onClick={handleShowEdit} title="Cập nhật thông tin" style={{ background: '#F5F5F5', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#111111' }}>
              <PencilSquare size={18} />
            </button>
            <button onClick={handleShow} title="Đổi mật khẩu" style={{ background: '#111111', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#FFFFFF' }}>
              <Lock size={18} />
            </button>
          </div>
        </div>

        <Row>
          <Col lg={12}>
            <div style={{ marginBottom: '48px', backgroundColor: '#FAFAFA', padding: '32px', borderRadius: '16px' }}>
              <Row className="mb-4">
                <Col md={6} className="mb-4">
                  <p style={{ color: '#707072', fontSize: '12px', textTransform: 'uppercase', fontWeight: '500', margin: '0 0 8px 0' }}>Họ và tên</p>
                  <p style={{ fontSize: '18px', fontWeight: '500', color: '#111111', margin: 0 }}>{userData?.fullName || "Chưa cập nhật"}</p>
                </Col>

                <Col md={6} className="mb-4">
                  <p style={{ color: '#707072', fontSize: '12px', textTransform: 'uppercase', fontWeight: '500', margin: '0 0 8px 0' }}>Email</p>
                  <p style={{ fontSize: '18px', fontWeight: '500', color: '#111111', margin: 0 }}>{userData?.email}</p>
                </Col>

                <Col md={6} className="mb-4">
                  <p style={{ color: '#707072', fontSize: '12px', textTransform: 'uppercase', fontWeight: '500', margin: '0 0 8px 0' }}>Số điện thoại</p>
                  <p style={{ fontSize: '18px', fontWeight: '500', color: '#111111', margin: 0 }}>{userData?.phone || "Chưa cập nhật"}</p>
                </Col>

                <Col md={6} className="mb-4">
                  <p style={{ color: '#707072', fontSize: '12px', textTransform: 'uppercase', fontWeight: '500', margin: '0 0 8px 0' }}>Giới tính</p>
                  <p style={{ fontSize: '18px', fontWeight: '500', color: '#111111', margin: 0 }}>
                    {userData?.gender === "MALE" ? "Nam" : userData?.gender === "FEMALE" ? "Nữ" : userData?.gender === "OTHER" ? "Khác" : "Chưa cập nhật"}
                  </p>
                </Col>
              </Row>
            </div>
          </Col>
        </Row>

        <Row>
          <Col lg={12}>
            <div style={{ paddingTop: '32px', borderTop: '1px solid #111111' }}>
              <h2 style={{ fontFamily: 'Helvetica, sans-serif', fontWeight: '700', fontSize: '24px', textTransform: 'uppercase', color: '#111111', marginBottom: '24px' }}>
                Lịch Sử Đặt Vé
              </h2>

              <InputGroup className="mb-4">
                <FormControl
                  placeholder="Tìm kiếm mã vé, rạp, hoặc tên phim..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ borderRadius: '24px', padding: '12px 24px', backgroundColor: '#FAFAFA', border: '1px solid #CACACB' }}
                />
              </InputGroup>

              <div style={{ overflowX: 'auto' }}>
                <Table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ backgroundColor: '#FFFFFF', color: '#707072', fontWeight: '500', textTransform: 'uppercase', fontSize: '14px', padding: '16px', borderBottom: '2px solid #111111', textAlign: 'left' }}>Mã Chuyến</th>
                      <th style={{ backgroundColor: '#FFFFFF', color: '#707072', fontWeight: '500', textTransform: 'uppercase', fontSize: '14px', padding: '16px', borderBottom: '2px solid #111111', textAlign: 'left' }}>Phim</th>
                      <th style={{ backgroundColor: '#FFFFFF', color: '#707072', fontWeight: '500', textTransform: 'uppercase', fontSize: '14px', padding: '16px', borderBottom: '2px solid #111111', textAlign: 'left' }}>Địa Điểm</th>
                      <th style={{ backgroundColor: '#FFFFFF', color: '#707072', fontWeight: '500', textTransform: 'uppercase', fontSize: '14px', padding: '16px', borderBottom: '2px solid #111111', textAlign: 'left' }}>Tổng Giá</th>
                      <th style={{ backgroundColor: '#FFFFFF', color: '#707072', fontWeight: '500', textTransform: 'uppercase', fontSize: '14px', padding: '16px', borderBottom: '2px solid #111111', textAlign: 'left' }}>Trạng Thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.length > 0 ? (
                      tickets.filter(filterTickets).map(ticket => (
                        <tr key={ticket.id} style={{ borderBottom: '1px solid #E5E5E5' }}>
                          <td style={{ padding: '16px', fontWeight: '500' }}>#{ticket.bookingCode}</td>
                          <td style={{ padding: '16px' }}>{ticket.movieTitle}</td>
                          <td style={{ padding: '16px' }}>{ticket.cinemaName}</td>
                          <td style={{ padding: '16px', fontWeight: '500' }}>{formatCurrency(ticket.totalPrice)}</td>
                          <td style={{ padding: '16px' }}>
                            <span style={{ color: ticket.status === 'PAID' ? '#007D48' : '#D30005', fontWeight: '500', backgroundColor: ticket.status === 'PAID' ? '#DFFFB9' : '#FFE5E5', padding: '4px 12px', borderRadius: '30px', fontSize: '12px' }}>
                              {ticket.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: '#707072' }}>Chưa có lịch sử đặt vé nào.</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </div>
          </Col>
        </Row>
      </Container>


      {/* MODAL CẬP NHẬT THÔNG TIN */}
      <Modal show={showEdit} onHide={handleCloseEdit} centered>
        <Modal.Header closeButton style={{ borderBottom: 'none' }}>
          <Modal.Title style={{ textTransform: 'uppercase', fontWeight: '700', fontSize: '20px' }}>CẬP NHẬT THÔNG TIN</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4">
              <Form.Label style={{ color: '#707072', fontSize: '14px', textTransform: 'uppercase', fontWeight: '500' }}>Họ và tên</Form.Label>
              <Form.Control
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                isInvalid={!!errors.full_name}
                style={{ borderRadius: '8px', border: '1px solid #CACACB', padding: '12px 16px', backgroundColor: '#FAFAFA' }}
              />
              <Form.Control.Feedback type="invalid">{errors.full_name}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label style={{ color: '#707072', fontSize: '14px', textTransform: 'uppercase', fontWeight: '500' }}>Số điện thoại</Form.Label>
              <Form.Control
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                style={{ borderRadius: '8px', border: '1px solid #CACACB', padding: '12px 16px', backgroundColor: '#FAFAFA' }}
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label style={{ color: '#707072', fontSize: '14px', textTransform: 'uppercase', fontWeight: '500' }}>Giới tính</Form.Label>
              <Form.Control
                as="select"
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                style={{ borderRadius: '8px', border: '1px solid #CACACB', padding: '12px 16px', backgroundColor: '#FAFAFA' }}
              >
                <option value="">Chọn giới tính</option>
                <option value="MALE">Nam</option>
                <option value="FEMALE">Nữ</option>
                <option value="OTHER">Khác</option>
              </Form.Control>
            </Form.Group>

            <Button
              type="submit"
              disabled={updating}
              style={{ width: "100%", background: "#111111", border: "none", borderRadius: "30px", padding: "12px", fontSize: "16px", fontWeight: "500" }}
            >
              {updating ? "ĐANG LƯU..." : "LƯU THAY ĐỔI"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* MODAL ĐỔI MẬT KHẨU */}
      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton style={{ borderBottom: 'none' }}>
          <Modal.Title style={{ textTransform: 'uppercase', fontWeight: '700', fontSize: '20px' }}>THAY ĐỔI MẬT KHẨU</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handlePasswordSubmit}>
            <Form.Group className="mb-4">
              <Form.Label style={{ color: '#707072', fontSize: '14px', textTransform: 'uppercase', fontWeight: '500' }}>Mật khẩu hiện tại</Form.Label>
              <Form.Control
                type="password"
                name="oldPassword"
                value={passwordData.oldPassword}
                onChange={handlePasswordChange}
                isInvalid={!!errors.oldPassword}
                style={{ borderRadius: '8px', border: '1px solid #CACACB', padding: '12px 16px', backgroundColor: '#FAFAFA' }}
              />
              <Form.Control.Feedback type="invalid">
                {errors.oldPassword}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label style={{ color: '#707072', fontSize: '14px', textTransform: 'uppercase', fontWeight: '500' }}>Mật khẩu mới</Form.Label>
              <Form.Control
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                isInvalid={!!errors.newPassword}
                style={{ borderRadius: '8px', border: '1px solid #CACACB', padding: '12px 16px', backgroundColor: '#FAFAFA' }}
              />
              <Form.Control.Feedback type="invalid">
                {errors.newPassword}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label style={{ color: '#707072', fontSize: '14px', textTransform: 'uppercase', fontWeight: '500' }}>
                Xác nhận mật khẩu
              </Form.Label>
              <Form.Control
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                isInvalid={!!errors.confirmPassword}
                style={{ borderRadius: '8px', border: '1px solid #CACACB', padding: '12px 16px', backgroundColor: '#FAFAFA' }}
              />
              <Form.Control.Feedback type="invalid">
                {errors.confirmPassword}
              </Form.Control.Feedback>
            </Form.Group>
            <Button
              type="submit"
              disabled={updating}
              style={{ width: "100%", background: "#111111", border: "none", borderRadius: "30px", padding: "12px", fontSize: "16px", fontWeight: "500" }}
            >
              {updating ? "ĐANG XỬ LÝ..." : "CẬP NHẬT MẬT KHẨU"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      <Modal centered show={showSuccessModal} onHide={handleModalClose}>
        <Modal.Header closeButton style={{ borderBottom: 'none' }}>
          <Modal.Title style={{ fontWeight: '700' }}>Thông báo</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ color: '#111111' }}>{successMessage}</Modal.Body>
        <Modal.Footer style={{ borderTop: 'none' }}>
          <Button style={{ background: "#111111", border: "none", borderRadius: "30px", padding: "8px 24px" }} onClick={handleModalClose}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default UserProfile;
