import React, { useEffect, useState } from "react";
import { Table, Button, Form, Modal, Container, Alert } from "react-bootstrap";
import cinemaService from "../../services/cinemaService";
import screenService from "../../services/screenService";
import "../../CSS/AdminPages.css";

const EMPTY_FORM = { name: "", seatingCapacity: "", type: "2D", status: "active" };

const ScreensManager = () => {
  const [cinemas, setCinemas] = useState([]);
  const [selectedCinemaId, setSelectedCinemaId] = useState("");
  const [screens, setScreens] = useState([]);
  const [currentScreen, setCurrentScreen] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteScreenId, setDeleteScreenId] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [validationError, setValidationError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCinemas();
  }, []);

  useEffect(() => {
    if (selectedCinemaId) {
      fetchScreens();
    } else {
      setScreens([]);
    }
  }, [selectedCinemaId]);

  const fetchCinemas = async () => {
    try {
      const res = await cinemaService.getAll();
      const loadedCinemas = res.data || [];
      setCinemas(loadedCinemas);
      if (loadedCinemas.length > 0) {
        setSelectedCinemaId(loadedCinemas[0].id.toString());
      }
    } catch (err) {
      setError("Không thể tải danh sách rạp chiếu!");
    }
  };

  const fetchScreens = async () => {
    try {
      setLoading(true);
      const res = await screenService.getAllByCinemaId(selectedCinemaId);
      setScreens(res.data || []);
    } catch (err) {
      setError("Không thể tải danh sách phòng chiếu!");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (currentScreen) {
      setCurrentScreen({ ...currentScreen, [name]: value });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    setValidationError("");
  };

  const validate = (data, excludeId = null) => {
    if (!data.name?.toString().trim()) return "Tên phòng chiếu không được để trống!";
    if (!data.seatingCapacity && data.seatingCapacity !== 0) return "Sức chứa không được để trống!";
    if (data.seatingCapacity <= 0) return "Sức chứa phải lớn hơn 0!";
    if (!selectedCinemaId) return "Vui lòng chọn rạp chiếu!";

    const isDuplicate = screens.some(
      (screen) =>
        screen.name.toLowerCase() === data.name.toString().trim().toLowerCase() &&
        screen.id !== excludeId
    );
    if (isDuplicate) return "Tên phòng chiếu này đã tồn tại trong rạp!";
    return null;
  };

  const addScreen = async () => {
    const err = validate(formData);
    if (err) { setValidationError(err); return; }
    try {
      setLoading(true);
      await screenService.create({
        name: formData.name.trim(),
        seatingCapacity: parseInt(formData.seatingCapacity, 10),
        type: formData.type,
        status: formData.status,
        cinemaId: parseInt(selectedCinemaId, 10)
      });
      setFormData(EMPTY_FORM);
      setShowAddEditModal(false);
      setValidationError("");
      setSuccess("Thêm phòng chiếu thành công!");
      setError(null);
      await fetchScreens();
    } catch (err) {
      setError(err?.response?.data?.message || "Thêm phòng chiếu thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const editScreen = async () => {
    const err = validate(currentScreen, currentScreen.id);
    if (err) { setValidationError(err); return; }
    try {
      setLoading(true);
      await screenService.update(currentScreen.id, {
        name: currentScreen.name.trim(),
        seatingCapacity: parseInt(currentScreen.seatingCapacity, 10),
        type: currentScreen.type,
        status: currentScreen.status,
        cinemaId: parseInt(selectedCinemaId, 10)
      });
      setCurrentScreen(null);
      setShowAddEditModal(false);
      setValidationError("");
      setSuccess("Cập nhật phòng chiếu thành công!");
      setError(null);
      await fetchScreens();
    } catch (err) {
      setError(err?.response?.data?.message || "Cập nhật phòng chiếu thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (screen) => {
    try {
      const isActive = screen.status?.toLowerCase() === "active";
      if (isActive) {
        await screenService.delete(screen.id);
      } else {
        await screenService.restore(screen.id);
      }
      setSuccess("Cập nhật trạng thái phòng chiếu thành công!");
      setError(null);
      await fetchScreens();
    } catch (err) {
      setError(err?.response?.data?.message || "Cập nhật trạng thái thất bại!");
    }
  };

  const deleteScreen = async () => {
    try {
      setLoading(true);
      await screenService.delete(deleteScreenId);
      setSuccess("Xóa phòng chiếu thành công!");
      setError(null);
      setShowDeleteModal(false);
      setDeleteScreenId(null);
      await fetchScreens();
    } catch (err) {
      setError(err?.response?.data?.message || "Xóa phòng chiếu thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setValidationError("");
    setShowAddEditModal(false);
    setCurrentScreen(null);
    setFormData(EMPTY_FORM);
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setDeleteScreenId(null);
  };

  const getValue = (field) =>
    currentScreen ? currentScreen[field] ?? "" : formData[field] ?? "";

  return (
    <Container>
      <h2 className="my-4 text-center">Quản Lý Phòng Chiếu</h2>

      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess(null)} dismissible>{success}</Alert>}

      {/* Select Cinema */}
      <Form.Group className="mb-4" controlId="selectCinema">
        <Form.Label className="fw-bold">Chọn Rạp Chiếu:</Form.Label>
        <Form.Select
          value={selectedCinemaId}
          onChange={(e) => setSelectedCinemaId(e.target.value)}
        >
          {cinemas.map(cinema => (
            <option key={cinema.id} value={cinema.id}>{cinema.name}</option>
          ))}
          {cinemas.length === 0 && <option value="">Đang tải danh sách rạp...</option>}
        </Form.Select>
      </Form.Group>

      {loading ? (
        <div className="text-center my-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
        </div>
      ) : (
        <Table striped bordered hover responsive className="text-center">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Tên Màn Hình / Phòng Chiếu</th>
              <th>Sức Chứa</th>
              <th>Định Dạng</th>
              <th>Trạng Thái</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {screens.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-muted">Không có dữ liệu</td>
              </tr>
            ) : (
              screens.map((screen) => (
                <tr key={screen.id}>
                  <td>{screen.id}</td>
                  <td>{screen.name}</td>
                  <td>{screen.seatingCapacity} ghế</td>
                  <td>{screen.type}</td>
                  <td>
                    <Button
                      variant={screen.status?.toLowerCase() === "active" ? "success" : "secondary"}
                      size="sm"
                      onClick={() => toggleStatus(screen)}
                    >
                      {screen.status?.toLowerCase() === "active" ? "Hoạt động" : "Vô hiệu"}
                    </Button>
                  </td>
                  <td>
                    <Button
                      variant="warning"
                      size="sm"
                      className="me-2"
                      onClick={() => {
                        setCurrentScreen({ ...screen });
                        setValidationError("");
                        setShowAddEditModal(true);
                      }}
                    >
                      <i className="bi bi-pencil-square"></i> Sửa
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => {
                        setDeleteScreenId(screen.id);
                        setShowDeleteModal(true);
                      }}
                    >
                      <i className="bi bi-trash"></i> Xóa
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      )}

      <Button
        variant="primary"
        className="mt-3"
        disabled={!selectedCinemaId}
        onClick={() => {
          setCurrentScreen(null);
          setFormData(EMPTY_FORM);
          setValidationError("");
          setShowAddEditModal(true);
        }}
      >
        <i className="bi bi-plus-circle"></i> Thêm Phòng Chiếu
      </Button>

      {/* Add / Edit Modal */}
      <Modal
        show={showAddEditModal}
        onHide={handleCancel}
        size="lg"
        centered
        backdrop="static"
        className="admin-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {currentScreen ? "Sửa Phòng Chiếu" : "Thêm Phòng Chiếu"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form className="admin-form">
            <Form.Group className="mb-3" controlId="formScreenName">
              <Form.Label>* Tên Màn Hình / Phòng Chiếu</Form.Label>
              <Form.Control
                type="text"
                name="name"
                placeholder="Nhập tên phòng chiếu (VD: Phòng chiếu 1)"
                value={getValue("name")}
                onChange={handleChange}
                isInvalid={validationError && !getValue("name")?.toString().trim()}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formSeatingCapacity">
              <Form.Label>* Sức Chứa (Số Ghế)</Form.Label>
              <Form.Control
                type="number"
                name="seatingCapacity"
                min="1"
                placeholder="Nhập sức chứa"
                value={getValue("seatingCapacity")}
                onChange={handleChange}
                isInvalid={validationError && (!getValue("seatingCapacity") || getValue("seatingCapacity") <= 0)}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formScreenType">
              <Form.Label>Định Dạng Phim Mặc Định</Form.Label>
              <Form.Select
                name="type"
                value={getValue("type")}
                onChange={handleChange}
              >
                <option value="2D">2D</option>
                <option value="3D">3D</option>
                <option value="IMAX">IMAX</option>
              </Form.Select>
            </Form.Group>

            {validationError && (
              <div className="text-danger small mt-1">{validationError}</div>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCancel} disabled={loading}>
            Hủy
          </Button>
          <Button
            variant="success"
            onClick={currentScreen ? editScreen : addScreen}
            disabled={loading}
          >
            {loading ? "Đang lưu..." : "Lưu"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        show={showDeleteModal}
        onHide={handleDeleteCancel}
        centered
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>Xác Nhận Xóa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Bạn có chắc chắn muốn xóa phòng chiếu này?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleDeleteCancel} disabled={loading}>
            Hủy
          </Button>
          <Button variant="danger" onClick={deleteScreen} disabled={loading}>
            {loading ? "Đang xóa..." : "Xóa"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ScreensManager;
