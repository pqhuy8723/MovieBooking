import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import authService from "../../services/authService";
import { Modal } from "react-bootstrap";
import "../../CSS/Nike.css";

const LoginRegister = () => {
  const [currentForm, setCurrentForm] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [full_name, setFull_name] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [remember, setRemember] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [successModal, setSuccessModal] = useState(false);
  const [successModalMessage, setSuccessModalMessage] = useState("");

  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRemember(true);
    } else {
      const oldRemembered = localStorage.getItem("rememberedAccount");
      if (oldRemembered) {
        try {
          const { email: e } = JSON.parse(oldRemembered);
          if (e) {
            setEmail(e);
            setRemember(true);
          }
        } catch (err) { }
      }
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(user.role === "ADMIN" ? "/dashboard" : "/");
    }
  }, [isAuthenticated, user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    const result = await login(email, password);
    if (result.success) {
      if (remember) {
        localStorage.setItem("rememberedEmail", email);
        localStorage.removeItem("rememberedAccount");
      } else {
        localStorage.removeItem("rememberedEmail");
        localStorage.removeItem("rememberedAccount");
      }
    } else {
      setErrorMessage(result.message);
    }
    setIsSubmitting(false);
  };

  const validateRegister = () => {
    const errs = {};
    const emailReg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const phoneReg = /^0\d{9,10}$/;
    if (!full_name) errs.full_name = "Họ và tên không được để trống";
    if (!email || !emailReg.test(email)) errs.email = "Email không hợp lệ";
    if (!phone || !phoneReg.test(phone)) errs.phone = "Số điện thoại không hợp lệ";
    if (!gender) errs.gender = "Vui lòng chọn giới tính";
    if (!password || password.length < 6) errs.password = "Mật khẩu tối thiểu 6 ký tự";
    if (password !== confirmPassword) errs.confirmPassword = "Mật khẩu không khớp";
    setValidationErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateRegister()) return;
    setIsSubmitting(true);
    setErrorMessage("");
    try {
      await authService.register({ fullName: full_name, email, password, phone, gender });
      setSuccessModal(true);
      setCurrentForm("login");
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Đăng ký thất bại. Thử lại sau!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      setErrorMessage("Vui lòng nhập email.");
      return;
    }
    setIsSubmitting(true);
    setErrorMessage("");
    try {
      await authService.forgotPassword(email);
      setSuccessModalMessage("Mã OTP đã được gửi đến email của bạn.");
      setSuccessModal(true);
      setCurrentForm("verifyOtp");
    } catch (err) {
      setErrorMessage(err.response?.data?.message || err.response?.data?.error || "Gửi yêu cầu thất bại. Thử lại sau!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) {
      setErrorMessage("Vui lòng nhập mã OTP.");
      return;
    }
    setIsSubmitting(true);
    setErrorMessage("");
    try {
      await authService.verifyOtp(email, otp);
      setSuccessModalMessage("OTP hợp lệ, vui lòng nhập mật khẩu mới.");
      setSuccessModal(true);
      setCurrentForm("resetPassword");
    } catch (err) {
      setErrorMessage(err.response?.data?.message || err.response?.data?.error || "OTP không hợp lệ hoặc đã hết hạn.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp || !password || !confirmPassword) {
      setErrorMessage("Vui lòng nhập đầy đủ thông tin.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Mật khẩu không khớp.");
      return;
    }
    if (password.length < 6) {
      setErrorMessage("Mật khẩu tối thiểu 6 ký tự.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    try {
      await authService.resetPassword({ email, otp, newPassword: password, confirmPassword });
      setSuccessModalMessage("Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.");
      setSuccessModal(true);
      setCurrentForm("login");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setErrorMessage(err.response?.data?.message || err.response?.data?.error || "Đặt lại mật khẩu thất bại. Thử lại sau!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = {
    width: '100%',
    background: '#F5F5F5',
    border: '1px solid #CACACB',
    borderRadius: '8px',
    padding: '12px 16px',
    fontSize: '16px',
    fontFamily: 'Helvetica, Arial, sans-serif',
    outline: 'none',
    transition: 'border-color 200ms ease',
    color: '#111111',
    marginBottom: '4px',
  };

  const labelStyle = {
    fontSize: '12px',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: '#707072',
    marginBottom: '6px',
    display: 'block',
  };

  const errStyle = { fontSize: '12px', color: '#D30005', marginBottom: '12px', display: 'block' };

  return (
    <div className="nike-login-wrap">
      <div className="nike-login-box">
        {/* Logo / Brand */}
        <div className="nike-login-logo">
          <h1>MOVIE 36</h1>
          <p style={{ fontSize: '14px', color: '#707072', marginTop: '4px', textTransform: 'none', fontWeight: '400' }}>
            {currentForm === "login" && "Chào mừng trở lại"}
            {currentForm === "register" && "Tạo tài khoản mới"}
            {currentForm === "forgotPassword" && "Khôi phục mật khẩu"}
            {currentForm === "verifyOtp" && "Xác thực OTP"}
            {currentForm === "resetPassword" && "Đặt lại mật khẩu"}
          </p>
        </div>

        <div className="nike-tabs">
          <button
            className={`nike-tab ${currentForm === "login" ? "active" : ""}`}
            onClick={() => { setCurrentForm("login"); setErrorMessage(""); setValidationErrors({}); }}
          >
            Đăng nhập
          </button>
          <button
            className={`nike-tab ${currentForm === "register" ? "active" : ""}`}
            onClick={() => { setCurrentForm("register"); setErrorMessage(""); setValidationErrors({}); }}
          >
            Đăng ký
          </button>
        </div>

        {/* LOGIN FORM */}
        {currentForm === "login" && (
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                style={inputStyle}
                value={email}
                onChange={(e) => { setEmail(e.target.value.toLowerCase()); setErrorMessage(""); }}
                placeholder="email@example.com"
                required
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Mật khẩu</label>
              <input
                type="password"
                style={inputStyle}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrorMessage(""); }}
                placeholder="Nhập mật khẩu"
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#707072' }}>
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                Ghi nhớ
              </label>
              <span
                style={{ fontSize: '14px', color: '#707072', cursor: 'pointer', textDecoration: 'underline' }}
                onClick={() => { setCurrentForm("forgotPassword"); setErrorMessage(""); }}
              >
                Quên mật khẩu?
              </span>
            </div>

            {errorMessage && (
              <div style={{ background: '#FFE5E5', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', color: '#D30005', fontSize: '14px' }}>
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              className="btn-nike-primary"
              style={{ width: '100%' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>
        )}

        {/* REGISTER FORM */}
        {currentForm === "register" && (
          <form onSubmit={handleRegister}>
            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>Họ và tên *</label>
              <input
                type="text"
                style={{ ...inputStyle, borderColor: validationErrors.full_name ? '#D30005' : '#CACACB' }}
                value={full_name}
                onChange={(e) => { setFull_name(e.target.value); setValidationErrors(v => ({ ...v, full_name: '' })); }}
                placeholder="Nguyễn Văn A"
              />
              {validationErrors.full_name && <span style={errStyle}>{validationErrors.full_name}</span>}
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>Email *</label>
              <input
                type="email"
                style={{ ...inputStyle, borderColor: validationErrors.email ? '#D30005' : '#CACACB' }}
                value={email}
                onChange={(e) => { setEmail(e.target.value.toLowerCase()); setValidationErrors(v => ({ ...v, email: '' })); }}
                placeholder="email@example.com"
              />
              {validationErrors.email && <span style={errStyle}>{validationErrors.email}</span>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={labelStyle}>Số điện thoại *</label>
                <input
                  type="text"
                  style={{ ...inputStyle, borderColor: validationErrors.phone ? '#D30005' : '#CACACB' }}
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); setValidationErrors(v => ({ ...v, phone: '' })); }}
                  placeholder="0901234567"
                />
                {validationErrors.phone && <span style={errStyle}>{validationErrors.phone}</span>}
              </div>
              <div>
                <label style={labelStyle}>Giới tính *</label>
                <select
                  style={{ ...inputStyle, borderColor: validationErrors.gender ? '#D30005' : '#CACACB', cursor: 'pointer' }}
                  value={gender}
                  onChange={(e) => { setGender(e.target.value); setValidationErrors(v => ({ ...v, gender: '' })); }}
                >
                  <option value="">Chọn</option>
                  <option value="MALE">Nam</option>
                  <option value="FEMALE">Nữ</option>
                  <option value="OTHER">Khác</option>
                </select>
                {validationErrors.gender && <span style={errStyle}>{validationErrors.gender}</span>}
              </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>Mật khẩu *</label>
              <input
                type="password"
                style={{ ...inputStyle, borderColor: validationErrors.password ? '#D30005' : '#CACACB' }}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setValidationErrors(v => ({ ...v, password: '' })); }}
                placeholder="Tối thiểu 6 ký tự"
              />
              {validationErrors.password && <span style={errStyle}>{validationErrors.password}</span>}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Xác nhận mật khẩu *</label>
              <input
                type="password"
                style={{ ...inputStyle, borderColor: validationErrors.confirmPassword ? '#D30005' : '#CACACB' }}
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setValidationErrors(v => ({ ...v, confirmPassword: '' })); }}
                placeholder="Nhập lại mật khẩu"
              />
              {validationErrors.confirmPassword && <span style={errStyle}>{validationErrors.confirmPassword}</span>}
            </div>

            {errorMessage && (
              <div style={{ background: '#FFE5E5', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', color: '#D30005', fontSize: '14px' }}>
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              className="btn-nike-primary"
              style={{ width: '100%' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
            </button>
          </form>
        )}

        {/* FORGOT PASSWORD FORM */}
        {currentForm === "forgotPassword" && (
          <form onSubmit={handleForgotPassword}>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                style={inputStyle}
                value={email}
                onChange={(e) => { setEmail(e.target.value.toLowerCase()); setErrorMessage(""); }}
                placeholder="email@example.com"
                required
              />
            </div>

            {errorMessage && (
              <div style={{ background: '#FFE5E5', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', color: '#D30005', fontSize: '14px' }}>
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              className="btn-nike-primary"
              style={{ width: '100%', marginBottom: '12px' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang gửi OTP..." : "Gửi thông tin khôi phục"}
            </button>
            <button
              type="button"
              className="btn-nike-outline"
              style={{ width: '100%' }}
              onClick={() => { setCurrentForm("login"); setErrorMessage(""); }}
            >
              Hủy
            </button>
          </form>
        )}

        {/* VERIFY OTP FORM */}
        {currentForm === "verifyOtp" && (
          <form onSubmit={handleVerifyOtp}>
            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                style={{ ...inputStyle, background: '#e0e0e0', cursor: 'not-allowed' }}
                value={email}
                disabled
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>Mã OTP *</label>
              <input
                type="text"
                style={inputStyle}
                value={otp}
                onChange={(e) => { setOtp(e.target.value); setErrorMessage(""); }}
                placeholder="Nhập mã OTP (6 chữ số)"
                required
              />
            </div>

            {errorMessage && (
              <div style={{ background: '#FFE5E5', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', color: '#D30005', fontSize: '14px' }}>
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              className="btn-nike-primary"
              style={{ width: '100%', marginBottom: '12px' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang xác thực..." : "Tiếp tục"}
            </button>
            <button
              type="button"
              className="btn-nike-outline"
              style={{ width: '100%' }}
              onClick={() => { setCurrentForm("login"); setErrorMessage(""); }}
            >
              Hủy
            </button>
          </form>
        )}

        {/* RESET PASSWORD FORM */}
        {currentForm === "resetPassword" && (
          <form onSubmit={handleResetPassword}>
            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>Mật khẩu mới *</label>
              <input
                type="password"
                style={inputStyle}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrorMessage(""); }}
                placeholder="Tối thiểu 6 ký tự"
                required
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Xác nhận mật khẩu mới *</label>
              <input
                type="password"
                style={inputStyle}
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setErrorMessage(""); }}
                placeholder="Nhập lại mật khẩu mới"
                required
              />
            </div>

            {errorMessage && (
              <div style={{ background: '#FFE5E5', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', color: '#D30005', fontSize: '14px' }}>
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              className="btn-nike-primary"
              style={{ width: '100%', marginBottom: '12px' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang đặt lại..." : "Đặt lại mật khẩu"}
            </button>
            <button
              type="button"
              className="btn-nike-outline"
              style={{ width: '100%' }}
              onClick={() => { setCurrentForm("login"); setErrorMessage(""); }}
            >
              Hủy
            </button>
          </form>
        )}
      </div>

      {/* Success modal */}
      <Modal show={successModal} onHide={() => setSuccessModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>THÔNG BÁO</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p style={{ color: '#707072' }}>{successModalMessage || "Thao tác thành công. Vui lòng tiếp tục."}</p>
        </Modal.Body>
        <Modal.Footer>
          <button
            className="btn-nike-primary"
            style={{ padding: '10px 24px' }}
            onClick={() => setSuccessModal(false)}
          >
            {currentForm === "verifyOtp" || currentForm === "resetPassword" ? "Tiếp tục" : "Đóng"}
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default LoginRegister;