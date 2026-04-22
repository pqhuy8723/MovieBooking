import React, { useEffect, useState } from "react";
import { Table, Button, Form, Modal, Container, Alert, Row, Col, Card } from "react-bootstrap";
import movieService from "../../services/movieService";
import genreService from "../../services/genreService";
import actorService from "../../services/actorService";
import directorService from "../../services/directorService";
import languageService from "../../services/languageService";
import movieTypeService from "../../services/movieTypeService";
import showtimeService from "../../services/showtimeService";
import cinemaService from "../../services/cinemaService";
import screenService from "../../services/screenService";
import "../../CSS/AdminPages.css";

const EMPTY_MOVIE_FORM = {
    title: "",
    description: "",
    duration: "",
    poster: "",
    banner: "",
    videoUrl: "",
    releaseDate: "",
    rating: "",
    ageRating: "P",
    country: "",
    status: "ACTIVE",
    genreIds: [],
    actorIds: [],
    directorIds: [],
    languageId: "",
    movieTypeId: ""
};

const MoviesManager = () => {
    const [movies, setMovies] = useState([]);
    const [currentMovie, setCurrentMovie] = useState(null);

    // Options
    const [genres, setGenres] = useState([]);
    const [actors, setActors] = useState([]);
    const [directors, setDirectors] = useState([]);
    const [languages, setLanguages] = useState([]);
    const [movieTypes, setMovieTypes] = useState([]);
    const [cinemas, setCinemas] = useState([]);

    // Forms
    const [formData, setFormData] = useState(EMPTY_MOVIE_FORM);
    const [showtimesToAdd, setShowtimesToAdd] = useState([]);
    const [existingShowtimes, setExistingShowtimes] = useState([]);
    const [loadingShowtimes, setLoadingShowtimes] = useState(false);
    const [editingShowtime, setEditingShowtime] = useState(null); // { id, date, startTime, endTime, price, screenId, cinemaId }
    const [savingShowtime, setSavingShowtime] = useState(false);

    const [screensMap, setScreensMap] = useState({});

    // UI state
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [validationError, setValidationError] = useState("");
    const [loading, setLoading] = useState(false);
    const [savingTarget, setSavingTarget] = useState(false);

    useEffect(() => {
        fetchMovies();
        loadDependencies();
    }, []);

    const loadDependencies = async () => {
        try {
            const [resGenres, resActors, resDirectors, resLangs, resTypes, resCinemas] = await Promise.all([
                genreService.getAllActive(),
                actorService.getAllActive(),
                directorService.getAllActive(),
                languageService.getAllActive(),
                movieTypeService.getAllActive(),
                cinemaService.getAll()
            ]);
            setGenres(resGenres.data || []);
            setActors(resActors.data || []);
            setDirectors(resDirectors.data || []);
            setLanguages(resLangs.data || []);
            setMovieTypes(resTypes.data || []);
            setCinemas(resCinemas.data || []);
        } catch (err) {
            console.error("Error loading dependencies for movie form:", err);
        }
    };

    const fetchMovies = async () => {
        try {
            setLoading(true);
            const res = await movieService.getAll();
            setMovies(res.data || []);
        } catch (err) {
            setError("Không thể tải danh sách phim!");
        } finally {
            setLoading(false);
        }
    };

    const loadScreensForCinema = async (cinemaId) => {
        if (!cinemaId || screensMap[cinemaId]) return;
        try {
            const res = await screenService.getAllByCinemaId(cinemaId);
            setScreensMap(prev => ({ ...prev, [cinemaId]: res.data || [] }));
        } catch (err) {
            console.error(err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (currentMovie) {
            setCurrentMovie({ ...currentMovie, [name]: value });
        } else {
            setFormData({ ...formData, [name]: value });
        }
        setValidationError("");
    };

    const handleCheckboxChange = (e, fieldName) => {
        const { value, checked } = e.target;
        const valObj = parseInt(value, 10);

        if (currentMovie) {
            const list = [...(currentMovie[fieldName] || [])];
            setCurrentMovie({
                ...currentMovie,
                [fieldName]: checked ? [...list, valObj] : list.filter(id => id !== valObj)
            });
        } else {
            const list = [...(formData[fieldName] || [])];
            setFormData({
                ...formData,
                [fieldName]: checked ? [...list, valObj] : list.filter(id => id !== valObj)
            });
        }
    };

    // --- SHOWTIME HANDLERS ---
    // Tính endTime tự động từ startTime + duration phim
    const calcEndTime = (startTime, durationMinutes) => {
        if (!startTime || !durationMinutes) return "";
        const [h, m] = startTime.split(":").map(Number);
        const totalMinutes = h * 60 + m + Number(durationMinutes);
        const endH = Math.floor(totalMinutes / 60) % 24;
        const endM = totalMinutes % 60;
        return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
    };

    const addShowtimeRow = () => {
        setShowtimesToAdd([...showtimesToAdd, {
            cinemaId: "", screenId: "", date: "", startTime: "", endTime: "", price: ""
        }]);
    };

    const removeShowtimeRow = (index) => {
        const newList = [...showtimesToAdd];
        newList.splice(index, 1);
        setShowtimesToAdd(newList);
    };

    const handleShowtimeChange = (index, field, value) => {
        const newList = [...showtimesToAdd];
        newList[index][field] = value;
        if (field === "cinemaId") {
            newList[index].screenId = "";
            loadScreensForCinema(value);
        }
        // Auto-tính endTime khi nhập startTime
        if (field === "startTime") {
            const duration = currentMovie ? currentMovie.duration : formData.duration;
            newList[index].endTime = calcEndTime(value, duration);
        }
        setShowtimesToAdd(newList);
    };

    // Handlers edit existing showtime
    const startEditShowtime = (st) => {
        setEditingShowtime({
            id: st.id,
            date: st.date,
            startTime: st.startTime?.slice(0, 5) || "",
            endTime: st.endTime?.slice(0, 5) || "",
            price: st.price,
            screenId: st.screenId,
            cinemaId: st.cinemaId
        });
        // Load screens cho cinema nếu chưa có
        if (st.cinemaId) loadScreensForCinema(st.cinemaId);
    };

    const cancelEditShowtime = () => setEditingShowtime(null);

    const handleEditShowtimeChange = (field, value) => {
        setEditingShowtime(prev => {
            const updated = { ...prev, [field]: value };
            if (field === "cinemaId") {
                updated.screenId = "";
                loadScreensForCinema(value);
            }
            // Auto-tính endTime khi nhập startTime trong edit
            if (field === "startTime") {
                const duration = currentMovie ? currentMovie.duration : formData.duration;
                updated.endTime = calcEndTime(value, duration);
            }
            return updated;
        });
    };

    const saveEditShowtime = async () => {
        if (!editingShowtime.screenId || !editingShowtime.date || !editingShowtime.startTime || !editingShowtime.endTime || !editingShowtime.price) {
            alert("Vui lòng điền đầy đủ thông tin suất chiếu!");
            return;
        }
        try {
            setSavingShowtime(true);
            await showtimeService.update(editingShowtime.id, {
                date: editingShowtime.date,
                startTime: editingShowtime.startTime + ":00",
                endTime: editingShowtime.endTime + ":00",
                price: parseFloat(editingShowtime.price),
                movieId: currentMovie.id,
                screenId: parseInt(editingShowtime.screenId),
                status: "ACTIVE"
            });
            setSuccess("Cập nhật suất chiếu thành công!");
            setEditingShowtime(null);
            await loadExistingShowtimes(currentMovie.id);
        } catch (err) {
            setError(err?.response?.data?.message || "Cập nhật suất chiếu thất bại!");
        } finally {
            setSavingShowtime(false);
        }
    };

    // --- CRUD ACTIONS ---
    const validate = (data) => {
        if (!data.title?.trim()) return "Tên phim không được để trống!";
        if (!data.duration || data.duration <= 0) return "Thời lượng phải lớn hơn 0!";
        if (!data.releaseDate) return "Vui lòng chọn ngày khởi chiếu!";
        if (!data.languageId) return "Vui lòng chọn ngôn ngữ!";
        if (!data.movieTypeId) return "Vui lòng chọn loại phim (Định dạng)!";
        if (data.genreIds.length === 0) return "Vui lòng chọn ít nhất 1 thể loại!";
        if (data.actorIds.length === 0) return "Vui lòng chọn ít nhất 1 diễn viên!";
        if (data.directorIds.length === 0) return "Vui lòng chọn ít nhất 1 đạo diễn!";

        // Validate showtimes
        if (!currentMovie) {
            for (let i = 0; i < showtimesToAdd.length; i++) {
                const st = showtimesToAdd[i];
                if (!st.screenId || !st.date || !st.startTime || !st.endTime || !st.price) {
                    return `Suất chiếu số ${i + 1} thiếu thông tin (Phòng, Ngày, Giờ hoặc Giá)!`;
                }
            }
        }
        return null;
    };

    const saveMovie = async () => {
        const dataToValidate = currentMovie || formData;
        const err = validate(dataToValidate);
        if (err) { setValidationError(err); return; }

        try {
            setSavingTarget(true);
            if (currentMovie) {
                await movieService.update(currentMovie.id, {
                    ...currentMovie,
                    duration: parseInt(currentMovie.duration),
                    rating: parseFloat(currentMovie.rating || 0)
                });
                // Lưu thêm lịch mới nếu có
                if (showtimesToAdd.length > 0) {
                    for (const st of showtimesToAdd) {
                        await showtimeService.create({
                            date: st.date,
                            startTime: st.startTime + ":00",
                            endTime: st.endTime + ":00",
                            price: parseFloat(st.price),
                            movieId: currentMovie.id,
                            screenId: parseInt(st.screenId),
                            status: "ACTIVE"
                        });
                    }
                    setSuccess(`Cập nhật phim và thêm ${showtimesToAdd.length} suất chiếu mới thành công!`);
                } else {
                    setSuccess("Cập nhật phim thành công!");
                }
            } else {
                // Create mode
                const movieRes = await movieService.create({
                    ...formData,
                    duration: parseInt(formData.duration),
                    rating: parseFloat(formData.rating || 0)
                });
                const newMovieId = movieRes.data?.id;

                if (newMovieId && showtimesToAdd.length > 0) {
                    for (const st of showtimesToAdd) {
                        await showtimeService.create({
                            date: st.date,
                            startTime: st.startTime + ":00",
                            endTime: st.endTime + ":00",
                            price: parseFloat(st.price),
                            movieId: newMovieId,
                            screenId: parseInt(st.screenId),
                            status: "ACTIVE"
                        });
                    }
                    setSuccess(`Tạo phim và ${showtimesToAdd.length} suất chiếu thành công!`);
                } else {
                    setSuccess("Thêm phim thành công!");
                }
            }
            closeModal();
            await fetchMovies();
        } catch (err) {
            setError(err?.response?.data?.message || "Lưu phim thất bại!");
        } finally {
            setSavingTarget(false);
        }
    };

    const toggleStatus = async (movie) => {
        try {
            const isActive = movie.status?.toUpperCase() === "ACTIVE";
            if (isActive) {
                await movieService.delete(movie.id);
            } else {

                setError("Chức năng khôi phục (restore) phụ thuộc API update hoặc restore. Đang xử lý xoá...");
                await movieService.delete(movie.id);
            }
            setSuccess("Cập nhật trạng thái thành công!");
            setError(null);
            await fetchMovies();
        } catch (err) {
            setError(err?.response?.data?.message || "Cập nhật trạng thái thất bại!");
        }
    };

    const confirmDelete = async () => {
        try {
            setSavingTarget(true);
            await movieService.delete(deleteId);
            setSuccess("Xóa/Ngừng chiếu phim thành công!");
            setError(null);
            setShowDeleteModal(false);
            setDeleteId(null);
            await fetchMovies();
        } catch (err) {
            setError(err?.response?.data?.message || "Xóa thất bại!");
        } finally {
            setSavingTarget(false);
        }
    };

    const openAddModal = () => {
        setCurrentMovie(null);
        setFormData(EMPTY_MOVIE_FORM);
        setShowtimesToAdd([]);
        setValidationError("");
        setShowModal(true);
    };

    const loadExistingShowtimes = async (movieId) => {
        try {
            setLoadingShowtimes(true);
            const res = await showtimeService.getByMovieId(movieId);
            setExistingShowtimes(res.data || []);
        } catch (err) {
            console.error("Không thể tải lịch chiếu:", err);
            setExistingShowtimes([]);
        } finally {
            setLoadingShowtimes(false);
        }
    };

    const deleteExistingShowtime = async (showtimeId) => {
        if (!window.confirm("Bạn có chắc muốn huỷ suất chiếu này?")) return;
        try {
            await showtimeService.delete(showtimeId);
            setExistingShowtimes(prev => prev.filter(st => st.id !== showtimeId));
            setSuccess("Đã huỷ suất chiếu!");
        } catch (err) {
            setError("Không thể huỷ suất chiếu!");
        }
    };

    const openEditModal = (mov) => {
        setCurrentMovie({
            ...mov,
            genreIds: mov.genres?.map(g => g.id) || [],
            actorIds: mov.actors?.map(a => a.id) || [],
            directorIds: mov.directors?.map(d => d.id) || [],
            languageId: mov.language?.id != null ? String(mov.language.id) : "",
            movieTypeId: mov.movieType?.id != null ? String(mov.movieType.id) : ""
        });
        setShowtimesToAdd([]);
        setExistingShowtimes([]);
        setValidationError("");
        setShowModal(true);
        loadExistingShowtimes(mov.id);
    };

    const closeModal = () => {
        setShowModal(false);
        setCurrentMovie(null);
        setExistingShowtimes([]);
        setShowtimesToAdd([]);
    };

    const getValue = (field) => currentMovie ? currentMovie[field] ?? "" : formData[field] ?? "";

    const getChecks = (field) => currentMovie ? currentMovie[field] || [] : formData[field] || [];

    return (
        <Container fluid>
            <h2 className="my-4 text-center">Quản Lý Phim & Suất Chiếu</h2>

            {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
            {success && <Alert variant="success" onClose={() => setSuccess(null)} dismissible>{success}</Alert>}

            <Button variant="primary" className="mb-3" onClick={openAddModal}>
                <i className="bi bi-film"></i> Thêm Phim Mới
            </Button>

            {loading && !savingTarget ? (
                <div className="text-center my-4">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Đang tải...</span>
                    </div>
                </div>
            ) : (
                <Table striped bordered hover responsive className="text-center align-middle" style={{ fontSize: "0.9rem" }}>
                    <thead className="table-dark">
                        <tr>
                            <th>ID</th>
                            <th>Poster</th>
                            <th>Tên Phim</th>
                            <th>Định Dạng</th>
                            <th>Thời lượng</th>
                            <th>Khởi Chiếu</th>
                            <th>Trạng Thái</th>
                            <th>Hành Động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {movies.length === 0 ? (
                            <tr><td colSpan={8} className="text-muted">Chưa có dữ liệu phim</td></tr>
                        ) : (
                            movies.map((m) => (
                                <tr key={m.id}>
                                    <td>{m.id}</td>
                                    <td>
                                        {m.poster ? (
                                            <img src={m.poster} alt={m.title} style={{ width: "50px", height: "70px", objectFit: "cover" }} />
                                        ) : (
                                            <div className="bg-secondary text-white d-flex align-items-center justify-content-center" style={{ width: "50px", height: "70px", fontSize: "10px" }}>No IMG</div>
                                        )}
                                    </td>
                                    <td className="fw-bold">{m.title}</td>
                                    <td>{m.movieType?.name} ({m.language?.name})</td>
                                    <td>{m.duration} phút</td>
                                    <td>{m.releaseDate}</td>
                                    <td>
                                        <span className={`badge ${m.status?.toUpperCase() === 'ACTIVE' ? 'bg-success' : 'bg-secondary'}`}>
                                            {m.status?.toUpperCase() === 'ACTIVE' ? 'Đang Chiếu' : 'Ngừng Chiếu'}
                                        </span>
                                    </td>
                                    <td>
                                        <Button variant="warning" size="sm" className="me-2" onClick={() => openEditModal(m)}>
                                            <i className="bi bi-pencil-square"></i> Sửa
                                        </Button>
                                        <Button variant="danger" size="sm" onClick={() => {
                                            setDeleteId(m.id);
                                            setShowDeleteModal(true);
                                        }}
                                        >
                                            <i className="bi bi-trash"></i> Xoá
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            )}

            <Modal show={showModal} onHide={closeModal} size="xl" backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title>{currentMovie ? "Sửa Phim" : "Thêm Phim Mới & Khởi Tạo Suất Chiếu"}</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ maxHeight: '75vh', overflowY: 'auto' }}>
                    <Form>
                        <h5 className="mb-3 text-primary border-bottom pb-2">I. Thông Tin Cơ Bản</h5>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>* Tên Phim</Form.Label>
                                    <Form.Control type="text" name="title" value={getValue("title")} onChange={handleChange} />
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group className="mb-3">
                                    <Form.Label>* Khởi Chiếu</Form.Label>
                                    <Form.Control type="date" name="releaseDate" value={getValue("releaseDate")} onChange={handleChange} />
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group className="mb-3">
                                    <Form.Label>* Thời lượng (phút)</Form.Label>
                                    <Form.Control type="number" name="duration" value={getValue("duration")} onChange={handleChange} min={1} />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Mô tả Phim</Form.Label>
                                    <Form.Control as="textarea" rows={3} name="description" value={getValue("description")} onChange={handleChange} />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>URL Poster (Ảnh dọc)</Form.Label>
                                    <Form.Control type="text" name="poster" value={getValue("poster")} onChange={handleChange} placeholder="https://..." />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>URL Banner (Ảnh ngang)</Form.Label>
                                    <Form.Control type="text" name="banner" value={getValue("banner")} onChange={handleChange} placeholder="https://..." />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Video Trailer URL (Youtube embed)</Form.Label>
                                    <Form.Control type="text" name="videoUrl" value={getValue("videoUrl")} onChange={handleChange} placeholder="https://youtube.com/..." />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Quốc Gia</Form.Label>
                                    <Form.Control type="text" name="country" value={getValue("country")} onChange={handleChange} />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Phân loại độ tuổi</Form.Label>
                                    <Form.Select name="ageRating" value={getValue("ageRating")} onChange={handleChange}>
                                        <option value="P">P - Phổ biến</option>
                                        <option value="K">K - Trẻ em xem có giám hộ</option>
                                        <option value="T13">T13 - Cấm trẻ dưới 13</option>
                                        <option value="T16">T16 - Cấm trẻ dưới 16</option>
                                        <option value="T18">T18 - Cấm trẻ dưới 18</option>
                                        <option value="C">C - Cấm chiếu</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>* Ngôn Ngữ</Form.Label>
                                    <Form.Select name="languageId" value={getValue("languageId")} onChange={handleChange}>
                                        <option value="">-- Chọn ngôn ngữ --</option>
                                        {languages.map(l => <option key={l.id} value={String(l.id)}>{l.name}</option>)}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>* Định Dạng (Loại Phim)</Form.Label>
                                    <Form.Select name="movieTypeId" value={getValue("movieTypeId")} onChange={handleChange}>
                                        <option value="">-- Chọn định dạng --</option>
                                        {movieTypes.map(t => <option key={t.id} value={String(t.id)}>{t.name}</option>)}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        <h5 className="mt-4 mb-3 text-primary border-bottom pb-2">II. Thông Số Liên Quan</h5>
                        <Row>
                            <Col md={4}>
                                <Form.Label>* Thể Loại (Chọn Nhiều)</Form.Label>
                                <div className="p-2 border rounded" style={{ height: "150px", overflowY: "auto" }}>
                                    {genres.map(g => (
                                        <Form.Check
                                            key={g.id} type="checkbox" label={g.name} value={g.id}
                                            checked={getChecks("genreIds").includes(g.id)}
                                            onChange={(e) => handleCheckboxChange(e, "genreIds")}
                                        />
                                    ))}
                                </div>
                            </Col>
                            <Col md={4}>
                                <Form.Label>* Đạo Diễn (Chọn Nhiều)</Form.Label>
                                <div className="p-2 border rounded" style={{ height: "150px", overflowY: "auto" }}>
                                    {directors.map(d => (
                                        <Form.Check
                                            key={d.id} type="checkbox" label={d.name} value={d.id}
                                            checked={getChecks("directorIds").includes(d.id)}
                                            onChange={(e) => handleCheckboxChange(e, "directorIds")}
                                        />
                                    ))}
                                </div>
                            </Col>
                            <Col md={4}>
                                <Form.Label>* Diễn Viên (Chọn Nhiều)</Form.Label>
                                <div className="p-2 border rounded" style={{ height: "150px", overflowY: "auto" }}>
                                    {actors.map(a => (
                                        <Form.Check
                                            key={a.id} type="checkbox" label={a.name} value={a.id}
                                            checked={getChecks("actorIds").includes(a.id)}
                                            onChange={(e) => handleCheckboxChange(e, "actorIds")}
                                        />
                                    ))}
                                </div>
                            </Col>
                        </Row>

                        {/* SHOWTIME SECTION — hiển thị cả khi tạo mới và khi sửa */}
                        <>
                            <h5 className="mt-5 mb-3 border-bottom pb-2 d-flex justify-content-between"
                                style={{ color: currentMovie ? '#0d6efd' : '#198754' }}>
                                {currentMovie ? "III. Lịch Chiếu Hiện Có" : "III. Lịch Chiếu Dự Kiến (Cùng Tạo)"}
                                <Button variant={currentMovie ? "outline-primary" : "outline-success"} size="sm" onClick={addShowtimeRow}>
                                    <i className="bi bi-plus"></i> Thêm Lịch
                                </Button>
                            </h5>

                            {/* Existing showtimes - chỉ hiển thị khi đang sửa */}
                            {currentMovie && (
                                <>
                                    {loadingShowtimes ? (
                                        <div className="text-center py-3">
                                            <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                                            <span className="ms-2 text-muted small">Đang tải lịch chiếu...</span>
                                        </div>
                                    ) : existingShowtimes.length === 0 ? (
                                        <p className="text-muted fst-italic small">Chưa có lịch chiếu nào cho bộ phim này.</p>
                                    ) : (
                                        <div className="table-responsive mb-3">
                                            <table className="table table-sm table-bordered align-middle" style={{ fontSize: "0.82rem" }}>
                                                <thead className="table-primary">
                                                    <tr>
                                                        <th>Ngày</th>
                                                        <th>Giờ BD</th>
                                                        <th>Giờ KT</th>
                                                        <th>Rạp</th>
                                                        <th>Phòng</th>
                                                        <th>Giá (VNĐ)</th>
                                                        <th>Trạng thái</th>
                                                        <th style={{ minWidth: 110 }}>Thao tác</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {existingShowtimes.map(st => {
                                                        const isEditing = editingShowtime?.id === st.id;
                                                        return isEditing ? (
                                                            // ---- INLINE EDIT ROW ----
                                                            <tr key={st.id} className="table-warning">
                                                                <td>
                                                                    <Form.Control size="sm" type="date"
                                                                        value={editingShowtime.date}
                                                                        onChange={e => handleEditShowtimeChange("date", e.target.value)} />
                                                                </td>
                                                                <td>
                                                                    <Form.Control size="sm" type="time"
                                                                        value={editingShowtime.startTime}
                                                                        onChange={e => handleEditShowtimeChange("startTime", e.target.value)} />
                                                                </td>
                                                                <td>
                                                                    <Form.Control size="sm" type="time"
                                                                        value={editingShowtime.endTime}
                                                                        onChange={e => handleEditShowtimeChange("endTime", e.target.value)} />
                                                                </td>
                                                                <td>
                                                                    <Form.Select size="sm"
                                                                        value={editingShowtime.cinemaId}
                                                                        onChange={e => handleEditShowtimeChange("cinemaId", e.target.value)}>
                                                                        {cinemas.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                                                    </Form.Select>
                                                                </td>
                                                                <td>
                                                                    <Form.Select size="sm"
                                                                        value={editingShowtime.screenId}
                                                                        onChange={e => handleEditShowtimeChange("screenId", e.target.value)}
                                                                        disabled={!editingShowtime.cinemaId}>
                                                                        <option value="">-- Phòng --</option>
                                                                        {(screensMap[editingShowtime.cinemaId] || []).map(s =>
                                                                            <option key={s.id} value={s.id}>{s.name}</option>
                                                                        )}
                                                                    </Form.Select>
                                                                </td>
                                                                <td>
                                                                    <Form.Control size="sm" type="number"
                                                                        value={editingShowtime.price}
                                                                        onChange={e => handleEditShowtimeChange("price", e.target.value)} />
                                                                </td>
                                                                <td>
                                                                    <span className="badge bg-warning text-dark">Đang sửa</span>
                                                                </td>
                                                                <td className="d-flex gap-1">
                                                                    <Button variant="success" size="sm" onClick={saveEditShowtime} disabled={savingShowtime}>
                                                                        {savingShowtime ? <span className="spinner-border spinner-border-sm" /> : <i className="bi bi-check-lg"></i>}
                                                                    </Button>
                                                                    <Button variant="secondary" size="sm" onClick={cancelEditShowtime} disabled={savingShowtime}>
                                                                        <i className="bi bi-x-lg"></i>
                                                                    </Button>
                                                                </td>
                                                            </tr>
                                                        ) : (
                                                            // ---- VIEW ROW ----
                                                            <tr key={st.id}>
                                                                <td>{st.date}</td>
                                                                <td>{st.startTime?.slice(0, 5)}</td>
                                                                <td>{st.endTime?.slice(0, 5)}</td>
                                                                <td>{st.cinemaName}</td>
                                                                <td>{st.screenName}</td>
                                                                <td>{Number(st.price).toLocaleString('vi-VN')}₫</td>
                                                                <td>
                                                                    <span className={`badge ${st.status === 'ACTIVE' ? 'bg-success' : 'bg-secondary'}`}>
                                                                        {st.status === 'ACTIVE' ? 'Đang chiếu' : 'Đã huỷ'}
                                                                    </span>
                                                                </td>
                                                                <td className="d-flex gap-1">
                                                                    {st.status === 'ACTIVE' && (
                                                                        <>
                                                                            <Button variant="outline-warning" size="sm" onClick={() => startEditShowtime(st)}
                                                                                disabled={!!editingShowtime}>
                                                                                <i className="bi bi-pencil"></i>
                                                                            </Button>
                                                                            <Button variant="outline-danger" size="sm" onClick={() => deleteExistingShowtime(st.id)}
                                                                                disabled={!!editingShowtime}>
                                                                                <i className="bi bi-trash"></i>
                                                                            </Button>
                                                                        </>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </>
                            )}


                            {/* Thêm lịch mới (cả tạo mới lẫn edit) */}
                            {showtimesToAdd.length > 0 && currentMovie && (
                                <h6 className="text-success mb-2"><i className="bi bi-plus-circle"></i> Thêm Lịch Chiếu Mới</h6>
                            )}
                            {!currentMovie && showtimesToAdd.length === 0 && (
                                <p className="text-muted fst-italic">Chưa có lịch chiếu nào. Phim vẫn sẽ được lưu, bạn có thể thêm lịch sau.</p>
                            )}
                            {showtimesToAdd.map((st, index) => (
                                <Card key={index} className="mb-3 border-success shadow-sm">
                                    <Card.Body className="py-2">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <span className="fw-bold text-success">Lịch Chiếu Bổ Sung #{index + 1}</span>
                                            <Button variant="outline-danger" size="sm" onClick={() => removeShowtimeRow(index)}><i className="bi bi-x-lg"></i></Button>
                                        </div>
                                        <Row className="g-2">
                                            <Col md={3}>
                                                <Form.Label className="small">Rạp</Form.Label>
                                                <Form.Select size="sm" value={st.cinemaId} onChange={e => handleShowtimeChange(index, "cinemaId", e.target.value)}>
                                                    <option value="">-- Rạp --</option>
                                                    {cinemas.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                                </Form.Select>
                                            </Col>
                                            <Col md={3}>
                                                <Form.Label className="small">Phòng Chiếu</Form.Label>
                                                <Form.Select size="sm" value={st.screenId} onChange={e => handleShowtimeChange(index, "screenId", e.target.value)} disabled={!st.cinemaId}>
                                                    <option value="">-- Phòng --</option>
                                                    {(screensMap[st.cinemaId] || []).map(s => <option key={s.id} value={s.id}>{s.name} ({s.seatingCapacity})</option>)}
                                                </Form.Select>
                                            </Col>
                                            <Col md={2}>
                                                <Form.Label className="small">Ngày</Form.Label>
                                                <Form.Control size="sm" type="date" value={st.date} onChange={e => handleShowtimeChange(index, "date", e.target.value)} />
                                            </Col>
                                            <Col md={2}>
                                                <Form.Label className="small">Giờ Bắt Đầu</Form.Label>
                                                <Form.Control size="sm" type="time" value={st.startTime} onChange={e => handleShowtimeChange(index, "startTime", e.target.value)} />
                                            </Col>
                                            <Col md={2}>
                                                <Form.Label className="small">Giờ Kết Thúc</Form.Label>
                                                <Form.Control size="sm" type="time" value={st.endTime} onChange={e => handleShowtimeChange(index, "endTime", e.target.value)} />
                                            </Col>
                                            <Col md={2}>
                                                <Form.Label className="small">Giá Vé (VNĐ)</Form.Label>
                                                <Form.Control size="sm" type="number" placeholder="VD: 55000" value={st.price} onChange={e => handleShowtimeChange(index, "price", e.target.value)} />
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                            ))}
                        </>

                        {validationError && (
                            <div className="text-danger fw-bold mt-3">{validationError}</div>
                        )}
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeModal} disabled={savingTarget}>Đóng</Button>
                    <Button variant="success" onClick={saveMovie} disabled={savingTarget}>
                        {savingTarget ? "Đang xử lý..." : (currentMovie ? "Cập Nhật Bộ Phim" : "Lưu Phim & Các Lịch Chiếu")}
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                <Modal.Header closeButton><Modal.Title>Xác Nhận Có Tính Bắt Buộc</Modal.Title></Modal.Header>
                <Modal.Body>
                    Bạn có chắc chắn muốn huỷ tính hiển thị của bộ phim này? (Nếu có lịch chiếu liên quan đang hoạt động có thể sẽ không bị xoá, tuỳ theo logic hệ thống).
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)} disabled={savingTarget}>Hủy</Button>
                    <Button variant="danger" onClick={confirmDelete} disabled={savingTarget}>
                        {savingTarget ? "Đang xử lý..." : "Chấp nhận"}
                    </Button>
                </Modal.Footer>
            </Modal>

        </Container>
    );
};

export default MoviesManager;
