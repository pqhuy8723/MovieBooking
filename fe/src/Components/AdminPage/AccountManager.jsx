import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Table, Button, Form, Modal, Container, Alert, Badge, Pagination, Row, Col } from "react-bootstrap";
import adminUserService from "../../services/adminUserService";
import "../../CSS/AdminPages.css";

const genderLabel = (g) => {
  if (g === "MALE") return "Nam";
  if (g === "FEMALE") return "Nữ";
  if (g === "OTHER") return "Khác";
  return "—";
};

const emptyCreateForm = { fullName: "", email: "", password: "", phone: "", gender: "", role: "USER" };

const AccountManager = () => {
  const [accounts, setAccounts] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const [filterGender, setFilterGender] = useState("");
  const [filterEnabled, setFilterEnabled] = useState("");

  const [editUser, setEditUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ fullName: "", phone: "", gender: "", role: "", enabled: true });
  const [editErrors, setEditErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState(emptyCreateForm);
  const [createErrors, setCreateErrors] = useState({});
  const [creating, setCreating] = useState(false);

  const [showToggleModal, setShowToggleModal] = useState(false);
  const [toggleTarget, setToggleTarget] = useState(null);


  const fetchAccounts = useCallback(async (page = 0) => {
    setLoading(true);
    try {
      const res = await adminUserService.getAll(page, 5, filterGender, filterEnabled);
      const data = res.data || res;
      setAccounts(data.content || []);
      setTotalPages(data.totalPages || 0);
      setCurrentPage(data.number || 0);
    } catch (err) {
      setErrorMessage("Không thể tải danh sách tài khoản. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  }, [filterGender, filterEnabled]);

  useEffect(() => { fetchAccounts(0); }, [fetchAccounts]);



  const notify = (type, msg) => {
    if (type === "success") { setSuccessMessage(msg); setErrorMessage(null); }
    else { setErrorMessage(msg); setSuccessMessage(null); }
  };

  const openEditModal = (user) => {
    setEditUser(user);
    setEditForm({ fullName: user.fullName || "", phone: user.phone || "", gender: user.gender || "", role: user.role || "USER", enabled: user.enabled });
    setEditErrors({});
    setShowEditModal(true);
  };

  const validateEdit = () => {
    const errs = {};
    if (!editForm.fullName.trim()) errs.fullName = "Họ và tên không được bỏ trống!";
    setEditErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validateEdit()) return;
    setSaving(true);
    try {
      await adminUserService.update(editUser.id, editForm);
      notify("success", "Cập nhật tài khoản thành công!");
      setShowEditModal(false);
      fetchAccounts(currentPage);
    } catch (err) {
      notify("error", err.response?.data?.message || "Cập nhật thất bại, vui lòng thử lại!");
    } finally {
      setSaving(false);
    }
  };

  const validateCreate = () => {
    const errs = {};
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!createForm.fullName.trim()) errs.fullName = "Họ và tên không được bỏ trống!";
    if (!createForm.email.trim()) errs.email = "Email không được bỏ trống!";
    else if (!emailRe.test(createForm.email)) errs.email = "Email không đúng định dạng!";
    if (!createForm.password) errs.password = "Mật khẩu không được bỏ trống!";
    else if (createForm.password.length < 6) errs.password = "Mật khẩu phải có ít nhất 6 ký tự!";
    setCreateErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreate = async () => {
    if (!validateCreate()) return;
    setCreating(true);
    try {
      await adminUserService.create(createForm);
      notify("success", "Tạo tài khoản thành công!");
      setShowCreateModal(false);
      setCreateForm(emptyCreateForm);
      fetchAccounts(0);
    } catch (err) {
      notify("error", err.response?.data?.message || "Tạo tài khoản thất bại!");
    } finally {
      setCreating(false);
    }
  };

  const openToggleModal = (user) => { setToggleTarget(user); setShowToggleModal(true); };

  const handleToggle = async () => {
    try {
      await adminUserService.update(toggleTarget.id, {
        fullName: toggleTarget.fullName, phone: toggleTarget.phone,
        gender: toggleTarget.gender, role: toggleTarget.role,
        enabled: !toggleTarget.enabled,
      });
      notify("success", `Tài khoản đã được ${!toggleTarget.enabled ? "mở khóa" : "khóa"} thành công!`);
      setShowToggleModal(false);
      fetchAccounts(currentPage);
    } catch (err) {
      notify("error", "Cập nhật trạng thái thất bại!");
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const items = [];
    for (let i = 0; i < totalPages; i++) {
      items.push(
        <Pagination.Item key={i} active={i === currentPage} onClick={() => fetchAccounts(i)}>{i + 1}</Pagination.Item>
      );
    }
    return (
      <div className="d-flex justify-content-center mt-3">
        <Pagination>
          <Pagination.Prev disabled={currentPage === 0} onClick={() => fetchAccounts(currentPage - 1)} />
          {items}
          <Pagination.Next disabled={currentPage === totalPages - 1} onClick={() => fetchAccounts(currentPage + 1)} />
        </Pagination>
      </div>
    );
  };

  const fldStyle = { borderRadius: 8, border: "2px solid #dee2e6", padding: "10px 14px", fontSize: 15, transition: "border-color .2s" };
  const labelStyle = { fontWeight: 600, fontSize: 14, color: "#444", textTransform: "uppercase", marginBottom: 6 };
  const errStyle = { color: "#dc3545", fontSize: 13, marginTop: 4 };

  const ModalField = ({ label, error, children }) => (
    <Form.Group className="mb-3">
      <Form.Label style={labelStyle}>{label}</Form.Label>
      {children}
      {error && <div style={errStyle}>{error}</div>}
    </Form.Group>
  );

  return (
    <Container>
      {/* Header */}
      <div className="admin-header mt-4">
        <h2>Quản Lý Tài Khoản</h2>
        <Button
          variant="dark"
          className="admin-btn-add"
          onClick={() => { setCreateForm(emptyCreateForm); setCreateErrors({}); setShowCreateModal(true); }}
        >
          <i className="bi bi-person-plus-fill me-2" />Thêm Tài Khoản
        </Button>
      </div>

      {/* Alerts */}
      {successMessage && <Alert variant="success" onClose={() => setSuccessMessage(null)} dismissible className="admin-alert">{successMessage}</Alert>}
      {errorMessage && <Alert variant="danger" onClose={() => setErrorMessage(null)} dismissible className="admin-alert">{errorMessage}</Alert>}

      {/* Filters */}
      <div style={{ background: "#fff", borderRadius: 12, padding: "16px 20px", marginBottom: 20, boxShadow: "0 2px 8px rgba(0,0,0,.07)" }}>
        <Row className="g-3 align-items-end">
          <Col xs={12} sm={4}>
            <Form.Label style={labelStyle}>Lọc theo Giới Tính</Form.Label>
            <Form.Select value={filterGender} onChange={(e) => setFilterGender(e.target.value)} style={fldStyle}>
              <option value="">-- Tất cả --</option>
              <option value="MALE">Nam</option>
              <option value="FEMALE">Nữ</option>
              <option value="OTHER">Khác</option>
            </Form.Select>
          </Col>
          <Col xs={12} sm={4}>
            <Form.Label style={labelStyle}>Lọc theo Trạng Thái</Form.Label>
            <Form.Select value={filterEnabled} onChange={(e) => setFilterEnabled(e.target.value)} style={fldStyle}>
              <option value="">-- Tất cả --</option>
              <option value="true">Hoạt động</option>
              <option value="false">Bị khóa</option>
            </Form.Select>
          </Col>
          <Col xs={12} sm={4}>
            <Button variant="outline-secondary" style={{ borderRadius: 8, height: "46px", display: "inline-flex", alignItems: "center" }} onClick={() => { setFilterGender(""); setFilterEnabled(""); }}>
              <i className="bi bi-x-circle me-1" />Xóa bộ lọc
            </Button>
          </Col>
        </Row>
      </div>

      {/* Table */}
      {loading ? (
        <div className="admin-loading"><div className="spinner-border text-dark" role="status" /></div>
      ) : (
        <>
          <div className="admin-table">
            <Table className="table mb-0 text-center align-middle">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Họ và Tên</th>
                  <th>Email</th>
                  <th>Số Điện Thoại</th>
                  <th>Giới Tính</th>
                  <th>Vai Trò</th>
                  <th>Trạng Thái</th>
                  <th>Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {accounts.length === 0 ? (
                  <tr><td colSpan="8" className="admin-empty">Không có tài khoản nào phù hợp.</td></tr>
                ) : (
                  accounts.map((account) => {
                    const isAdmin = account.role === "ADMIN";
                    return (
                      <tr key={account.id}>
                        <td>{account.id}</td>
                        <td style={{ fontWeight: 600 }}>{account.fullName || "—"}</td>
                        <td>{account.email}</td>
                        <td>{account.phone || "—"}</td>
                        <td>{genderLabel(account.gender)}</td>
                        <td>
                          <Badge bg={isAdmin ? "danger" : "secondary"}>{account.role}</Badge>
                        </td>
                        <td>
                          <Badge bg={account.enabled ? "success" : "warning"} text={account.enabled ? undefined : "dark"}>
                            {account.enabled ? "Hoạt động" : "Bị khóa"}
                          </Badge>
                        </td>
                        <td>
                          {isAdmin ? (
                            <span style={{ color: "#999", fontSize: 13, fontStyle: "italic" }}>Không thể chỉnh sửa</span>
                          ) : (
                            <>
                              <Button variant="warning" size="sm" className="admin-btn-action me-1" onClick={() => openEditModal(account)}>
                                <i className="bi bi-pencil-square me-1" />Sửa
                              </Button>
                              <Button
                                variant={account.enabled ? "outline-danger" : "outline-success"}
                                size="sm"
                                className="admin-btn-action"
                                onClick={() => openToggleModal(account)}
                              >
                                {account.enabled ? <><i className="bi bi-lock me-1" />Khóa</> : <><i className="bi bi-unlock me-1" />Mở khóa</>}
                              </Button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </Table>
          </div>
          {renderPagination()}
        </>
      )}

      {/* ── MODAL: Chỉnh sửa ───────────────────────────── */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered backdrop="static" className="admin-modal">
        <Modal.Header closeButton>
          <Modal.Title>Chỉnh Sửa Tài Khoản</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form className="admin-form">
            <ModalField label="* Họ và Tên" error={editErrors.fullName}>
              <Form.Control
                style={fldStyle} type="text" value={editForm.fullName}
                onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                isInvalid={!!editErrors.fullName}
              />
            </ModalField>
            <ModalField label="Số Điện Thoại">
              <Form.Control
                style={fldStyle} type="text" value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              />
            </ModalField>
            <ModalField label="Giới Tính">
              <Form.Select style={fldStyle} value={editForm.gender} onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}>
                <option value="">-- Chọn --</option>
                <option value="MALE">Nam</option>
                <option value="FEMALE">Nữ</option>
                <option value="OTHER">Khác</option>
              </Form.Select>
            </ModalField>
            <ModalField label="Vai Trò">
              <Form.Select style={fldStyle} value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}>
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
              </Form.Select>
            </ModalField>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>Hủy</Button>
          <Button variant="dark" onClick={handleSave} disabled={saving}>
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ── MODAL: Tạo mới ─────────────────────────────── */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} centered backdrop="static" className="admin-modal">
        <Modal.Header closeButton>
          <Modal.Title>Thêm Tài Khoản Mới</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form className="admin-form">
            <ModalField label="* Họ và Tên" error={createErrors.fullName}>
              <Form.Control
                style={fldStyle} type="text" placeholder="Nhập họ và tên"
                value={createForm.fullName}
                onChange={(e) => { setCreateForm({ ...createForm, fullName: e.target.value }); setCreateErrors({ ...createErrors, fullName: "" }); }}
                isInvalid={!!createErrors.fullName}
              />
            </ModalField>
            <ModalField label="* Email" error={createErrors.email}>
              <Form.Control
                style={fldStyle} type="email" placeholder="example@email.com"
                value={createForm.email}
                onChange={(e) => { setCreateForm({ ...createForm, email: e.target.value }); setCreateErrors({ ...createErrors, email: "" }); }}
                isInvalid={!!createErrors.email}
              />
            </ModalField>
            <ModalField label="* Mật Khẩu" error={createErrors.password}>
              <Form.Control
                style={fldStyle} type="password" placeholder="Tối thiểu 6 ký tự"
                value={createForm.password}
                onChange={(e) => { setCreateForm({ ...createForm, password: e.target.value }); setCreateErrors({ ...createErrors, password: "" }); }}
                isInvalid={!!createErrors.password}
              />
            </ModalField>
            <ModalField label="Số Điện Thoại">
              <Form.Control
                style={fldStyle} type="text" placeholder="Số điện thoại"
                value={createForm.phone}
                onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
              />
            </ModalField>
            <ModalField label="Giới Tính">
              <Form.Select style={fldStyle} value={createForm.gender} onChange={(e) => setCreateForm({ ...createForm, gender: e.target.value })}>
                <option value="">-- Chọn --</option>
                <option value="MALE">Nam</option>
                <option value="FEMALE">Nữ</option>
                <option value="OTHER">Khác</option>
              </Form.Select>
            </ModalField>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Hủy</Button>
          <Button variant="dark" onClick={handleCreate} disabled={creating}>
            {creating ? "Đang tạo..." : "Tạo tài khoản"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ── MODAL: Khóa/Mở xác nhận ───────────────────── */}
      <Modal show={showToggleModal} onHide={() => setShowToggleModal(false)} centered backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>{toggleTarget?.enabled ? "Xác Nhận Khóa" : "Xác Nhận Mở Khóa"}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: "16px 24px", fontSize: 15 }}>
          Bạn có chắc muốn <strong>{toggleTarget?.enabled ? "khóa" : "mở khóa"}</strong> tài khoản{" "}
          <strong>{toggleTarget?.fullName || toggleTarget?.email}</strong>?
          {toggleTarget?.enabled && (
            <div style={{ marginTop: 12, color: "#dc3545", fontSize: 13, fontWeight: 500 }}>
              <i className="bi bi-exclamation-triangle-fill me-1" /> Tài khoản bị khóa sẽ không thể đăng nhập.
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowToggleModal(false)}>Hủy</Button>
          <Button variant={toggleTarget?.enabled ? "danger" : "success"} onClick={handleToggle}>
            {toggleTarget?.enabled ? "Khóa tài khoản" : "Mở khóa"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AccountManager;
