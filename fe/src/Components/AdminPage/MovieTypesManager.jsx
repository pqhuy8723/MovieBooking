import React, { useEffect, useState } from "react";
import { Table, Button, Form, Modal, Container, Alert } from "react-bootstrap";
import movieTypeService from "../../services/movieTypeService";
import "../../CSS/AdminPages.css";

const MovieTypesManager = () => {
  const [movieTypes, setMovieTypes] = useState([]);
  const [currentMovieType, setCurrentMovieType] = useState(null);
  const [newMovieType, setNewMovieType] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteMovieTypeId, setDeleteMovieTypeId] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [validationError, setValidationError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchMovieTypes = async () => {
    try {
      setLoading(true);
      const res = await movieTypeService.getAll();
      setMovieTypes(res.data || []);
    } catch (err) {
      setError("Không thể tải danh sách loại phim!");
    } finally {
      setLoading(false);
    }
  };

  const validateMovieType = (name, excludeId = null) => {
    return movieTypes.some(
      (type) =>
        type.name.toLowerCase() === name.toLowerCase() &&
        type.id !== excludeId
    );
  };

  const addMovieType = async () => {
    if (!newMovieType.trim()) {
      setValidationError("Tên loại phim không được để trống!");
      return;
    }
    if (validateMovieType(newMovieType)) {
      setValidationError("Loại phim này đã tồn tại!");
      return;
    }

    try {
      setLoading(true);
      await movieTypeService.create({ name: newMovieType.trim() });
      setNewMovieType("");
      setShowModal(false);
      setValidationError("");
      setSuccess("Thêm loại phim thành công!");
      setError(null);
      await fetchMovieTypes();
    } catch (err) {
      setError(err?.response?.data?.message || "Thêm loại phim thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const editMovieType = async () => {
    if (!currentMovieType || !currentMovieType.name?.trim()) {
      setValidationError("Tên loại phim không được để trống!");
      return;
    }
    if (validateMovieType(currentMovieType.name, currentMovieType.id)) {
      setValidationError("Loại phim này đã tồn tại!");
      return;
    }

    try {
      setLoading(true);
      await movieTypeService.update(currentMovieType.id, {
        name: currentMovieType.name.trim(),
        status: currentMovieType.status,
      });
      setCurrentMovieType(null);
      setShowModal(false);
      setValidationError("");
      setSuccess("Cập nhật loại phim thành công!");
      setError(null);
      await fetchMovieTypes();
    } catch (err) {
      setError(err?.response?.data?.message || "Cập nhật loại phim thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (movieType) => {
    try {
      const isActive = movieType.status?.toLowerCase() === "active";
      if (isActive) {
        await movieTypeService.delete(movieType.id);
      } else {
        await movieTypeService.restore(movieType.id);
      }
      setSuccess("Cập nhật trạng thái loại phim thành công!");
      setError(null);
      await fetchMovieTypes();
    } catch (err) {
      setError(err?.response?.data?.message || "Cập nhật trạng thái thất bại!");
    }
  };

  const deleteMovieType = async () => {
    try {
      setLoading(true);
      await movieTypeService.delete(deleteMovieTypeId);
      setSuccess("Xóa loại phim thành công!");
      setError(null);
      setShowDeleteModal(false);
      setDeleteMovieTypeId(null);
      await fetchMovieTypes();
    } catch (err) {
      setError(err?.response?.data?.message || "Xóa loại phim thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setValidationError("");
    setShowModal(false);
    setCurrentMovieType(null);
    setNewMovieType("");
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setDeleteMovieTypeId(null);
  };

  useEffect(() => {
    fetchMovieTypes();
  }, []);

  return (
    <Container>
      <h2 className="my-4 text-center">Quản Lý Loại Phim</h2>

      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" onClose={() => setSuccess(null)} dismissible>
          {success}
        </Alert>
      )}

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
              <th>Loại Phim</th>
              <th>Trạng Thái</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {movieTypes.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-muted">
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              movieTypes.map((movieType) => (
                <tr key={movieType.id}>
                  <td>{movieType.id}</td>
                  <td>{movieType.name}</td>
                  <td>
                    <Button
                      variant={
                        movieType.status?.toLowerCase() === "active" ? "success" : "secondary"
                      }
                      size="sm"
                    >
                      {movieType.status?.toLowerCase() === "active" ? "Hoạt động" : "Vô hiệu"}
                    </Button>
                  </td>
                  <td>
                    <Button
                      variant="warning"
                      size="sm"
                      className="me-2"
                      onClick={() => {
                        setCurrentMovieType({ ...movieType });
                        setValidationError("");
                        setShowModal(true);
                      }}
                    >
                      <i className="bi bi-pencil-square"></i>
                    </Button>
                    <Button
                      variant={movieType.status?.toLowerCase() === "active" ? "danger" : "success"}
                      size="sm"
                      onClick={() => {
                        const isActive = movieType.status?.toLowerCase() === "active";

                        if (isActive) {
                          setDeleteMovieTypeId(movieType.id);
                          setShowDeleteModal(true);
                        } else {
                          toggleStatus(movieType);
                        }
                      }}
                    >
                      <i
                        className={
                          movieType.status?.toLowerCase() === "active"
                            ? "bi bi-trash"
                            : "bi bi-arrow-counterclockwise"
                        }
                      ></i>
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
        onClick={() => {
          setCurrentMovieType(null);
          setNewMovieType("");
          setValidationError("");
          setShowModal(true);
        }}
      >
        <i className="bi bi-plus-circle"></i> Thêm Loại Phim
      </Button>

      <Modal
        show={showModal}
        onHide={handleCancel}
        size="lg"
        centered
        backdrop="static"
        className="admin-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {currentMovieType ? "Sửa Loại Phim" : "Thêm Loại Phim"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form className="admin-form">
            <Form.Group className="mb-3" controlId="formMovieTypeName">
              <Form.Label>* Tên Loại Phim</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nhập tên loại phim"
                value={currentMovieType ? currentMovieType.name : newMovieType}
                onChange={(e) => {
                  setValidationError("");
                  if (currentMovieType) {
                    setCurrentMovieType({
                      ...currentMovieType,
                      name: e.target.value,
                    });
                  } else {
                    setNewMovieType(e.target.value);
                  }
                }}
                isInvalid={!!validationError}
              />
              <Form.Control.Feedback type="invalid">
                {validationError}
              </Form.Control.Feedback>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCancel} disabled={loading}>
            Hủy
          </Button>
          <Button
            variant="success"
            onClick={currentMovieType ? editMovieType : addMovieType}
            disabled={loading}
          >
            {loading ? "Đang lưu..." : "Lưu"}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showDeleteModal} onHide={handleDeleteCancel} centered>
        <Modal.Header closeButton>
          <Modal.Title>Xác Nhận Xóa</Modal.Title>
        </Modal.Header>
        <Modal.Body>Bạn có chắc chắn muốn xóa loại phim này không?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleDeleteCancel} disabled={loading}>
            Hủy
          </Button>
          <Button variant="danger" onClick={deleteMovieType} disabled={loading}>
            {loading ? "Đang xóa..." : "Xóa"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default MovieTypesManager;
