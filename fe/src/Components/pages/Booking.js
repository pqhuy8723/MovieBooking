import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { fetchData } from "../API/ApiService";
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
    if (!movieData?.selectedShowtime || !cinemas.length) return;
    
    try {
      const accountData = await fetchData("accounts");
      const formatTimeForFilter = (timeString) => {
        if (!timeString) return "";
        const [hours, minutes] = timeString.split(":").map(Number);
        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
      };

      const formatDateForFilter = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
      };

      const getCinemaNameForFilter = (cinemaId) => {
        return cinemas.find((cinema) => cinema.id === cinemaId)?.name || "Unknown Cinema";
      };

      const reservedSeats = accountData
        .flatMap(account => account.tickets || [])
        .filter(ticket =>
          ticket.status === "active" && // Chỉ lấy ghế đã thanh toán
          ticket.movie === movieData.title &&
          ticket.cinema === getCinemaNameForFilter(movieData.selectedShowtime.cinema_id) &&
          ticket.date === formatDateForFilter(movieData.selectedShowtime.date) &&
          ticket.startTime === formatTimeForFilter(movieData.selectedShowtime.start_time)
        )
        .flatMap(ticket => ticket.seats || []);

      setReservedSeats(reservedSeats);
    } catch (error) {
      console.error("Error updating reserved seats:", error);
    }
  };

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        const movie = await fetchData(`movies/${movieId}`);
        const showtime = movie.showtimes.find((s) => s.id === showtimeId);
        const genreData = await fetchData("genres");
        const languageData = await fetchData("languages");
        const cinemaData = await fetchData("cinema");
        const screenData = await fetchData("screens");
        const accountData = await fetchData("accounts");

        setMovieData({ ...movie, selectedShowtime: showtime });
        setGenres(genreData);
        setScreen(screenData);
        setLanguages(languageData);
        setCinemas(cinemaData);

        // Helper functions for filtering
        const formatTimeForFilter = (timeString) => {
          if (!timeString) return "";
          // Xử lý cả format "HH:MM" và "HH:MM:SS"
          const [hours, minutes] = timeString.split(":").map(Number);
          // Đảm bảo format luôn là "HH:MM"
          return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
        };

        const formatDateForFilter = (dateString) => {
          if (!dateString) return "N/A";
          const date = new Date(dateString);
          const day = String(date.getDate()).padStart(2, "0");
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const year = date.getFullYear();
          return `${day}-${month}-${year}`;
        };

        const getCinemaNameForFilter = (cinemaId) => {
          return cinemaData.find((cinema) => cinema.id === cinemaId)?.name || "Unknown Cinema";
        };

        // Fetch reserved seats for the current movie, showtime, and date
        // Chỉ lấy tickets đã thanh toán (status === "active")
        if (showtime && movie && cinemaData.length > 0) {
        const reservedSeats = accountData
            .flatMap(account => account.tickets || [])
          .filter(ticket =>
              ticket.status === "active" && // Chỉ lấy ghế đã thanh toán
              ticket.movie === movie.title &&
              ticket.cinema === getCinemaNameForFilter(showtime.cinema_id) &&
              ticket.date === formatDateForFilter(showtime.date) &&
              ticket.startTime === formatTimeForFilter(showtime.start_time)
          )
            .flatMap(ticket => ticket.seats || []);

        setReservedSeats(reservedSeats);

          // Fetch locked seats
          const lockParams = new URLSearchParams({
            movie: movie.title,
            cinema: getCinemaNameForFilter(showtime.cinema_id),
            date: formatDateForFilter(showtime.date),
            startTime: formatTimeForFilter(showtime.start_time),
          });

          try {
            const lockResponse = await fetch(`http://localhost:5000/api/locked-seats?${lockParams}`);
            if (lockResponse.ok) {
              const lockData = await lockResponse.json();
              setLockedSeats(lockData.lockedSeats || []);
            }
          } catch (error) {
            console.error("Error fetching locked seats:", error);
          }
        }
      } catch (error) {
        console.error("Error fetching movie data:", error);
      }
    };

    fetchMovieData();

    // Polling để cập nhật locked seats mỗi 5 giây
    if (!movieData?.selectedShowtime || !cinemas.length) return;

    const updateLockedSeats = async () => {
      try {
        // Helper functions trong scope của useEffect
        const getCinemaNameForPolling = (cinemaId) => {
          return cinemas.find((cinema) => cinema.id === cinemaId)?.name || "Unknown Cinema";
        };

        const formatTimeForPolling = (timeString) => {
          if (!timeString) return "N/A";
          const [hours, minutes] = timeString.split(":").map(Number);
          if (isNaN(hours) || isNaN(minutes)) return "N/A";
          const time = new Date();
          time.setHours(hours, minutes, 0, 0);
          return time.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false });
        };

        const formatDateForPolling = (dateString) => {
          if (!dateString) return "N/A";
          const date = new Date(dateString);
          const day = String(date.getDate()).padStart(2, "0");
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const year = date.getFullYear();
          return `${day}-${month}-${year}`;
        };

        const lockParams = new URLSearchParams({
          movie: movieData.title,
          cinema: getCinemaNameForPolling(movieData.selectedShowtime?.cinema_id),
          date: formatDateForPolling(movieData.selectedShowtime?.date),
          startTime: formatTimeForPolling(movieData.selectedShowtime?.start_time),
        });

        const lockResponse = await fetch(`http://localhost:5000/api/locked-seats?${lockParams}`);
        if (lockResponse.ok) {
          const lockData = await lockResponse.json();
          setLockedSeats(lockData.lockedSeats || []);
        }
      } catch (error) {
        console.error("Error fetching locked seats:", error);
      }
    };

    updateLockedSeats(); // Gọi ngay lập tức
    const intervalId = setInterval(updateLockedSeats, 5000); // Cập nhật mỗi 5 giây

    return () => clearInterval(intervalId);
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

    // Lock seats trước khi hiển thị modal xác nhận
    try {
      const lockData = {
        userEmail: user.email,
        movie: movieData.title,
        cinema: getCinemaName(movieData.selectedShowtime.cinema_id),
        date: formatDate(movieData.selectedShowtime.date),
        startTime: formatTime(movieData.selectedShowtime.start_time),
        seats: selectedSeats,
      };

      const lockResponse = await fetch("http://localhost:5000/api/lock-seats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(lockData),
      });

      if (lockResponse.ok) {
        // Cập nhật locked seats để hiển thị ngay
        setLockedSeats((prev) => [...new Set([...prev, ...selectedSeats])]);
        setShowModal(true);
    } else {
        alert("Có lỗi xảy ra khi giữ ghế, vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Error locking seats:", error);
      alert("Có lỗi xảy ra khi giữ ghế, vui lòng thử lại.");
    }
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
    try {
      const bookingData = {
        userEmail: user?.email,
        fullName: user?.full_name || "Khách",
        phone: user?.phone || "Khách",
        cinema: getCinemaName(movieData.selectedShowtime?.cinema_id),
        movie: movieData.title,
        duration: movieData.duration,
        screen: getScreenName(movieData.selectedShowtime?.screen_id),
        seats: selectedSeats,  // Đảm bảo seats là mảng
        date: formatDate(movieData.selectedShowtime?.date),
        startTime: formatTime(movieData.selectedShowtime?.start_time),
        endTime: formatTime(movieData.selectedShowtime?.end_time),
        totalPrice: movieData.selectedShowtime?.price * selectedSeats.length
      };

      // Nếu chọn thanh toán VNPay
      if (paymentMethod === "vnpay") {
        const response = await fetch("http://localhost:5000/vnpay/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ bookingData }),
        });

        if (response.ok) {
          const result = await response.json();
          if (result.paymentUrl) {
            // Lưu booking code vào sessionStorage
            sessionStorage.setItem("booking_code", result.booking_code);
            // Chuyển hướng đến trang thanh toán VNPay
            window.location.href = result.paymentUrl;
          } else {
            alert(result.message || "Không thể tạo liên kết thanh toán.");
            setIsSending(false);
          }
        } else {
          const errorData = await response.json();
          alert(errorData.message || "Có lỗi xảy ra, vui lòng thử lại.");
          setIsSending(false);
        }
        return;
      }

      // Thanh toán COD (giữ nguyên logic cũ)
      const response = await fetch("http://localhost:5000/api/confirm-booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      });

      if (response.ok) {
        const result = await response.json();
        setTicketId(result.ticketId);
        setShowSuccessModal(true);
        setShowModal(false);
        
        // Unlock seats sau khi thanh toán thành công
        try {
          await fetch("http://localhost:5000/api/unlock-seats", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userEmail: user?.email,
              movie: movieData.title,
              cinema: getCinemaName(movieData.selectedShowtime?.cinema_id),
              date: formatDate(movieData.selectedShowtime?.date),
              startTime: formatTime(movieData.selectedShowtime?.start_time),
            }),
          });
        } catch (error) {
          console.error("Error unlocking seats:", error);
        }
        
        // Lưu selectedSeats trước khi xóa
        const bookedSeats = [...selectedSeats];
        setSelectedSeats([]);
        // Xóa locked seats khỏi state
        setLockedSeats((prev) => prev.filter(seat => !bookedSeats.includes(seat)));
        
        // Thêm ghế vừa đặt vào reservedSeats ngay lập tức
        setReservedSeats((prev) => [...new Set([...prev, ...bookedSeats])]);
        
        // Reload reserved seats sau khi đặt vé thành công (với delay nhỏ để đảm bảo database đã được cập nhật)
        setTimeout(async () => {
          await updateReservedSeats();
        }, 500);
      } else {
        alert("Có lỗi xảy ra, vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Error confirming booking:", error);
      alert("Có lỗi xảy ra khi xác nhận vé.");
    } finally {
      setIsSending(false);
    }
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
