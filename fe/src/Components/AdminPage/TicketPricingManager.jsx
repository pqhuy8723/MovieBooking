import React, { useEffect, useState } from "react";
import { Table, Button, Form, Modal, Container, Alert } from "react-bootstrap";
import ticketPricingService from "../../services/ticketPricingService";
import "../../CSS/AdminPages.css";

const EMPTY_FORM = { type: "STANDARD", price: "", ageGroup: "", rules: "", status: "active" };

const TicketPricingManager = () => {
    const [pricings, setPricings] = useState([]);
    const [currentPricing, setCurrentPricing] = useState(null);
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [validationError, setValidationError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchPricings();
    }, []);

    const fetchPricings = async () => {
        try {
            setLoading(true);
            const res = await ticketPricingService.getAll();
            setPricings(res.data || []);
        } catch (err) {
            setError("Không thể tải danh sách bảng giá!");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (currentPricing) {
            setCurrentPricing({ ...currentPricing, [name]: value });
        } else {
            setFormData({ ...formData, [name]: value });
        }
        setValidationError("");
    };

    const validate = (data, excludeId = null) => {
        if (!data.type?.trim()) return "Loại vé không được để trống!";
        if (!data.price || data.price <= 0) return "Giá vé phải lớn hơn 0!";

        const isDuplicate = pricings.some(
            (p) =>
                p.type.toLowerCase() === data.type.trim().toLowerCase() &&
                p.id !== excludeId &&
                p.ageGroup?.toLowerCase() === data.ageGroup?.trim().toLowerCase()
        );
        if (isDuplicate) return "Loại giá vé và độ tuổi này đã tồn tại!";

        return null;
    };

    const addPricing = async () => {
        const err = validate(formData);
        if (err) { setValidationError(err); return; }
        try {
            setLoading(true);
            await ticketPricingService.create({
                type: formData.type.trim().toUpperCase(),
                price: parseFloat(formData.price),
                ageGroup: formData.ageGroup?.trim() || null,
                rules: formData.rules?.trim() || null,
                status: formData.status
            });
            setFormData(EMPTY_FORM);
            setShowModal(false);
            setSuccess("Thêm bảng giá thành công!");
            setError(null);
            await fetchPricings();
        } catch (err) {
            setError(err?.response?.data?.message || "Thêm thất bại!");
        } finally {
            setLoading(false);
        }
    };

    const editPricing = async () => {
        const err = validate(currentPricing, currentPricing.id);
        if (err) { setValidationError(err); return; }
        try {
            setLoading(true);
            await ticketPricingService.update(currentPricing.id, {
                type: currentPricing.type.trim().toUpperCase(),
                price: parseFloat(currentPricing.price),
                ageGroup: currentPricing.ageGroup?.trim() || null,
                rules: currentPricing.rules?.trim() || null,
                status: currentPricing.status
            });
            setCurrentPricing(null);
            setShowModal(false);
            setSuccess("Cập nhật thành công!");
            setError(null);
            await fetchPricings();
        } catch (err) {
            setError(err?.response?.data?.message || "Cập nhật thất bại!");
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (pricing) => {
        try {
            const isActive = pricing.status?.toLowerCase() === "active";
            if (isActive) {
                await ticketPricingService.delete(pricing.id);
            } else {
                await ticketPricingService.restore(pricing.id);
            }
            setSuccess("Cập nhật trạng thái thành công!");
            setError(null);
            await fetchPricings();
        } catch (err) {
            setError(err?.response?.data?.message || "Cập nhật trạng thái thất bại!");
        }
    };

    const confirmDelete = async () => {
        try {
            setLoading(true);
            await ticketPricingService.delete(deleteId);
            setSuccess("Ngừng hoạt động loại vé thành công!");
            setError(null);
            setShowDeleteModal(false);
            setDeleteId(null);
            await fetchPricings();
        } catch (err) {
            setError(err?.response?.data?.message || "Xóa thất bại!");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setShowModal(false);
        setCurrentPricing(null);
        setFormData(EMPTY_FORM);
        setValidationError("");
    };

    // Helper format currency VND
    const formatVND = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const getValue = (field) => currentPricing ? currentPricing[field] ?? "" : formData[field] ?? "";

    return (
        <Container>
            <h2 className="my-4 text-center">Quản Lý Giá Vé (Ticket Pricing)</h2>

            {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
            {success && <Alert variant="success" onClose={() => setSuccess(null)} dismissible>{success}</Alert>}

            <Button
                variant="primary"
                className="mb-3"
                onClick={() => {
                    setCurrentPricing(null);
                    setFormData(EMPTY_FORM);
                    setValidationError("");
                    setShowModal(true);
                }}
            >
                <i className="bi bi-plus-circle"></i> Thêm Bảng Giá
            </Button>

            {loading ? (
                <div className="text-center my-4">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Đang tải...</span>
                    </div>
                </div>
            ) : (
                <Table striped bordered hover responsive className="text-center align-middle">
                    <thead className="table-dark">
                        <tr>
                            <th>ID</th>
                            <th>Loại Vé</th>
                            <th>Mức Giá</th>
                            <th>Độ Tuổi Khuyến Nghị</th>
                            <th>Khác / Quy định</th>
                            <th>Trạng Thái</th>
                            <th>Hành Động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pricings.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="text-muted">Chưa có dữ liệu</td>
                            </tr>
                        ) : (
                            pricings.map((pricing) => (
                                <tr key={pricing.id}>
                                    <td>{pricing.id}</td>
                                    <td className="fw-bold">{pricing.type}</td>
                                    <td className="text-danger fw-bold">{formatVND(pricing.price)}</td>
                                    <td>{pricing.ageGroup || "-"}</td>
                                    <td>{pricing.rules || "-"}</td>
                                    <td>
                                        <Button
                                            variant={pricing.status?.toLowerCase() === "active" ? "success" : "secondary"}
                                            size="sm"
                                        >
                                            {pricing.status?.toLowerCase() === "active" ? "Hoạt động" : "Vô hiệu"}
                                        </Button>
                                    </td>
                                    <td>
                                        <Button
                                            variant="warning"
                                            size="sm"
                                            className="me-2"
                                            onClick={() => {
                                                setCurrentPricing({ ...pricing });
                                                setShowModal(true);
                                                setValidationError("");
                                            }}
                                        >
                                            <i className="bi bi-pencil-square"></i>
                                        </Button>
                                        <Button
                                            variant={pricing.status?.toLowerCase() === "active" ? "danger" : "success"}
                                            size="sm"
                                            title={pricing.status?.toLowerCase() === "active" ? "Xóa" : "Khôi phục"}
                                            onClick={() => {
                                                if (pricing.status?.toLowerCase() === "active") {
                                                    setDeleteId(pricing.id);
                                                    setShowDeleteModal(true);
                                                } else {
                                                    toggleStatus(pricing);
                                                }
                                            }}
                                        >
                                            <i
                                                className={
                                                    pricing.status?.toLowerCase() === "active"
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

            {/* --- ADD / EDIT MODAL --- */}
            <Modal show={showModal} onHide={handleCancel} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{currentPricing ? "Sửa Giá Vé" : "Thêm Giá Vé"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>* Loại Vé (VIP, STANDARD, COUPLE...)</Form.Label>
                            <Form.Control
                                type="text"
                                name="type"
                                placeholder="VD: VIP"
                                value={getValue("type")}
                                onChange={handleChange}
                                isInvalid={validationError && !getValue("type")?.toString().trim()}
                                style={{ textTransform: "uppercase" }}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>* Mức Giá (VNĐ)</Form.Label>
                            <Form.Control
                                type="number"
                                name="price"
                                placeholder="VD: 55000"
                                value={getValue("price")}
                                onChange={handleChange}
                                isInvalid={validationError && (!getValue("price") || getValue("price") <= 0)}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Độ tuổi khuyến nghị / Giới hạn</Form.Label>
                            <Form.Control
                                type="text"
                                name="ageGroup"
                                placeholder="VD: Người lớn, Sinh viên, Trẻ em..."
                                value={getValue("ageGroup")}
                                onChange={handleChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Ghi chú / Quy định</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                name="rules"
                                placeholder="VD: Yêu cầu xuất trình thẻ HSSV..."
                                value={getValue("rules")}
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
                        onClick={currentPricing ? editPricing : addPricing}
                        disabled={loading}
                    >
                        {loading ? "Đang lưu..." : "Lưu"}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* --- DELETE MODAL --- */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Xác Nhận Xóa</Modal.Title>
                </Modal.Header>
                <Modal.Body>Bạn có chắc chắn muốn ngừng hoạt động loại giá vé này?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)} disabled={loading}>
                        Hủy
                    </Button>
                    <Button variant="danger" onClick={confirmDelete} disabled={loading}>
                        {loading ? "Đang xóa..." : "Xóa"}
                    </Button>
                </Modal.Footer>
            </Modal>

        </Container>
    );
};

export default TicketPricingManager;
