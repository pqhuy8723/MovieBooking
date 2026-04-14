import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
// Removed API service imports
import { MdChair } from "react-icons/md";
import { Modal, Button } from "react-bootstrap";
import "../../CSS/Booking.css";

function Booking() {
  const { id: movieId } = useParams();
  const location = useLocation();
  const showtimeId = location.state?.showtimeId;
  const [movieData, setMovieData] = useState(null);
  const [genres, setGenres] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [screen, setScreen] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const getSessionUser = () => {
    try {
      const data = sessionStorage.getItem("account");
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Error parsing session account:", error);
      return null;
    }
  };

  const getLocalUser = () => {
    try {
      const data = localStorage.getItem("rememberedAccount");
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Error parsing local account:", error);
      return null;
    }
  };

  const sessionUser = getSessionUser();
  const localUser = getLocalUser();
  const user = sessionUser || localUser;
  const [isSending, setIsSending] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [ticketId, setTicketId] = useState('');
  const [reservedSeats, setReservedSeats] = useState([]);
  const [lockedSeats, setLockedSeats] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("cod"); // "cod" hoặc "vnpay"

  // Helper function to update reserved seats
  const updateReservedSeats = async () => {
    setReservedSeats(["A1"]); // mock
  };

  useEffect(() => {
    const fetchMovieData = async () => {
      setMovieData({
        id: "M1", title: "Phim Dummy Booking", duration: 120, poster: "https://via.placeholder.com/200x300", language_id: 1, genre_ids: [1],
        selectedShowtime: { id: showtimeId, date: "2026-05-15", start_time: "10:00", end_time: "12:00", price: 50000, cinema_id: 1, screen_id: 1 }
      });
      setGenres([{ id: 1, name: "Hành Động" }]);
      setScreen([{ id: 1, name: "Phòng chiếu 1" }]);
      setLanguages([{ id: 1, name: "Tiếng Việt" }]);
      setCinemas([{ id: 1, name: "Cinema Dummy 1" }]);
      setReservedSeats(["A1"]);
      setLockedSeats([]);
    };
    fetchMovieData();
    // Static mode: No polling
  }, [movieId, showtimeId, movieData?.title, movieData?.selectedShowtime, cinemas]);

  const seats = Array.from({ length: 8 }, (_, rowIndex) => {
    const rowLabel = String.fromCharCode(65 + rowIndex);
    return Array.from({ length: 12 }, (_, seatIndex) => {
      const seatId = `${rowLabel}${seatIndex + 1}`;
      return { id: seatId, status: "empty" };
    });
  });

  const getSeatClass = (seatId) => {
    if (reservedSeats.includes(seatId)) {
      return "seat-reserved";  // Ghế đã bán
    }
    if (lockedSeats.includes(seatId)) {
      return "seat-locked";    // Ghế đang được giữ (màu vàng, không chọn được)
    }
    if (selectedSeats.includes(seatId)) {
      return "seat-selected";  // Ghế đang chọn
    }
    return "seat-empty";
  };

  const handleSeatSelection = (seatId) => {
    if (reservedSeats.includes(seatId)) {
      return; // Prevent selection if the seat is reserved
    }
    if (lockedSeats.includes(seatId)) {
      return; // Prevent selection if the seat is locked
    }
    setSelectedSeats((prevSelectedSeats) =>
      prevSelectedSeats.includes(seatId)
        ? prevSelectedSeats.filter((id) => id !== seatId)
        : [...prevSelectedSeats, seatId]
    );
  };

  const handleContinue = async () => {
    if (selectedSeats.length === 0) {
      setShowAlertModal(true);
      return;
    }

    if (!movieData || !movieData.selectedShowtime || !user) {
      alert("Vui lòng đăng nhập và chọn suất chiếu!");
      return;
    }

    // Static lock seats
    setLockedSeats((prev) => [...new Set([...prev, ...selectedSeats])]);
    setShowModal(true);
  };

  const getGenreNames = (genreIds) => {
    return genreIds
      .map((id) => genres.find((genre) => genre.id === id)?.name)
      .join(", ") || "Unknown Genre";
  };
  const getScreenName = (screenId) => {
    return screen.find((screen) => screen.id === screenId)?.name || "Unknown Screen";
  }
  const getLanguageName = (languageId) => {
    return languages.find((language) => language.id === languageId)?.name || "Unknown Language";
  };
  const getCinemaName = (cinemaId) => {
    return cinemas.find((cinema) => cinema.id === cinemaId)?.name || "Unknown Cinema";
  };
  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    const [hours, minutes] = timeString.split(":").map(Number);
    if (isNaN(hours) || isNaN(minutes)) return "N/A";
    const time = new Date();
    time.setHours(hours, minutes, 0, 0);
    return time.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Format price with commas and currency symbol
  const formatPrice = (price) => {
    return price
      ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price)
      : "N/A";
  };

  if (!movieData) {
    return <div>Loading...</div>;
  }
  const handleConfirmBooking = async () => {
    setIsSending(true); // Start sending email
    setTimeout(() => {
      if (paymentMethod === "vnpay") {
        alert("VNPay mock: Chuyển hướng...");
        setIsSending(false);
        return;
      }
      setTicketId("T" + Date.now());
      setShowSuccessModal(true);
      setShowModal(false);
      
      const bookedSeats = [...selectedSeats];
      setSelectedSeats([]);
      setLockedSeats((prev) => prev.filter(seat => !bookedSeats.includes(seat)));
      setReservedSeats((prev) => [...new Set([...prev, ...bookedSeats])]);
      
      setIsSending(false);
    }, 500);
  };





  return (
    <div className="booking-container">
      <div className="seats-container">
        <h3>Sơ đồ ghế</h3>
        <div className="seat-legend">
          <div className="legend-item">
            <MdChair className="seat-icon" size={20} />
            <span className="seat empty">Ghế trống</span>
          </div>
          <div className="legend-item">
            <MdChair className="seat-icon seat-selected-icon" size={20} />
            <span className="seat selected">Ghế đang chọn</span>
          </div>
          <div className="legend-item">
            <MdChair className="seat-icon seat-reserved-icon" size={20} />
            <span className="seat reserved">Ghế đã bán</span>
          </div>
          <div className="legend-item">
            <MdChair className="seat-icon seat-locked-icon" size={20} />
            <span className="seat locked">Ghế đang giữ</span>
          </div>
        </div>
        <div className="screen">Màn hình chiếu</div>
        <div className="seats">
          {seats.map((row, rowIndex) => (
            <div key={rowIndex} className="seat-row">
              {row.map((seat) => (
                <div
                  key={seat.id}
                  className={`seat ${getSeatClass(seat.id)}`}
                  onClick={() => handleSeatSelection(seat.id)}
                >
                  <MdChair className="seat-icon" size={20} />
                  <span>{seat.id}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="ticket">
        <div className="header">
          <img
            src={movieData.poster}
            alt={movieData.title}
            className="poster"
          />
        </div>
        <div className="info">
          <h2>{movieData.title}</h2>
          <p>{getLanguageName(movieData.language_id)}</p>
          <ul>
            <li>
              <strong>Thể loại:</strong> {getGenreNames(movieData.genre_ids)}
            </li>
            <li>
              <strong>Thời lượng:</strong> {movieData.duration} phút
            </li>
            <li>
              <strong>Rạp chiếu:</strong> {getCinemaName(movieData.selectedShowtime?.cinema_id)}
            </li>
            <li>
              <strong>Ngày chiếu:</strong>{" "}
              {formatDate(movieData.selectedShowtime?.date)}
            </li>
            <li>
              <strong>Giờ chiếu:</strong>{" "}
              {formatTime(movieData.selectedShowtime?.start_time)} -{" "}
              {formatTime(movieData.selectedShowtime?.end_time)}
            </li>
            <li>
              <strong>Phòng chiếu:</strong> {getScreenName(movieData.selectedShowtime?.screen_id)}
            </li>
            <li>
              <strong>Ghế:</strong>{" "}
              {selectedSeats.length > 0
                ? selectedSeats.join(", ")
                : "Chưa chọn ghế"}
            </li>
            <li>
              <strong>Tổng tiền:</strong> {formatPrice(movieData.selectedShowtime?.price * selectedSeats.length)}
            </li>
          </ul>
          <div style={{ marginTop: "20px", marginBottom: "20px" }}>
            <h4 style={{ marginBottom: "0px" }}>Phương thức thanh toán:</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "3px" }}>
              <label style={{ display: "flex", alignItems: "center", cursor: "pointer", width: "fit-content" }}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={{ marginRight: "4px", width: "auto", flexShrink: 0 }}
                />
                Thanh toán khi nhận vé (COD)
              </label>
              <label style={{ display: "flex", alignItems: "center", cursor: "pointer", width: "fit-content" }}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="vnpay"
                  checked={paymentMethod === "vnpay"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={{ marginRight: "4px", width: "auto", flexShrink: 0 }}
                />
                Thanh toán trực tuyến (VNPay)
              </label>
            </div>
          </div>
          <button className="continue-button" onClick={handleContinue}>Tiếp tục</button>
        </div>
      </div>

      {/* Modal thông báo khi chưa chọn ghế */}
      <Modal show={showAlertModal} onHide={() => setShowAlertModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Thông báo</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Vui lòng chọn ít nhất một ghế trước khi tiếp tục!</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAlertModal(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal xác nhận đặt vé */}
      <Modal show={showModal} onHide={() => !isSending && setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận đặt vé</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p><strong>Người đặt:</strong> {user?.full_name || "Khách"}</p>
          <p><strong>Email người đặt:</strong> {user?.email}</p>
          <p><strong>Số điện thoại người đặt:</strong> {user?.phone || "Khách"}</p>
          <p><strong>Thời gian đặt:</strong> {new Date().toLocaleString()}</p>
          <p><strong>Thông tin vé:</strong></p>
          <ul>
            <li>
              <strong>Rạp chiếu:</strong> {getCinemaName(movieData.selectedShowtime?.cinema_id)}
            </li>
            <li><strong>Phim:</strong> {movieData.title}</li>
            <li>
              <strong>Thời lượng:</strong> {movieData.duration} phút
            </li>
            <li>
              <strong>Phòng chiếu:</strong> {getScreenName(movieData.selectedShowtime?.screen_id)}
            </li>
            <li><strong>Ghế:</strong> {selectedSeats.join(", ")}</li>
            <li>
              <strong>Ngày chiếu:</strong> {formatDate(movieData.selectedShowtime?.date)}
            </li>
            <li><strong>Thời gian chiếu:</strong> {formatTime(movieData.selectedShowtime?.start_time)} - {formatTime(movieData.selectedShowtime?.end_time)}</li>
            <li><strong>Tổng tiền:</strong> {formatPrice(movieData.selectedShowtime?.price * selectedSeats.length)}</li>
            <li><strong>Phương thức thanh toán:</strong> {paymentMethod === "cod" ? "Thanh toán khi nhận vé (COD)" : "Thanh toán trực tuyến (VNPay)"}</li>
          </ul>
        </Modal.Body>
        <Modal.Footer>
          <Button disabled={isSending} variant="secondary" onClick={() => setShowModal(false)}>
            Đóng
          </Button>
          <Button disabled={isSending} onClick={handleConfirmBooking} variant="primary">
            Xác Nhận
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Success Modal */}
      <Modal show={showSuccessModal} onHide={() => setShowSuccessModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Đặt vé thành công!</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p><strong>Mã vé của bạn là:</strong> {ticketId}</p>
          <p>Thông tin vé đã được gửi về email của bạn. Vui lòng mang theo thông tin vé đến quầy để thanh toán và nhận vé. Xin cảm ơn!</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => setShowSuccessModal(false)}>
            OK
          </Button>
        </Modal.Footer>
      </Modal>

    </div>
  );
}

export default Booking;
