import React, { useEffect, useState } from "react";
import { Table, Button, Form, Modal, Container, Alert, Row, Col } from "react-bootstrap";
import cinemaService from "../../services/cinemaService";
import screenService from "../../services/screenService";
import seatService from "../../services/seatService";
import "../../CSS/AdminPages.css";

const EMPTY_SEAT_FORM = { name: "", type: "STANDARD", status: "ACTIVE" };
const EMPTY_GENERATE_FORM = { rowCount: 10, columnCount: 15, defaultType: "STANDARD" };

const SeatsManager = () => {
    const [cinemas, setCinemas] = useState([]);
    const [selectedCinemaId, setSelectedCinemaId] = useState("");

    const [screens, setScreens] = useState([]);
    const [selectedScreenId, setSelectedScreenId] = useState("");

    const [seats, setSeats] = useState([]);
    const [currentSeat, setCurrentSeat] = useState(null);

    const [seatForm, setSeatForm] = useState(EMPTY_SEAT_FORM);
    const [generateForm, setGenerateForm] = useState(EMPTY_GENERATE_FORM);

    const [showSeatModal, setShowSeatModal] = useState(false);
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [deleteSeatId, setDeleteSeatId] = useState(null);

    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [validationError, setValidationError] = useState("");
    const [loading, setLoading] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const PAGE_SIZE = 10;

    // 1. Fetch Cinemas on mount
    useEffect(() => {
        fetchCinemas();
    }, []);

    // 2. Fetch Screens when Cinema changes
    useEffect(() => {
        if (selectedCinemaId) {
            fetchScreens();
        } else {
            setScreens([]);
            setSelectedScreenId("");
        }
    }, [selectedCinemaId]);

    // 3. Fetch Seats when Screen changes
    useEffect(() => {
        if (selectedScreenId) {
            setCurrentPage(0);
            fetchSeats(0);
        } else {
            setSeats([]);
            setTotalPages(0);
            setTotalElements(0);
        }
    }, [selectedScreenId]);

    const fetchCinemas = async () => {
        try {
            const res = await cinemaService.getAll();
            const loadedCinemas = res.data || [];
            setCinemas(loadedCinemas);
            if (loadedCinemas.length > 0) {
                setSelectedCinemaId(loadedCinemas[0].id.toString());
            }
        } catch (err) {
            setError("Không thể tải danh sách rạp!");
        }
    };

    const fetchScreens = async () => {
        try {
            setLoading(true);
            const res = await screenService.getAllByCinemaId(selectedCinemaId);
            const loadedScreens = res.data || [];
            setScreens(loadedScreens);
            if (loadedScreens.length > 0) {
                setSelectedScreenId(loadedScreens[0].id.toString());
            } else {
                setSelectedScreenId("");
            }
        } catch (err) {
            setError("Không thể tải danh sách phòng chiếu!");
        } finally {
            setLoading(false);
        }
    };

    const fetchSeats = async (page) => {
        try {
            setLoading(true);
            const pageToFetch = page !== undefined ? page : currentPage;
            const res = await seatService.getAllByScreenIdPaged(selectedScreenId, pageToFetch, PAGE_SIZE);
            const pageData = res.data || {};
            setSeats(pageData.content || []);
            setTotalPages(pageData.totalPages || 0);
            setTotalElements(pageData.totalElements || 0);
            setCurrentPage(pageData.number || 0);
        } catch (err) {
            setError("Không thể tải danh sách ghế!");
        } finally {
            setLoading(false);
        }
    };

    // --- Handlers for Seat Form (Single) ---
    const handleSeatChange = (e) => {
        const { name, value } = e.target;
        if (currentSeat) {
            setCurrentSeat({ ...currentSeat, [name]: value });
        } else {
            setSeatForm({ ...seatForm, [name]: value });
        }
        setValidationError("");
    };

    const validateSeat = (data, excludeId = null) => {
        if (!data.name?.trim()) return "Tên ghế không được để trống (VD: A1, B2)!";
        const isDuplicate = seats.some(
            (s) =>
                s.name.toLowerCase() === data.name.trim().toLowerCase() &&
                s.id !== excludeId
        );
        if (isDuplicate) return "Tên ghế này đã tồn tại trong phòng chiếu!";
        return null;
    };

    const saveSeat = async () => {
        const dataToValidate = currentSeat || seatForm;
        const err = validateSeat(dataToValidate, currentSeat?.id);
        if (err) { setValidationError(err); return; }

        try {
            setLoading(true);
            if (currentSeat) {
                await seatService.update(currentSeat.id, {
                    name: currentSeat.name.trim().toUpperCase(),
                    type: currentSeat.type,
                    status: currentSeat.status,
                    screenId: parseInt(selectedScreenId, 10)
                });
                setSuccess("Cập nhật ghế thành công!");
            } else {
                await seatService.create({
                    name: seatForm.name.trim().toUpperCase(),
                    type: seatForm.type,
                    status: seatForm.status,
                    screenId: parseInt(selectedScreenId, 10)
                });
                setSuccess("Thêm ghế thành công!");
            }
            closeModal();
            await fetchSeats();
        } catch (err) {
            setError(err?.response?.data?.message || "Lưu ghế thất bại!");
        } finally {
            setLoading(false);
        }
    };

    // --- Handlers for Generate Form ---
    const handleGenerateChange = (e) => {
        const { name, value } = e.target;
        setGenerateForm({ ...generateForm, [name]: value });
        setValidationError("");
    };

    const generateSeats = async () => {
        if (!generateForm.rowCount || generateForm.rowCount < 1 || generateForm.rowCount > 26) {
            setValidationError("Số hàng phải từ 1 đến 26!");
            return;
        }
        if (!generateForm.columnCount || generateForm.columnCount < 1) {
            setValidationError("Số cột phải lớn hơn 0!");
            return;
        }

        try {
            setLoading(true);
            await seatService.generateSeats({
                screenId: parseInt(selectedScreenId, 10),
                rowCount: parseInt(generateForm.rowCount, 10),
                columnCount: parseInt(generateForm.columnCount, 10),
                defaultType: generateForm.defaultType
            });
            setSuccess("Khởi tạo sơ đồ ghế thành công!");
            closeModal();
            await fetchSeats();
        } catch (err) {
            setError(err?.response?.data?.message || "Khởi tạo ghế thất bại!");
        } finally {
            setLoading(false);
        }
    };

    // --- Other Actions ---
    const toggleStatus = async (seat) => {
        try {
            const isActive = seat.status?.toLowerCase() === "active";
            if (isActive) {
                await seatService.delete(seat.id);
            } else {
                await seatService.restore(seat.id);
            }
            setSuccess("Cập nhật trạng thái ghế thành công!");
            setError(null);
            await fetchSeats();
        } catch (err) {
            setError(err?.response?.data?.message || "Cập nhật trạng thái thất bại!");
        }
    };

    const confirmDelete = async () => {
        try {
            setLoading(true);
            await seatService.delete(deleteSeatId);
            setSuccess("Xóa ghế thành công!");
            setError(null);
            setShowDeleteModal(false);
            setDeleteSeatId(null);
            await fetchSeats();
        } catch (err) {
            setError(err?.response?.data?.message || "Xóa ghế thất bại!");
        } finally {
            setLoading(false);
        }
    };

    const closeModal = () => {
        setShowSeatModal(false);
        setShowGenerateModal(false);
        setCurrentSeat(null);
        setSeatForm(EMPTY_SEAT_FORM);
        setGenerateForm(EMPTY_GENERATE_FORM);
        setValidationError("");
    };

    const getSeatFormValue = (field) =>
        currentSeat ? currentSeat[field] ?? "" : seatForm[field] ?? "";

    return (
        <Container>
            <h2 className="my-4 text-center">Quản Lý Ghế Ngồi</h2>

            {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
            {success && <Alert variant="success" onClose={() => setSuccess(null)} dismissible>{success}</Alert>}

            <Row className="mb-4">
                <Col md={6}>
                    <Form.Group controlId="selectCinema">
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
                </Col>
                <Col md={6}>
                    <Form.Group controlId="selectScreen">
                        <Form.Label className="fw-bold">Chọn Phòng Chiếu:</Form.Label>
                        <Form.Select
                            value={selectedScreenId}
                            onChange={(e) => setSelectedScreenId(e.target.value)}
                            disabled={screens.length === 0}
                        >
                            <option value="">{screens.length > 0 ? "-- Chọn phòng chiếu --" : "Không có phòng chiếu"}</option>
                            {screens.map(screen => (
                                <option key={screen.id} value={screen.id}>{screen.name} (Sức chứa: {screen.seatingCapacity})</option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                </Col>
            </Row>

            <div className="d-flex mb-3 gap-2">
                <Button
                    variant="primary"
                    disabled={!selectedScreenId}
                    onClick={() => {
                        setCurrentSeat(null);
                        setSeatForm(EMPTY_SEAT_FORM);
                        setValidationError("");
                        setShowSeatModal(true);
                    }}
                >
                    <i className="bi bi-plus-circle"></i> Thêm 1 Ghế Lẻ
                </Button>
                <Button
                    variant="info"
                    disabled={!selectedScreenId || seats.length > 0}
                    onClick={() => {
                        setGenerateForm(EMPTY_GENERATE_FORM);
                        setValidationError("");
                        setShowGenerateModal(true);
                    }}
                    title={seats.length > 0 ? "Chỉ sinh ghế khi phòng chưa có ghế nào" : ""}
                >
                    <i className="bi bi-grid-3x3"></i> Sinh Ghế Tự Động
                </Button>
            </div>

            {loading ? (
                <div className="text-center my-4">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Đang tải...</span>
                    </div>
                </div>
            ) : (
                <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
                    <Table striped bordered hover responsive className="text-center">
                        <thead className="table-dark" style={{ position: "sticky", top: 0, zIndex: 1 }}>
                            <tr>
                                <th>STT</th>
                                <th>Tên Ghế</th>
                                <th>Loại Ghế</th>
                                <th>Trạng Thái</th>
                                <th>Hành Động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {seats.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-muted">Chưa có ghế nào trong phòng này</td>
                                </tr>
                            ) : (
                                seats.map((seat, index) => (
                                    <tr key={seat.id}>
                                        <td>{currentPage * PAGE_SIZE + index + 1}</td>
                                        <td className="fw-bold">{seat.name}</td>
                                        <td>{seat.type}</td>
                                        <td>
                                            <Button
                                                variant={seat.status?.toLowerCase() === "active" ? "success" : "secondary"}
                                                size="sm"
                                            >
                                                {seat.status?.toLowerCase() === "active" ? "Hoạt động" : "Vô hiệu"}
                                            </Button>
                                        </td>
                                        <td>
                                            <Button
                                                variant="warning"
                                                size="sm"
                                                className="me-2"
                                                onClick={() => {
                                                    setCurrentSeat({ ...seat });
                                                    setValidationError("");
                                                    setShowSeatModal(true);
                                                }}
                                            >
                                                <i className="bi bi-pencil-square"></i>
                                            </Button>
                                            <Button
                                                variant={seat.status?.toLowerCase() === "active" ? "danger" : "success"}
                                                size="sm"
                                                title={seat.status?.toLowerCase() === "active" ? "Xóa" : "Khôi phục"}
                                                onClick={() => {
                                                    if (seat.status?.toLowerCase() === "active") {
                                                        setDeleteSeatId(seat.id);
                                                        setShowDeleteModal(true);
                                                    } else {
                                                        toggleStatus(seat);
                                                    }
                                                }}
                                            >
                                                <i
                                                    className={
                                                        seat.status?.toLowerCase() === "active"
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
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center mt-3">
                    <span className="text-muted" style={{ fontSize: '14px' }}>
                        Hiển thị {currentPage * PAGE_SIZE + 1}–{Math.min((currentPage + 1) * PAGE_SIZE, totalElements)} / {totalElements} ghế
                    </span>
                    <div className="d-flex gap-1">
                        <Button
                            variant="outline-dark"
                            size="sm"
                            disabled={currentPage === 0}
                            onClick={() => { setCurrentPage(0); fetchSeats(0); }}
                        >
                            «
                        </Button>
                        <Button
                            variant="outline-dark"
                            size="sm"
                            disabled={currentPage === 0}
                            onClick={() => { const p = currentPage - 1; setCurrentPage(p); fetchSeats(p); }}
                        >
                            ‹
                        </Button>
                        {Array.from({ length: totalPages }, (_, i) => i)
                            .filter(i => Math.abs(i - currentPage) <= 2)
                            .map(i => (
                                <Button
                                    key={i}
                                    variant={i === currentPage ? "dark" : "outline-dark"}
                                    size="sm"
                                    onClick={() => { setCurrentPage(i); fetchSeats(i); }}
                                >
                                    {i + 1}
                                </Button>
                            ))}
                        <Button
                            variant="outline-dark"
                            size="sm"
                            disabled={currentPage >= totalPages - 1}
                            onClick={() => { const p = currentPage + 1; setCurrentPage(p); fetchSeats(p); }}
                        >
                            ›
                        </Button>
                        <Button
                            variant="outline-dark"
                            size="sm"
                            disabled={currentPage >= totalPages - 1}
                            onClick={() => { const p = totalPages - 1; setCurrentPage(p); fetchSeats(p); }}
                        >
                            »
                        </Button>
                    </div>
                </div>
            )}

            {/* --- ADD / EDIT SEAT MODAL --- */}
            <Modal show={showSeatModal} onHide={closeModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{currentSeat ? "Sửa Ghế" : "Thêm Ghế"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3" controlId="seatName">
                            <Form.Label>* Tên Ghế (VD: A1, B2)</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={getSeatFormValue("name")}
                                onChange={handleSeatChange}
                                isInvalid={validationError && !getSeatFormValue("name").trim()}
                                style={{ textTransform: "uppercase" }}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="seatType">
                            <Form.Label>Loại Ghế</Form.Label>
                            <Form.Select
                                name="type"
                                value={getSeatFormValue("type")}
                                onChange={handleSeatChange}
                            >
                                <option value="STANDARD">Thường (STANDARD)</option>
                                <option value="VIP">VIP</option>
                                <option value="COUPLE">Đôi (COUPLE)</option>
                            </Form.Select>
                        </Form.Group>

                        {validationError && <div className="text-danger small">{validationError}</div>}
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeModal} disabled={loading}>Hủy</Button>
                    <Button variant="success" onClick={saveSeat} disabled={loading}>
                        {loading ? "Đang lưu..." : "Lưu"}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* --- GENERATE SEATS MODAL --- */}
            <Modal show={showGenerateModal} onHide={closeModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Sinh Ghế Tự Động</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="text-muted small">
                        Phòng chiếu hiện tại có sức chứa <strong>{screens.find(s => s.id.toString() === selectedScreenId)?.seatingCapacity || 0} ghế</strong>. Chọn số hàng và số cột sao cho (Số hàng x Số cột) không vượt quá sức chứa này.
                    </p>
                    <Form>
                        <Row>
                            <Col>
                                <Form.Group className="mb-3">
                                    <Form.Label>Số Hàng (1 - 26, tương ứng A-Z)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="rowCount"
                                        min={1} max={26}
                                        value={generateForm.rowCount}
                                        onChange={handleGenerateChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group className="mb-3">
                                    <Form.Label>Số Cột (Số ghế mỗi hàng)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="columnCount"
                                        min={1}
                                        value={generateForm.columnCount}
                                        onChange={handleGenerateChange}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label>Loại Ghế Mặc Định</Form.Label>
                            <Form.Select
                                name="defaultType"
                                value={generateForm.defaultType}
                                onChange={handleGenerateChange}
                            >
                                <option value="STANDARD">Thường (STANDARD)</option>
                                <option value="VIP">VIP</option>
                            </Form.Select>
                        </Form.Group>

                        {validationError && <div className="text-danger small">{validationError}</div>}
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeModal} disabled={loading}>Hủy</Button>
                    <Button variant="info" onClick={generateSeats} disabled={loading}>
                        {loading ? "Đang sinh..." : "Khởi tạo"}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* --- DELETE CONFIRM MODAL --- */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Xác Nhận Xóa</Modal.Title>
                </Modal.Header>
                <Modal.Body>Bạn có chắc chắn muốn xóa ghế này?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)} disabled={loading}>Hủy</Button>
                    <Button variant="danger" onClick={confirmDelete} disabled={loading}>
                        {loading ? "Đang xóa..." : "Xóa"}
                    </Button>
                </Modal.Footer>
            </Modal>

        </Container>
    );
};

export default SeatsManager;
