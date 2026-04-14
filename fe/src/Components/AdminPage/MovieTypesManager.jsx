import React, { useEffect, useState } from "react";
import { Table, Button, Form, Modal, Container, Alert } from "react-bootstrap";
// Removed API imports
import "../../CSS/AdminPages.css";

const MovieTypesManager = () => {
  const [movieTypes, setMovieTypes] = useState([]);
  const [currentMovieType, setCurrentMovieType] = useState(null);
  const [newMovieType, setNewMovieType] = useState("");
  const [newStatus, setNewStatus] = useState("active");
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteMovieTypeId, setDeleteMovieTypeId] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [validationError, setValidationError] = useState("");

  const fetchMovieTypes = async () => {
    setMovieTypes([{id: 1, name: "Phim Đang Chiếu", status: "active"}, {id: 2, name: "Phim Sắp Chiếu", status: "active"}]);
  };

  const validateMovieType = (name) => {
    const isDuplicate = movieTypes.some((type) => type.name.toLowerCase() === name.toLowerCase());
    return isDuplicate;
  };

  const addMovieType = async () => {
    if (!newMovieType) {
      setValidationError("Tên loại phim không được để trống!");
      return;
    }

    if (validateMovieType(newMovieType)) {
      setValidationError("Loại phim này đã tồn tại!");
      return;
    }

    setTimeout(() => {
      const added = {
        id: Date.now(),
        name: newMovieType,
        status: newStatus,
      };
      setMovieTypes((prev) => [...prev, added]);
      setNewMovieType("");
      setNewStatus("active");
      setShowModal(false);
      setValidationError("");
      setSuccess("Thêm loại phim thành công!");
      setError(null);
    }, 300);
  };

  const editMovieType = async () => {
    if (!currentMovieType || !currentMovieType.name) {
      setValidationError("Tên loại phim không được để trống!");
      return;
    }

    if (validateMovieType(currentMovieType.name)) {
      setValidationError("Loại phim này đã tồn tại!");
      return;
    }

    setTimeout(() => {
      const updated = {
        id: currentMovieType.id,
        name: currentMovieType.name,
        status: currentMovieType.status,
      };
      setMovieTypes((prev) =>
        prev.map((type) => (type.id === updated.id ? updated : type))
      );
      setCurrentMovieType(null);
      setShowModal(false);
      setValidationError("");
      setSuccess("Cập nhật loại phim thành công!");
    }, 300);
  };

  const toggleStatus = async (movieType) => {
    const updatedStatus = movieType.status === "active" ? "inactive" : "active";
    setTimeout(() => {
      const updated = {
        ...movieType,
        status: updatedStatus,
      };
      setMovieTypes((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      );
      setSuccess("Cập nhật trạng thái loại phim thành công!");
      setError(null);
    }, 300);
  };

  const deleteMovieType = async () => {
    setTimeout(() => {
      setMovieTypes((prev) => prev.filter((type) => type.id !== deleteMovieTypeId));
      setSuccess("Xóa loại phim thành công!");
      setError(null);
      setShowDeleteModal(false);
    }, 300);
  };

  const handleCancel = () => {
    setValidationError("");
    setShowModal(false);
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
      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess(null)} dismissible>{success}</Alert>}

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
          {movieTypes.map((movieType) => (
            <tr key={movieType.id}>
              <td>{movieType.id}</td>
              <td>{movieType.name}</td>
              <td>
                <Button
                  variant={movieType.status === "active" ? "success" : "secondary"}
                  onClick={() => toggleStatus(movieType)}
                >
                  {movieType.status === "active" ? "Hoạt động" : "Vô hiệu"}
                </Button>
              </td>
              <td>
                <Button
                  variant="warning"
                  className="me-2"
                  onClick={() => {
                    setCurrentMovieType(movieType);
                    setShowModal(true);
                  }}
                >
                  <i className="bi bi-pencil-square"></i> Sửa
                </Button>
                <Button
                  variant="danger"
                  onClick={() => {
                    setDeleteMovieTypeId(movieType.id);
                    setShowDeleteModal(true);
                  }}
                >
                  <i className="bi bi-trash"></i> Xóa
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Button
        variant="primary"
        className="mt-3"
        onClick={() => {
          setCurrentMovieType(null);
          setNewMovieType("");
          setNewStatus("active");
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
          <Modal.Title>{currentMovieType ? "Sửa Loại Phim" : "Thêm Loại Phim"}</Modal.Title>
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
                  currentMovieType
                    ? setCurrentMovieType({ ...currentMovieType, name: e.target.value })
                    : setNewMovieType(e.target.value); setValidationError("");
                }}
                isInvalid={validationError}
              />
              {validationError && (
                <Form.Control.Feedback type="invalid">{validationError}</Form.Control.Feedback>
              )}
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCancel}>Hủy</Button>
          <Button
            variant="success"
            onClick={currentMovieType ? editMovieType : addMovieType}
          >
            Lưu
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete confirmation modal */}
      <Modal show={showDeleteModal} onHide={handleDeleteCancel} centered>
        <Modal.Header closeButton>
          <Modal.Title>Xác Nhận Xóa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Bạn có chắc chắn muốn xóa loại phim này không?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleDeleteCancel}>Hủy</Button>
          <Button variant="danger" onClick={deleteMovieType}>Xóa</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default MovieTypesManager;
