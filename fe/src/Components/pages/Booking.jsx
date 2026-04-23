import { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { MdChair } from "react-icons/md";
import { Modal } from "react-bootstrap";
import { useAuth } from "../../context/AuthContext";
import "../../CSS/Nike.css";
import movieService from "../../services/movieService";
import seatService from "../../services/seatService";
import showtimeService from "../../services/showtimeService";
import bookingService from "../../services/bookingService";

function Booking() {
  const { id: movieId } = useParams();
  const location = useLocation();
  const showtimeId = location.state?.showtimeId;
  const { user } = useAuth();

  const [movieData, setMovieData] = useState(null);
  const [seatRows, setSeatRows] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [reservedSeats, setReservedSeats] = useState([]);
  const [lockedSeats, setLockedSeats] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [showModal, setShowModal] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [ticketId, setTicketId] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const fetchBookingData = async () => {
      try {
        if (!showtimeId) return;

        const showtimeRes = await showtimeService.getById(showtimeId);
        const showtime = showtimeRes.data;
        
        const movieRes = await movieService.getById(showtime.movieId);
        const movie = movieRes.data;
        
        setMovieData({
          id: movie.id,
          title: movie.title,
          duration: movie.duration,
          poster: movie.poster,
          language: movie.language?.name || "Chưa cập nhật",
          genre: movie.genres?.map(g => g.name).join(" · ") || "Chưa cập nhật",
          cinema: showtime.cinemaName,
          screen: showtime.screenName,
          selectedShowtime: {
            id: showtime.id,
            date: showtime.date,
            start_time: showtime.startTime,
            end_time: showtime.endTime,
            price: showtime.price,
          },
        });

        const seatsRes = await seatService.getAllByScreenId(showtime.screenId);
        const allSeats = seatsRes.data || [];
        
        const rowsObj = {};
        allSeats.forEach(seat => {
            const row = seat.name.charAt(0);
            if (!rowsObj[row]) rowsObj[row] = [];
            rowsObj[row].push(seat);
        });
        
        const sortedRows = Object.keys(rowsObj).sort().map(rowKey => {
            return rowsObj[rowKey].sort((a, b) => {
                const numA = parseInt(a.name.substring(1));
                const numB = parseInt(b.name.substring(1));
                return numA - numB;
            });
        });
        setSeatRows(sortedRows);
        
        const bookedRes = await showtimeService.getBookedSeats(showtimeId);
        setReservedSeats(bookedRes.data || []);
      } catch (error) {
        console.error("Lỗi tải dữ liệu", error);
      }
    };
    
    fetchBookingData();
  }, [showtimeId]);

  const getSeatState = (seat) => {
    if (reservedSeats.includes(seat.id)) return "reserved";
    if (lockedSeats.includes(seat.id)) return "locked";
    if (selectedSeats.find(s => s.id === seat.id)) return "selected";
    return "empty";
  };

  const seatStyle = (state) => {
    const base = {
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '4px 6px', borderRadius: '6px', cursor: 'pointer',
      transition: 'all 150ms ease', fontSize: '10px', fontWeight: '500',
      border: '1.5px solid',
      minWidth: '40px',
    };
    switch (state) {
      case "reserved": return { ...base, background: '#E5E5E5', color: '#9E9EA0', borderColor: '#CACACB', cursor: 'not-allowed' };
      case "locked":   return { ...base, background: '#FEF087', color: '#6B5900', borderColor: '#FCA600', cursor: 'not-allowed' };
      case "selected": return { ...base, background: '#111111', color: '#FFFFFF', borderColor: '#111111' };
      default:         return { ...base, background: '#FAFAFA', color: '#111111', borderColor: '#CACACB' };
    }
  };

  const handleSeatClick = (seat) => {
    const state = getSeatState(seat);
    if (state === "reserved" || state === "locked") return;
    setSelectedSeats(prev =>
      prev.find(s => s.id === seat.id) ? prev.filter(s => s.id !== seat.id) : [...prev, seat]
    );
  };

  const handleContinue = () => {
    if (selectedSeats.length === 0) { setShowAlertModal(true); return; }
    setLockedSeats(prev => [...new Set([...prev, ...selectedSeats.map(s => s.id)])]);
    setShowModal(true);
  };

  const handleConfirm = async () => {
    setIsSending(true);
    try {
        const payload = {
            showtimeId: movieData.selectedShowtime.id,
            seatIds: selectedSeats.map(s => s.id)
        };
        const res = await bookingService.create(payload);
        
        const bookingResponse = res.data.data;
        
        if (paymentMethod === "vnpay") {
            const vnpayRes = await bookingService.createVNPayUrl(bookingResponse.id);
            if (vnpayRes.data && vnpayRes.data.data && vnpayRes.data.data.paymentUrl) {
                window.location.href = vnpayRes.data.data.paymentUrl; 
                return;
            }
        }
        
        setTicketId(bookingResponse.bookingCode);
        const booked = selectedSeats.map(s => s.id);
        setReservedSeats(prev => [...new Set([...prev, ...booked])]);
        setSelectedSeats([]);
        setShowModal(false);
        setShowSuccessModal(true);
    } catch (error) {
        console.error("Lỗi đặt vé:", error);
        alert(error.response?.data?.message || "Có lỗi xảy ra khi đặt vé!");
    } finally {
        setIsSending(false);
    }
  };

  const formatPrice = (p) =>
    p ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(p) : "N/A";

  const formatDate = (s) => {
    if (!s) return "N/A";
    const d = new Date(s);
    return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
  };

  const totalPrice = (movieData?.selectedShowtime?.price || 0) * selectedSeats.length;

  if (!movieData) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div className="spinner-border text-dark" role="status" />
    </div>
  );

  // Legend items
  const legend = [
    { state: "empty",    label: "Trống" },
    { state: "selected", label: "Đang chọn" },
    { state: "locked",   label: "Đang giữ" },
    { state: "reserved", label: "Đã bán" },
  ];

  return (
    <>
      {/* Page top strip */}
      <div style={{ background: '#F5F5F5', padding: '12px 48px', borderBottom: '1px solid #E5E5E5' }}>
        <Link to="/movie" style={{ fontSize: '14px', fontWeight: '500', color: '#707072', textDecoration: 'none' }}>
          ← Quay lại danh sách phim
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', minHeight: 'calc(100vh - 120px)', fontFamily: 'Helvetica, Arial, sans-serif' }}>

        {/* LEFT — Seat Map */}
        <div style={{ padding: '40px 48px', borderRight: '1px solid #E5E5E5', overflowY: 'auto' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '700', textTransform: 'uppercase', color: '#111111', marginBottom: '32px' }}>
            Chọn ghế ngồi
          </h1>

          {/* Screen */}
          <div style={{ background: '#111111', color: 'white', textAlign: 'center', padding: '10px', marginBottom: '32px', fontSize: '12px', fontWeight: '700', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            MÀN HÌNH CHIẾU
          </div>

          {/* Seat Grid */}
          <div style={{ overflowX: 'auto' }}>
            {seatRows.map((row, ri) => (
              <div key={ri} style={{ display: 'flex', gap: '4px', marginBottom: '6px', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ width: '20px', fontSize: '12px', fontWeight: '700', color: '#9E9EA0', textAlign: 'right', marginRight: '8px' }}>
                  {row[0]?.name.charAt(0)}
                </span>
                {row.map(seat => {
                  const state = getSeatState(seat);
                  return (
                    <div key={seat.id} style={seatStyle(state)} onClick={() => handleSeatClick(seat)}>
                      <MdChair size={16} />
                      <span style={{ fontSize: '9px', marginTop: '2px' }}>{seat.name}</span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: '20px', marginTop: '32px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {legend.map(l => (
              <div key={l.state} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ ...seatStyle(l.state), padding: '4px 8px', cursor: 'default', minWidth: 'unset' }}>
                  <MdChair size={14} />
                </div>
                <span style={{ fontSize: '12px', color: '#707072', fontWeight: '500' }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — Ticket Summary */}
        <div style={{ padding: '40px 32px', background: '#FAFAFA', display: 'flex', flexDirection: 'column', gap: '24px', position: 'sticky', top: 0 }}>
          {/* Movie poster + title */}
          <div style={{ display: 'flex', gap: '16px' }}>
            <img
              src={movieData.poster}
              alt={movieData.title}
              style={{ width: '80px', aspectRatio: '2/3', objectFit: 'cover', flexShrink: 0 }}
            />
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#111111', marginBottom: '4px', lineHeight: '1.3' }}>
                {movieData.title}
              </h2>
              <p style={{ fontSize: '13px', color: '#707072', margin: 0 }}>{movieData.genre}</p>
              <p style={{ fontSize: '13px', color: '#707072', margin: 0 }}>{movieData.duration} phút</p>
            </div>
          </div>

          <hr style={{ borderColor: '#E5E5E5', margin: 0 }} />

          {/* Showtime details */}
          {[
            { label: "Rạp", value: movieData.cinema },
            { label: "Phòng", value: movieData.screen },
            { label: "Ngày", value: formatDate(movieData.selectedShowtime?.date) },
            { label: "Giờ chiếu", value: `${movieData.selectedShowtime?.start_time} — ${movieData.selectedShowtime?.end_time}` },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: '12px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9E9EA0' }}>{item.label}</span>
              <span style={{ fontSize: '14px', fontWeight: '500', color: '#111111' }}>{item.value}</span>
            </div>
          ))}

          <hr style={{ borderColor: '#E5E5E5', margin: 0 }} />

          {/* Selected seats */}
          <div>
            <div style={{ fontSize: '12px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9E9EA0', marginBottom: '8px' }}>
              Ghế đã chọn
            </div>
            {selectedSeats.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {selectedSeats.map(s => s.name).sort().map(name => (
                  <span key={name} style={{ background: '#111111', color: 'white', padding: '4px 10px', borderRadius: '30px', fontSize: '12px', fontWeight: '500' }}>
                    {name}
                  </span>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '13px', color: '#9E9EA0', margin: 0 }}>Chưa chọn ghế nào</p>
            )}
          </div>

          <hr style={{ borderColor: '#E5E5E5', margin: 0 }} />

          {/* Payment method */}
          <div>
            <div style={{ fontSize: '12px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9E9EA0', marginBottom: '12px' }}>
              Phương thức thanh toán
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { value: "cod", label: "💵 Thanh toán khi nhận vé (COD)" },
                { value: "vnpay", label: "💳 VNPay — Thanh toán trực tuyến" },
              ].map(m => (
                <label key={m.value} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '12px 16px', borderRadius: '8px', border: `1.5px solid ${paymentMethod === m.value ? '#111111' : '#CACACB'}`, background: paymentMethod === m.value ? '#111111' : '#FFFFFF', color: paymentMethod === m.value ? 'white' : '#111111', transition: 'all 200ms ease', fontSize: '14px', fontWeight: '500' }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={m.value}
                    checked={paymentMethod === m.value}
                    onChange={e => setPaymentMethod(e.target.value)}
                    style={{ display: 'none' }}
                  />
                  {m.label}
                </label>
              ))}
            </div>
          </div>

          {/* Total + CTA */}
          <div style={{ marginTop: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
              <span style={{ fontSize: '14px', color: '#707072' }}>
                {selectedSeats.length} ghế × {formatPrice(movieData.selectedShowtime?.price)}
              </span>
              <span style={{ fontSize: '20px', fontWeight: '700', color: '#111111' }}>
                {formatPrice(totalPrice)}
              </span>
            </div>
            <button
              className="btn-nike-primary"
              style={{ width: '100%', padding: '14px', fontSize: '16px' }}
              onClick={handleContinue}
            >
              Tiếp tục
            </button>
          </div>
        </div>
      </div>

      {/* Alert Modal — no seats */}
      <Modal show={showAlertModal} onHide={() => setShowAlertModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>CHƯA CHỌN GHẾ</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p style={{ color: '#707072' }}>Vui lòng chọn ít nhất một ghế trước khi tiếp tục!</p>
        </Modal.Body>
        <Modal.Footer>
          <button className="btn-nike-primary" style={{ padding: '10px 24px' }} onClick={() => setShowAlertModal(false)}>Đóng</button>
        </Modal.Footer>
      </Modal>

      {/* Confirm Modal */}
      <Modal show={showModal} onHide={() => !isSending && setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>XÁC NHẬN ĐẶT VÉ</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: '24px' }}>
          <div style={{ background: '#FAFAFA', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { label: "Phim", value: movieData.title },
              { label: "Rạp", value: movieData.cinema },
              { label: "Phòng", value: movieData.screen },
              { label: "Ngày chiếu", value: formatDate(movieData.selectedShowtime?.date) },
              { label: "Giờ chiếu", value: movieData.selectedShowtime?.start_time },
              { label: "Ghế", value: selectedSeats.map(s => s.name).sort().join(", ") },
              { label: "Thanh toán", value: paymentMethod === "cod" ? "COD" : "VNPay" },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
                <span style={{ color: '#707072', fontSize: '14px', whiteSpace: 'nowrap' }}>{item.label}</span>
                <span style={{ fontWeight: '500', fontSize: '14px', textAlign: 'right' }}>{item.value}</span>
              </div>
            ))}
            <hr style={{ borderColor: '#E5E5E5', margin: '4px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#707072', fontSize: '14px' }}>Tổng tiền</span>
              <span style={{ fontWeight: '700', fontSize: '18px' }}>{formatPrice(totalPrice)}</span>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer style={{ padding: '0 24px 24px', borderTop: 'none', display: 'flex', gap: '8px' }}>
          <button
            className="btn-nike-secondary"
            style={{ flex: 1, padding: '12px' }}
            disabled={isSending}
            onClick={() => setShowModal(false)}
          >
            Quay lại
          </button>
          <button
            className="btn-nike-primary"
            style={{ flex: 2, padding: '12px' }}
            disabled={isSending}
            onClick={handleConfirm}
          >
            {isSending ? "Đang xử lý..." : "Xác nhận đặt vé"}
          </button>
        </Modal.Footer>
      </Modal>

      {/* Success Modal */}
      <Modal show={showSuccessModal} onHide={() => setShowSuccessModal(false)} centered>
        <Modal.Header closeButton style={{ borderBottom: 'none' }}>
          <Modal.Title>ĐẶT VÉ THÀNH CÔNG 🎉</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: '24px', textAlign: 'center' }}>
          <div style={{ fontSize: '60px', marginBottom: '16px' }}>✅</div>
          <p style={{ color: '#707072', marginBottom: '8px' }}>Cảm ơn bạn đã đặt vé tại Movie 36!</p>
          <div style={{ background: '#F5F5F5', borderRadius: '8px', padding: '16px', display: 'inline-block', marginTop: '8px' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9E9EA0' }}>Mã vé</div>
            <div style={{ fontSize: '22px', fontWeight: '700', color: '#111111', letterSpacing: '2px', marginTop: '4px' }}>{ticketId}</div>
          </div>
          <p style={{ fontSize: '13px', color: '#9E9EA0', marginTop: '16px' }}>
            Thông tin vé đã được gửi về email của bạn.
          </p>
        </Modal.Body>
        <Modal.Footer style={{ borderTop: 'none', padding: '0 24px 24px', justifyContent: 'center' }}>
          <button className="btn-nike-primary" style={{ padding: '12px 40px' }} onClick={() => setShowSuccessModal(false)}>
            Hoàn tất
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default Booking;
