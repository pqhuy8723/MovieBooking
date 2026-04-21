import React, { useEffect, useState, useCallback } from "react";
import { Table, Button, Form, Modal, Container, Alert, Pagination, Row, Col } from "react-bootstrap";
import directorService from "../../services/directorService";
import "../../CSS/AdminPages.css";

const DirectorsManager = () => {
  const [directors, setGenres] = useState([]);
  const [currentDirector, setCurrentDirector] = useState(null);
  const [newDirector, setNewDirector] = useState("");
  const [newStatus, setNewStatus] = useState("ACTIVE");
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteDirectorId, setDeleteDirectorId] = useState(null);
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

  const fetchDirectors = useCallback(async (pageIndex = 0) => {
    setLoading(true);
    try {
      const res = await directorService.getAll(pageIndex, pageSize, debouncedFilter);
      const pageData = res.data || res.result || res;
      if (pageData) {
        setGenres(pageData.content || (Array.isArray(pageData) ? pageData : []));
        setTotalPages(pageData.totalPages || 1);
        setCurrentPage(pageIndex);
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Lỗi khi tải danh sách đạo diễn");
    } finally {
      setLoading(false);
    }
  }, [debouncedFilter]);

  useEffect(() => {
    fetchDirectors(currentPage);
  }, [fetchDirectors, currentPage]);

  const addDirector = async () => {
    if (!newDirector.trim()) {
      setValidationError("Tên đạo diễn không được để trống!");
      return;
    }
    try {
      await directorService.create({ name: newDirector.trim(), status: newStatus });
      setSuccess("Thêm đạo diễn thành công!");
      setError(null);
      setShowModal(false);
      setNewDirector("");
      setNewStatus("ACTIVE");
      setValidationError("");
      fetchDirectors(currentPage);
    } catch (err) {
      setValidationError(err?.response?.data?.message || "Lỗi khi thêm đạo diễn");
    }
  };

  const editDirector = async () => {
    if (!currentDirector || !currentDirector.name.trim()) {
      setValidationError("Tên đạo diễn không được để trống!");
      return;
    }
    try {
      await directorService.update(currentDirector.id, {
        name: currentDirector.name.trim(),
        status: currentDirector.status
      });
      setSuccess("Cập nhật đạo diễn thành công!");
      setError(null);
      setShowModal(false);
      setCurrentDirector(null);
      setValidationError("");
      fetchDirectors(currentPage);
    } catch (err) {
      setValidationError(err?.response?.data?.message || "Lỗi khi cập nhật đạo diễn");
    }
  };

  const toggleStatus = async (director) => {
    try {
      if (director.status === "ACTIVE") {
        await directorService.delete(director.id);
      } else {
        await directorService.restore(director.id);
      }
      setSuccess("Cập nhật trạng thái đạo diễn thành công!");
      setError(null);
      fetchDirectors(currentPage);
    } catch (err) {
      setError(err?.response?.data?.message || "Lỗi khi cập nhật trạng thái");
    }
  };

  const deleteDirector = async () => {
    try {
      await directorService.delete(deleteDirectorId);
      setSuccess("Xóa đạo diễn thành công (đã chuyển sang trạng thái Vô hiệu)!");
      setError(null);
      setShowDeleteModal(false);
      setDeleteDirectorId(null);
      fetchDirectors(currentPage);
    } catch (err) {
      setError(err?.response?.data?.message || "Lỗi khi xóa đạo diễn");
      setShowDeleteModal(false);
    }
  };

  const handleCancel = () => {
    setValidationError("");
    setShowModal(false);
    setCurrentDirector(null);
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setDeleteDirectorId(null);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    let items = [];
    for (let number = 0; number < totalPages; number++) {
      items.push(
        <Pagination.Item key={number} active={number === currentPage} onClick={() => fetchDirectors(number)}>
          {number + 1}
        </Pagination.Item>
      );
    }
    return (
      <div className="d-flex justify-content-center mt-3">
        <Pagination>
          <Pagination.Prev disabled={currentPage === 0} onClick={() => fetchDirectors(currentPage - 1)} />
          {items}
          <Pagination.Next disabled={currentPage === totalPages - 1} onClick={() => fetchDirectors(currentPage + 1)} />
        </Pagination>
      </div>
    );
  };

  const fldStyle = { borderRadius: 8, border: "2px solid #dee2e6", padding: "10px 14px", fontSize: 15, transition: "border-color .2s" };
  const labelStyle = { fontWeight: 600, fontSize: 14, color: "#444", textTransform: "uppercase", marginBottom: 6 };

  return (
    <Container>
      <h2 className="my-4 text-center">Quản Lý Đạo Diễn</h2>
      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess(null)} dismissible>{success}</Alert>}

      {/* Filters */}
      <div style={{ background: "#fff", borderRadius: 12, padding: "16px 20px", marginBottom: 20, boxShadow: "0 2px 8px rgba(0,0,0,.07)" }}>
        <Row className="g-3 align-items-end">
          <Col xs={12} sm={8}>
            <Form.Label style={labelStyle}>Tìm theo tên</Form.Label>
            <Form.Control
              type="text"
              placeholder="Nhập tên đạo diễn..."
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
                <th>Đạo Diễn</th>
                <th>Trạng Thái</th>
                <th>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {directors.length === 0 ? (
                <tr><td colSpan={4}>Không có dữ liệu</td></tr>
              ) : (
                directors.map((director) => (
                  <tr key={director.id}>
                    <td>{director.id}</td>
                    <td>{director.name}</td>
                    <td>
                      <span className={`badge ${director.status === "ACTIVE" ? "bg-success" : "bg-secondary"}`} style={{ padding: "8px 12px", fontSize: "0.85rem" }}>
                        {director.status === "ACTIVE" ? "Hoạt động" : "Vô hiệu"}
                      </span>
                    </td>
                    <td>
                      <Button
                        variant="warning"
                        size="sm"
                        className="me-2 text-white"
                        title="Sửa"
                        onClick={() => {
                          setCurrentDirector(director);
                          setShowModal(true);
                        }}
                      >
                        <i className="bi bi-pencil-square" style={{ fontSize: "1.1rem" }}></i>
                      </Button>
                      {director.status === "ACTIVE" ? (
                        <Button
                          variant="danger"
                          size="sm"
                          title="Xóa"
                          onClick={() => {
                            setDeleteDirectorId(director.id);
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
                          onClick={() => toggleStatus(director)}
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
          setCurrentDirector(null);
          setNewDirector("");
          setNewStatus("ACTIVE");
          setShowModal(true);
        }}
        style={{ borderRadius: 8, padding: "10px 20px" }}
      >
        <i className="bi bi-plus-circle me-2"></i> Thêm Đạo Diễn
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
            {currentDirector ? "Sửa Đạo Diễn" : "Thêm Đạo Diễn"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form className="admin-form">
            <Form.Group className="mb-3" controlId="formGenreName">
              <Form.Label style={labelStyle}>* Tên Đạo Diễn</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nhập tên đạo diễn (VD: Hành Động, Hài Hước)"
                value={currentDirector ? currentDirector.name : newDirector}
                onChange={(e) => {
                  currentDirector
                    ? setCurrentDirector({ ...currentDirector, name: e.target.value })
                    : setNewDirector(e.target.value);
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
            onClick={currentDirector ? editDirector : addDirector}
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
          <Modal.Title>Xác Nhận Xóa Đạo Diễn</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Bạn có chắc chắn muốn vô hiệu hóa đạo diễn này không? (Có thể khôi phục sau).
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleDeleteCancel}>
            Hủy
          </Button>
          <Button variant="danger" onClick={deleteDirector}>
            Thực hiện xóa
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default DirectorsManager;
