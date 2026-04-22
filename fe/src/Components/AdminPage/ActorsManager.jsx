import React, { useEffect, useState, useCallback } from "react";
import { Table, Button, Form, Modal, Container, Alert, Pagination, Row, Col } from "react-bootstrap";
import actorService from "../../services/actorService";
import "../../CSS/AdminPages.css";

const ActorsManager = () => {
  const [actors, setGenres] = useState([]);
  const [currentActor, setCurrentActor] = useState(null);
  const [newActor, setNewActor] = useState("");
  const [newStatus, setNewStatus] = useState("ACTIVE");
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteActorId, setDeleteActorId] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [validationError, setValidationError] = useState("");

  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filterName, setFilterName] = useState("");
  const [debouncedFilter, setDebouncedFilter] = useState("");
  const pageSize = 5;

  // Cập nhật debouncedFilter sau 500ms
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedFilter(filterName), 500);
    return () => clearTimeout(timer);
  }, [filterName]);

  const fetchActors = useCallback(async (pageIndex = 0) => {
    setLoading(true);
    try {
      const res = await actorService.getAll(pageIndex, pageSize, debouncedFilter);
      const pageData = res.data || res.result || res;
      if (pageData) {
        setGenres(pageData.content || (Array.isArray(pageData) ? pageData : []));
        setTotalPages(pageData.totalPages || 1);
        setCurrentPage(pageIndex);
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Lỗi khi tải danh sách diễn viên");
    } finally {
      setLoading(false);
    }
  }, [debouncedFilter]);

  useEffect(() => {
    fetchActors(currentPage);
  }, [fetchActors, currentPage]);

  const addActor = async () => {
    if (!newActor.trim()) {
      setValidationError("Tên diễn viên không được để trống!");
      return;
    }
    try {
      await actorService.create({ name: newActor.trim(), status: newStatus });
      setSuccess("Thêm diễn viên thành công!");
      setError(null);
      setShowModal(false);
      setNewActor("");
      setNewStatus("ACTIVE");
      setValidationError("");
      fetchActors(currentPage);
    } catch (err) {
      setValidationError(err?.response?.data?.message || "Lỗi khi thêm diễn viên");
    }
  };

  const editActor = async () => {
    if (!currentActor || !currentActor.name.trim()) {
      setValidationError("Tên diễn viên không được để trống!");
      return;
    }
    try {
      await actorService.update(currentActor.id, {
        name: currentActor.name.trim(),
        status: currentActor.status
      });
      setSuccess("Cập nhật diễn viên thành công!");
      setError(null);
      setShowModal(false);
      setCurrentActor(null);
      setValidationError("");
      fetchActors(currentPage);
    } catch (err) {
      setValidationError(err?.response?.data?.message || "Lỗi khi cập nhật diễn viên");
    }
  };

  const toggleStatus = async (actor) => {
    try {
      if (actor.status === "ACTIVE") {
        await actorService.delete(actor.id);
      } else {
        await actorService.restore(actor.id);
      }
      setSuccess("Cập nhật trạng thái diễn viên thành công!");
      setError(null);
      fetchActors(currentPage);
    } catch (err) {
      setError(err?.response?.data?.message || "Lỗi khi cập nhật trạng thái");
    }
  };

  const deleteActor = async () => {
    try {
      await actorService.delete(deleteActorId);
      setSuccess("Xóa diễn viên thành công (đã chuyển sang trạng thái Vô hiệu)!");
      setError(null);
      setShowDeleteModal(false);
      setDeleteActorId(null);
      fetchActors(currentPage);
    } catch (err) {
      setError(err?.response?.data?.message || "Lỗi khi xóa diễn viên");
      setShowDeleteModal(false);
    }
  };

  const handleCancel = () => {
    setValidationError("");
    setShowModal(false);
    setCurrentActor(null);
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setDeleteActorId(null);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    let items = [];
    for (let number = 0; number < totalPages; number++) {
      items.push(
        <Pagination.Item key={number} active={number === currentPage} onClick={() => fetchActors(number)}>
          {number + 1}
        </Pagination.Item>
      );
    }
    return (
      <div className="d-flex justify-content-center mt-3">
        <Pagination>
          <Pagination.Prev disabled={currentPage === 0} onClick={() => fetchActors(currentPage - 1)} />
          {items}
          <Pagination.Next disabled={currentPage === totalPages - 1} onClick={() => fetchActors(currentPage + 1)} />
        </Pagination>
      </div>
    );
  };

  const fldStyle = { borderRadius: 8, border: "2px solid #dee2e6", padding: "10px 14px", fontSize: 15, transition: "border-color .2s" };
  const labelStyle = { fontWeight: 600, fontSize: 14, color: "#444", textTransform: "uppercase", marginBottom: 6 };

  return (
    <Container>
      <h2 className="my-4 text-center">Quản Lý Diễn Viên</h2>
      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess(null)} dismissible>{success}</Alert>}

      {/* Filters */}
      <div style={{ background: "#fff", borderRadius: 12, padding: "16px 20px", marginBottom: 20, boxShadow: "0 2px 8px rgba(0,0,0,.07)" }}>
        <Row className="g-3 align-items-end">
          <Col xs={12} sm={8}>
            <Form.Label style={labelStyle}>Tìm theo tên</Form.Label>
            <Form.Control
              type="text"
              placeholder="Nhập tên diễn viên..."
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              style={fldStyle}
            />
          </Col>
          <Col xs={12} sm={4}>
            <Button variant="outline-secondary" style={{ borderRadius: 8, height: "46px", display: "inline-flex", alignItems: "center" }} onClick={() => setFilterName("")}>
              <i className="bi bi-x-circle me-1" />Xóa bộ lọc
            </Button>
          </Col>
        </Row>
      </div>

      {loading ? (
        <div className="admin-loading"><div className="spinner-border text-dark" role="status" /></div>
      ) : (
        <>
          <Table striped bordered hover responsive className="text-center align-middle">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Diễn Viên</th>
                <th>Trạng Thái</th>
                <th>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {actors.length === 0 ? (
                <tr><td colSpan={4}>Không có dữ liệu</td></tr>
              ) : (
                actors.map((actor) => (
                  <tr key={actor.id}>
                    <td>{actor.id}</td>
                    <td>{actor.name}</td>
                    <td>
                      <span className={`badge ${actor.status === "ACTIVE" ? "bg-success" : "bg-secondary"}`} style={{ padding: "8px 12px", fontSize: "0.85rem" }}>
                        {actor.status === "ACTIVE" ? "Hoạt động" : "Vô hiệu"}
                      </span>
                    </td>
                    <td>
                      <Button
                        variant="warning"
                        size="sm"
                        className="me-2 text-white"
                        title="Sửa"
                        onClick={() => {
                          setCurrentActor(actor);
                          setShowModal(true);
                        }}
                      >
                        <i className="bi bi-pencil-square" style={{ fontSize: "1.1rem" }}></i>
                      </Button>
                      {actor.status === "ACTIVE" ? (
                        <Button
                          variant="danger"
                          size="sm"
                          title="Xóa"
                          onClick={() => {
                            setDeleteActorId(actor.id);
                            setShowDeleteModal(true);
                          }}
                        >
                          <i className="bi bi-trash" style={{ fontSize: "1.1rem" }}></i>
                        </Button>
                      ) : (
                        <Button
                          variant="info"
                          size="sm"
                          className="text-white"
                          title="Khôi phục"
                          onClick={() => toggleStatus(actor)}
                        >
                          <i className="bi bi-arrow-counterclockwise" style={{ fontSize: "1.1rem" }}></i>
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
          {renderPagination()}
        </>
      )}

      <Button
        variant="primary"
        className="mt-3"
        onClick={() => {
          setCurrentActor(null);
          setNewActor("");
          setNewStatus("ACTIVE");
          setShowModal(true);
        }}
        style={{ borderRadius: 8, padding: "10px 20px" }}
      >
        <i className="bi bi-plus-circle me-2"></i> Thêm Diễn Viên
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
            {currentActor ? "Sửa Diễn Viên" : "Thêm Diễn Viên"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form className="admin-form">
            <Form.Group className="mb-3" controlId="formGenreName">
              <Form.Label style={labelStyle}>* Tên Diễn Viên</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nhập tên diễn viên"
                value={currentActor ? currentActor.name : newActor}
                onChange={(e) => {
                  currentActor
                    ? setCurrentActor({ ...currentActor, name: e.target.value })
                    : setNewActor(e.target.value);
                  setValidationError("");
                }}
                isInvalid={!!validationError}
                style={fldStyle}
              />
              {validationError && (
                <Form.Control.Feedback type="invalid">
                  {validationError}
                </Form.Control.Feedback>
              )}
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCancel}>
            Hủy
          </Button>
          <Button
            variant="success"
            onClick={currentActor ? editActor : addActor}
          >
            Lưu
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showDeleteModal}
        onHide={handleDeleteCancel}
        centered
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>Xác Nhận Xóa Diễn Viên</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Bạn có chắc chắn muốn vô hiệu hóa diễn viên này không? (Có thể khôi phục sau).
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleDeleteCancel}>
            Hủy
          </Button>
          <Button variant="danger" onClick={deleteActor}>
            Thực hiện xóa
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ActorsManager;
