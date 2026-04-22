import React, { useEffect, useState } from "react";
import { Table, Button, Form, Modal, Container, Alert } from "react-bootstrap";
import cinemaService from "../../services/cinemaService";
import "../../CSS/AdminPages.css";

const EMPTY_FORM = { name: "", address: "", phone: "", email: "", description: "" };

const CinemasManager = () => {
    const [cinemas, setCinemas] = useState([]);
    const [currentCinema, setCurrentCinema] = useState(null);
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteCinemaId, setDeleteCinemaId] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [validationError, setValidationError] = useState("");
    const [loading, setLoading] = useState(false);

    const fetchCinemas = async () => {
        try {
            setLoading(true);
            const res = await cinemaService.getAll();
            setCinemas(res.data || []);
        } catch (err) {
            setError("Không thể tải danh sách rạp chiếu!");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (currentCinema) {
            setCurrentCinema({ ...currentCinema, [name]: value });
        } else {
            setFormData({ ...formData, [name]: value });
        }
        setValidationError("");
    };

    const validate = (data, excludeId = null) => {
        if (!data.name?.trim()) return "Tên rạp không được để trống!";
        if (!data.address?.trim()) return "Địa chỉ không được để trống!";
        const isDuplicate = cinemas.some(
            (c) =>
                c.name.toLowerCase() === data.name.trim().toLowerCase() &&
                c.id !== excludeId
        );
        if (isDuplicate) return "Tên rạp này đã tồn tại!";
        return null;
    };

    const addCinema = async () => {
        const err = validate(formData);
        if (err) { setValidationError(err); return; }
        try {
            setLoading(true);
            await cinemaService.create({
                name: formData.name.trim(),
                address: formData.address.trim(),
                phone: formData.phone.trim(),
                email: formData.email.trim(),
                description: formData.description.trim(),
            });
            setFormData(EMPTY_FORM);
            setShowModal(false);
            setValidationError("");
            setSuccess("Thêm rạp chiếu thành công!");
            setError(null);
            await fetchCinemas();
        } catch (err) {
            setError(err?.response?.data?.message || "Thêm rạp thất bại!");
        } finally {
            setLoading(false);
        }
    };

    const editCinema = async () => {
        const err = validate(currentCinema, currentCinema.id);
        if (err) { setValidationError(err); return; }
        try {
            setLoading(true);
            await cinemaService.update(currentCinema.id, {
                name: currentCinema.name.trim(),
                address: currentCinema.address.trim(),
                phone: currentCinema.phone?.trim() || "",
                email: currentCinema.email?.trim() || "",
                description: currentCinema.description?.trim() || "",
                status: currentCinema.status,
            });
            setCurrentCinema(null);
            setShowModal(false);
            setValidationError("");
            setSuccess("Cập nhật rạp chiếu thành công!");
            setError(null);
            await fetchCinemas();
        } catch (err) {
            setError(err?.response?.data?.message || "Cập nhật rạp thất bại!");
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (cinema) => {
        try {
            const isActive = cinema.status?.toLowerCase() === "active";
            if (isActive) {
                await cinemaService.delete(cinema.id);
            } else {
                await cinemaService.restore(cinema.id);
            }
            setSuccess("Cập nhật trạng thái rạp thành công!");
            setError(null);
            await fetchCinemas();
        } catch (err) {
            setError(err?.response?.data?.message || "Cập nhật trạng thái thất bại!");
        }
    };

    const deleteCinema = async () => {
        try {
            setLoading(true);
            await cinemaService.delete(deleteCinemaId);
            setSuccess("Xóa rạp chiếu thành công!");
            setError(null);
            setShowDeleteModal(false);
            setDeleteCinemaId(null);
            await fetchCinemas();
        } catch (err) {
            setError(err?.response?.data?.message || "Xóa rạp thất bại!");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setValidationError("");
        setShowModal(false);
        setCurrentCinema(null);
        setFormData(EMPTY_FORM);
    };

    const handleDeleteCancel = () => {
        setShowDeleteModal(false);
        setDeleteCinemaId(null);
    };

    useEffect(() => {
        fetchCinemas();
    }, []);

    const getValue = (field) =>
        currentCinema ? currentCinema[field] ?? "" : formData[field] ?? "";

    return (
        <Container>
            <h2 className="my-4 text-center">Quản Lý Rạp Chiếu</h2>

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
                            <th>Tên Rạp</th>
                            <th>Địa Chỉ</th>
                            <th>Điện Thoại</th>
                            <th>Email</th>
                            <th>Trạng Thái</th>
                            <th>Hành Động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cinemas.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="text-muted">
                                    Không có dữ liệu
                                </td>
                            </tr>
                        ) : (
                            cinemas.map((cinema) => (
                                <tr key={cinema.id}>
                                    <td>{cinema.id}</td>
                                    <td>{cinema.name}</td>
                                    <td>{cinema.address}</td>
                                    <td>{cinema.phone || "—"}</td>
                                    <td>{cinema.email || "—"}</td>
                                    <td>
                                        <Button
                                            variant={
                                                cinema.status?.toLowerCase() === "active"
                                                    ? "success"
                                                    : "secondary"
                                            }
                                            size="sm"
                                        >
                                            {cinema.status?.toLowerCase() === "active"
                                                ? "Hoạt động"
                                                : "Vô hiệu"}
                                        </Button>
                                    </td>
                                    <td>
                                        <Button
                                            variant="warning"
                                            size="sm"
                                            className="me-2"
                                            onClick={() => {
                                                setCurrentCinema({ ...cinema });
                                                setValidationError("");
                                                setShowModal(true);
                                            }}
                                        >
                                            <i className="bi bi-pencil-square"></i>
                                        </Button>
                                        <Button
                                            variant={cinema.status?.toLowerCase() === "active" ? "danger" : "success"}
                                            size="sm"
                                            title={cinema.status?.toLowerCase() === "active" ? "Xóa" : "Khôi phục"}
                                            onClick={() => {
                                                const isActive = cinema.status?.toLowerCase() === "active";

                                                if (isActive) {
                                                    setDeleteCinemaId(cinema.id);
                                                    setShowDeleteModal(true);
                                                } else {
                                                    toggleStatus(cinema); s
                                                }
                                            }}
                                        >
                                            <i
                                                className={
                                                    cinema.status?.toLowerCase() === "active"
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
                    setCurrentCinema(null);
                    setFormData(EMPTY_FORM);
                    setValidationError("");
                    setShowModal(true);
                }}
            >
                <i className="bi bi-plus-circle"></i> Thêm Rạp Chiếu
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
                        {currentCinema ? "Sửa Rạp Chiếu" : "Thêm Rạp Chiếu"}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form className="admin-form">
                        <Form.Group className="mb-3" controlId="cinemaName">
                            <Form.Label>* Tên Rạp</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                placeholder="Nhập tên rạp"
                                value={getValue("name")}
                                onChange={handleChange}
                                isInvalid={validationError && !getValue("name").trim()}
                            />
                            <Form.Control.Feedback type="invalid">
                                {validationError}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="cinemaAddress">
                            <Form.Label>* Địa Chỉ</Form.Label>
                            <Form.Control
                                type="text"
                                name="address"
                                placeholder="Nhập địa chỉ rạp"
                                value={getValue("address")}
                                onChange={handleChange}
                                isInvalid={validationError && !getValue("address").trim()}
                            />
                            <Form.Control.Feedback type="invalid">
                                {validationError}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="cinemaPhone">
                            <Form.Label>Điện Thoại</Form.Label>
                            <Form.Control
                                type="text"
                                name="phone"
                                placeholder="Nhập số điện thoại"
                                value={getValue("phone")}
                                onChange={handleChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="cinemaEmail">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                placeholder="Nhập email liên hệ"
                                value={getValue("email")}
                                onChange={handleChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="cinemaDescription">
                            <Form.Label>Mô Tả</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="description"
                                placeholder="Nhập mô tả"
                                value={getValue("description")}
                                onChange={handleChange}
                            />
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
                        onClick={currentCinema ? editCinema : addCinema}
                        disabled={loading}
                    >
                        {loading ? "Đang lưu..." : "Lưu"}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Delete Confirm Modal */}
            <Modal show={showDeleteModal} onHide={handleDeleteCancel} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Xác Nhận Xóa</Modal.Title>
                </Modal.Header>
                <Modal.Body>Bạn có chắc chắn muốn xóa rạp chiếu này không?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleDeleteCancel} disabled={loading}>
                        Hủy
                    </Button>
                    <Button variant="danger" onClick={deleteCinema} disabled={loading}>
                        {loading ? "Đang xóa..." : "Xóa"}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default CinemasManager;
