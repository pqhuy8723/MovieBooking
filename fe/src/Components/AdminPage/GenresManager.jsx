import React, { useEffect, useState, useCallback } from "react";
import { Table, Button, Form, Modal, Container, Alert, Pagination, Row, Col } from "react-bootstrap";
import genreService from "../../services/genreService";
import "../../CSS/AdminPages.css";

const GenresManager = () => {
  const [genres, setGenres] = useState([]);
  const [currentGenre, setCurrentGenre] = useState(null);
  const [newGenre, setNewGenre] = useState("");
  const [newStatus, setNewStatus] = useState("ACTIVE");
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteGenreId, setDeleteGenreId] = useState(null);
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

  const fetchGenres = useCallback(async (pageIndex = 0) => {
    setLoading(true);
    try {
      const res = await genreService.getAll(pageIndex, pageSize, debouncedFilter);
      const pageData = res.data || res.result || res;
      if (pageData) {
        setGenres(pageData.content || (Array.isArray(pageData) ? pageData : []));
        setTotalPages(pageData.totalPages || 1);
        setCurrentPage(pageIndex);
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Lỗi khi tải danh sách thể loại");
    } finally {
      setLoading(false);
    }
  }, [debouncedFilter]);

  useEffect(() => {
    fetchGenres(currentPage);
  }, [fetchGenres, currentPage]);

  const addGenre = async () => {
    if (!newGenre.trim()) {
      setValidationError("Tên thể loại không được để trống!");
      return;
    }
    try {
      await genreService.create({ name: newGenre.trim(), status: newStatus });
      setSuccess("Thêm thể loại thành công!");
      setError(null);
      setShowModal(false);
      setNewGenre("");
      setNewStatus("ACTIVE");
      setValidationError("");
      fetchGenres(currentPage);
    } catch (err) {
      setValidationError(err?.response?.data?.message || "Lỗi khi thêm thể loại");
    }
  };

  const editGenre = async () => {
    if (!currentGenre || !currentGenre.name.trim()) {
      setValidationError("Tên thể loại không được để trống!");
      return;
    }
    try {
      await genreService.update(currentGenre.id, {
        name: currentGenre.name.trim(),
        status: currentGenre.status
      });
      setSuccess("Cập nhật thể loại thành công!");
      setError(null);
      setShowModal(false);
      setCurrentGenre(null);
      setValidationError("");
      fetchGenres(currentPage);
    } catch (err) {
      setValidationError(err?.response?.data?.message || "Lỗi khi cập nhật thể loại");
    }
  };

  const toggleStatus = async (genre) => {
    try {
      if (genre.status === "ACTIVE") {
        await genreService.delete(genre.id);
      } else {
        await genreService.restore(genre.id);
      }
      setSuccess("Cập nhật trạng thái thể loại thành công!");
      setError(null);
      fetchGenres(currentPage);
    } catch (err) {
      setError(err?.response?.data?.message || "Lỗi khi cập nhật trạng thái");
    }
  };

  const deleteGenre = async () => {
    try {
      await genreService.delete(deleteGenreId);
      setSuccess("Xóa thể loại thành công (đã chuyển sang trạng thái Vô hiệu)!");
      setError(null);
      setShowDeleteModal(false);
      setDeleteGenreId(null);
      fetchGenres(currentPage);
    } catch (err) {
      setError(err?.response?.data?.message || "Lỗi khi xóa thể loại");
      setShowDeleteModal(false);
    }
  };

  const handleCancel = () => {
    setValidationError("");
    setShowModal(false);
    setCurrentGenre(null);
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setDeleteGenreId(null);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    let items = [];
    for (let number = 0; number < totalPages; number++) {
      items.push(
        <Pagination.Item key={number} active={number === currentPage} onClick={() => fetchGenres(number)}>
          {number + 1}
        </Pagination.Item>
      );
    }
    return (
      <div className="d-flex justify-content-center mt-3">
        <Pagination>
          <Pagination.Prev disabled={currentPage === 0} onClick={() => fetchGenres(currentPage - 1)} />
          {items}
          <Pagination.Next disabled={currentPage === totalPages - 1} onClick={() => fetchGenres(currentPage + 1)} />
        </Pagination>
      </div>
    );
  };

  const fldStyle = { borderRadius: 8, border: "2px solid #dee2e6", padding: "10px 14px", fontSize: 15, transition: "border-color .2s" };
  const labelStyle = { fontWeight: 600, fontSize: 14, color: "#444", textTransform: "uppercase", marginBottom: 6 };

  return (
    <Container>
      <h2 className="my-4 text-center">Quản Lý Thể Loại</h2>
      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess(null)} dismissible>{success}</Alert>}

      {/* Filters */}
      <div style={{ background: "#fff", borderRadius: 12, padding: "16px 20px", marginBottom: 20, boxShadow: "0 2px 8px rgba(0,0,0,.07)" }}>
        <Row className="g-3 align-items-end">
          <Col xs={12} sm={8}>
            <Form.Label style={labelStyle}>Tìm theo tên</Form.Label>
            <Form.Control
              type="text"
              placeholder="Nhập tên thể loại..."
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
                <th>Thể Loại</th>
                <th>Trạng Thái</th>
                <th>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {genres.length === 0 ? (
                <tr><td colSpan={4}>Không có dữ liệu</td></tr>
              ) : (
                genres.map((genre) => (
                  <tr key={genre.id}>
                    <td>{genre.id}</td>
                    <td>{genre.name}</td>
                    <td>
                      <span className={`badge ${genre.status === "ACTIVE" ? "bg-success" : "bg-secondary"}`} style={{ padding: "8px 12px", fontSize: "0.85rem" }}>
                        {genre.status === "ACTIVE" ? "Hoạt động" : "Vô hiệu"}
                      </span>
                    </td>
                    <td>
                      <Button
                        variant="warning"
                        size="sm"
                        className="me-2 text-white"
                        title="Sửa"
                        onClick={() => {
                          setCurrentGenre(genre);
                          setShowModal(true);
                        }}
                      >
                        <i className="bi bi-pencil-square" style={{ fontSize: "1.1rem" }}></i>
                      </Button>
                      {genre.status === "ACTIVE" ? (
                        <Button
                          variant="danger"
                          size="sm"
                          title="Xóa"
                          onClick={() => {
                            setDeleteGenreId(genre.id);
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
                          onClick={() => toggleStatus(genre)}
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
          setCurrentGenre(null);
          setNewGenre("");
          setNewStatus("ACTIVE");
          setShowModal(true);
        }}
        style={{ borderRadius: 8, padding: "10px 20px" }}
      >
        <i className="bi bi-plus-circle me-2"></i> Thêm Thể Loại
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
            {currentGenre ? "Sửa Thể Loại" : "Thêm Thể Loại"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form className="admin-form">
            <Form.Group className="mb-3" controlId="formGenreName">
              <Form.Label style={labelStyle}>* Tên Thể Loại</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nhập tên thể loại (VD: Hành Động, Hài Hước)"
                value={currentGenre ? currentGenre.name : newGenre}
                onChange={(e) => {
                  currentGenre
                    ? setCurrentGenre({ ...currentGenre, name: e.target.value })
                    : setNewGenre(e.target.value);
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
            onClick={currentGenre ? editGenre : addGenre}
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
          <Modal.Title>Xác Nhận Xóa Thể Loại</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Bạn có chắc chắn muốn vô hiệu hóa thể loại này không? (Có thể khôi phục sau).
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleDeleteCancel}>
            Hủy
          </Button>
          <Button variant="danger" onClick={deleteGenre}>
            Thực hiện xóa
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default GenresManager;
