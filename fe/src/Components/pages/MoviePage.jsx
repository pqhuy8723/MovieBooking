import { FaPlay } from "react-icons/fa";
import { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "../../CSS/Nike.css";

function MoviePage() {
  const navigate = useNavigate();
  const [movie, setMovie] = useState([]);
  const [movieType, setMovieType] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedMovieType, setSelectedMovieType] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [cinema, setCinema] = useState({});
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  const [showTime, setShowTime] = useState([]);

  useEffect(() => {
    const movies = [
      { id: 1, title: "Avengers: Secret Wars", poster: "https://via.placeholder.com/300x450/111111/FFFFFF?text=Movie+1", movie_type: 1, genre_ids: [1], duration: 148, release_date: "2026-05-01", video_url: "https://www.youtube.com/embed/tgbNymZ7vqY" },
      { id: 2, title: "Deadpool & Wolverine", poster: "https://via.placeholder.com/300x450/1F1F21/FFFFFF?text=Movie+2", movie_type: 1, genre_ids: [1, 2], duration: 128, release_date: "2026-04-15", video_url: "https://www.youtube.com/embed/tgbNymZ7vqY" },
      { id: 3, title: "Spider-Man: Beyond", poster: "https://via.placeholder.com/300x450/28282A/FFFFFF?text=Movie+3", movie_type: 2, genre_ids: [2], duration: 132, release_date: "2026-06-15", video_url: "https://www.youtube.com/embed/tgbNymZ7vqY" },
      { id: 4, title: "Thor: Love & Thunder 2", poster: "https://via.placeholder.com/300x450/111111/FFFFFF?text=Movie+4", movie_type: 1, genre_ids: [1], duration: 119, release_date: "2026-04-20", video_url: "https://www.youtube.com/embed/tgbNymZ7vqY" },
    ];
    setMovie(movies);
    setGenres([{ id: 1, name: "Hành Động" }, { id: 2, name: "Phiêu Lưu" }]);
    setMovieType([{ id: 1, name: "Đang Chiếu" }, { id: 2, name: "Sắp Chiếu" }]);
    setCinema({ name: "Movie 36 Cinema" });
  }, []);

  const filteredData = movie.filter(m => String(m.movie_type) === String(selectedMovieType));

  const getGenreNames = (ids) =>
    ids.map(id => genres.find(g => g.id === id)?.name).filter(Boolean).join(" · ");

  const formatTime = (t) => {
    const d = new Date(`1970-01-01T${t}`);
    return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false });
  };

  const formatDate = (s) =>
    new Date(s).toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit" });

  const openTrailer = (m) => { setSelectedMovie(m); setShowModal(true); };

  const handleBookTicket = (movieId) => {
    setSelectedMovie(movie.find(m => m.id === movieId));
    setShowTime([
      { id: "S1", date: "2026-05-15", start_time: "10:00:00", price: 80000 },
      { id: "S2", date: "2026-05-15", start_time: "14:30:00", price: 85000 },
      { id: "S3", date: "2026-05-16", start_time: "19:00:00", price: 90000 },
    ]);
    setSelectedDate("2026-05-15");
    setSelectedShowtime(null);
    setShowBookingModal(true);
  };

  const filteredShowtimes = showTime.filter(s => s.date === selectedDate);

  return (
    <>
      <div className="nike-page" style={{ paddingTop: '32px' }}>
        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', flexWrap: 'wrap' }}>
          {movieType.map(type => (
            <button
              key={type.id}
              className={`nike-pill ${selectedMovieType === type.id ? 'active' : ''}`}
              onClick={() => setSelectedMovieType(type.id)}
            >
              {type.name}
            </button>
          ))}
        </div>

        <h1 className="nike-h1" style={{ marginBottom: '24px' }}>
          {movieType.find(t => t.id === selectedMovieType)?.name || "PHIM"}
        </h1>

        {/* Movie Grid */}
        <div className="nike-movie-grid">
          {filteredData.length > 0 ? filteredData.map(m => (
            <div key={m.id} style={{ cursor: 'pointer' }}>
              <div style={{ position: 'relative' }} onClick={() => navigate(`/movie/${m.id}`)}>
                <img
                  src={m.poster}
                  alt={m.title}
                  style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover', display: 'block' }}
                />
                <button
                  style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  onClick={e => { e.stopPropagation(); openTrailer(m); }}
                >
                  <FaPlay size={14} color="white" />
                </button>
              </div>
              <div style={{ padding: '12px 0' }}>
                <div style={{ fontSize: '16px', fontWeight: '500', color: '#111111', marginBottom: '4px' }}>{m.title}</div>
                <div style={{ fontSize: '14px', color: '#707072' }}>{getGenreNames(m.genre_ids)}</div>
                <div style={{ fontSize: '12px', color: '#9E9EA0', marginTop: '4px' }}>{m.duration} phút</div>
                <button
                  className="btn-nike-primary"
                  style={{ marginTop: '12px', width: '100%', padding: '10px', fontSize: '14px' }}
                  onClick={() => handleBookTicket(m.id)}
                >
                  Mua vé
                </button>
              </div>
            </div>
          )) : (
            <p style={{ color: '#707072', gridColumn: '1/-1', textAlign: 'center', padding: '64px 0' }}>
              Không có phim nào.
            </p>
          )}
        </div>
      </div>

      {/* Trailer Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{selectedMovie?.title} — Trailer</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: 0 }}>
          <iframe width="100%" height="415" src={selectedMovie?.video_url} title="Trailer" frameBorder="0" allowFullScreen />
        </Modal.Body>
      </Modal>

      {/* Booking Modal */}
      <Modal show={showBookingModal} onHide={() => { setShowBookingModal(false); setSelectedShowtime(null); }} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>CHỌN SUẤT CHIẾU — {selectedMovie?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: '24px' }}>
          <div style={{ marginBottom: '24px' }}>
            <p style={{ fontSize: '12px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#707072', marginBottom: '12px' }}>{cinema.name}</p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[...new Set(showTime.map(s => s.date))].map(date => (
                <button
                  key={date}
                  className={`nike-pill ${selectedDate === date ? 'active' : ''}`}
                  onClick={() => { setSelectedDate(date); setSelectedShowtime(null); }}
                  style={{ fontSize: '13px' }}
                >
                  {formatDate(date)}
                </button>
              ))}
            </div>
          </div>

          <hr className="nike-divider" />

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '16px' }}>
            {filteredShowtimes.map(s => (
              <button
                key={s.id}
                onClick={() => setSelectedShowtime(s)}
                style={{
                  padding: '12px 20px', borderRadius: '8px', cursor: 'pointer',
                  border: selectedShowtime?.id === s.id ? '2px solid #111111' : '1.5px solid #CACACB',
                  background: selectedShowtime?.id === s.id ? '#111111' : '#FAFAFA',
                  color: selectedShowtime?.id === s.id ? 'white' : '#111111',
                  fontWeight: '500', fontSize: '14px', textAlign: 'center',
                  transition: 'all 200ms ease',
                }}
              >
                <div style={{ fontSize: '16px', fontWeight: '700' }}>{formatTime(s.start_time)}</div>
                <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.8 }}>
                  {Number(s.price).toLocaleString()} đ
                </div>
              </button>
            ))}
            {filteredShowtimes.length === 0 && (
              <p style={{ color: '#9E9EA0' }}>Không có suất chiếu cho ngày này.</p>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer style={{ padding: '16px 24px', borderTop: '1px solid #E5E5E5' }}>
          <button
            className="btn-nike-primary"
            style={{ padding: '12px 32px' }}
            disabled={!selectedShowtime}
            onClick={() => navigate(`/booking/${selectedMovie?.id}`, { state: { showtimeId: selectedShowtime?.id } })}
          >
            Đặt vé
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default MoviePage;
