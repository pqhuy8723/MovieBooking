import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "../../CSS/Nike.css";

function ShowTime() {
  const [selectedDates, setSelectedDates] = useState({});
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [cinema, setCinema] = useState({});
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  const [selectedMovieId, setSelectedMovieId] = useState(null);
  const navigate = useNavigate();

  const isShowtimePassed = (s) => {
    const now = new Date();
    const dt = new Date(s.date);
    const [h, m, sec] = s.start_time.split(":").map(Number);
    dt.setHours(h, m, sec || 0, 0);
    return dt < now;
  };

  useEffect(() => {
    const fakeData = [
      {
        id: "M1", title: "Avengers: Secret Wars", genre_ids: [1], duration: 148, language_id: 1,
        poster: "https://via.placeholder.com/180x270/111111/FFFFFF?text=M1",
        showtimes: [
          { id: "S1", date: "2026-05-15", start_time: "10:00:00", price: 80000 },
          { id: "S2", date: "2026-05-15", start_time: "14:30:00", price: 85000 },
          { id: "S3", date: "2026-05-16", start_time: "19:00:00", price: 90000 },
        ]
      },
      {
        id: "M2", title: "Deadpool & Wolverine", genre_ids: [1, 2], duration: 128, language_id: 1,
        poster: "https://via.placeholder.com/180x270/1F1F21/FFFFFF?text=M2",
        showtimes: [
          { id: "S4", date: "2026-05-15", start_time: "11:00:00", price: 80000 },
          { id: "S5", date: "2026-05-16", start_time: "16:00:00", price: 85000 },
        ]
      },
    ];
    setMovies(fakeData);
    const initial = {};
    fakeData.forEach(m => {
      const valid = m.showtimes.filter(s => !isShowtimePassed(s));
      if (valid.length > 0) initial[m.id] = valid.map(s => s.date).sort()[0];
    });
    setSelectedDates(initial);
    setGenres([{ id: 1, name: "Hành Động" }, { id: 2, name: "Phiêu Lưu" }]);
    setCinema({ name: "Movie 36 Cinema" });
  }, []);

  const getGenreNames = ids => ids.map(id => genres.find(g => g.id === id)?.name).filter(Boolean).join(" · ");

  const formatTime = t => {
    const d = new Date(`1970-01-01T${t}`);
    return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false });
  };

  const formatDate = s =>
    new Date(s).toLocaleDateString("vi-VN", { weekday: "short", day: "2-digit", month: "2-digit" });

  const getUniqueDates = showtimes =>
    [...new Set(showtimes.map(s => s.date))].sort();

  const getValidShowtimes = (showtimes, date) =>
    showtimes.filter(s => s.date === date && !isShowtimePassed(s));

  return (
    <>
      <div className="nike-page" style={{ paddingTop: '32px' }}>
        {/* Header */}
        <div style={{ borderBottom: '2px solid #111111', paddingBottom: '16px', marginBottom: '32px' }}>
          <h1 className="nike-h1">LỊCH CHIẾU — {cinema.name}</h1>
        </div>

        {/* Movie rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {movies.map(m => {
            const uniqueDates = getUniqueDates(m.showtimes).filter(d => getValidShowtimes(m.showtimes, d).length > 0);
            const currentDate = selectedDates[m.id] || uniqueDates[0];
            const currentShowtimes = getValidShowtimes(m.showtimes, currentDate);

            return (
              <div key={m.id} style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: '32px', padding: '32px 0', borderBottom: '1px solid #E5E5E5', alignItems: 'start' }}>
                {/* Poster */}
                <img
                  src={m.poster}
                  alt={m.title}
                  style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover', cursor: 'pointer' }}
                  onClick={() => navigate(`/movie/${m.id}`)}
                />

                {/* Details */}
                <div>
                  <h2
                    style={{ fontSize: '20px', fontWeight: '700', color: '#111111', marginBottom: '4px', cursor: 'pointer' }}
                    onClick={() => navigate(`/movie/${m.id}`)}
                  >
                    {m.title}
                  </h2>
                  <p style={{ fontSize: '14px', color: '#707072', marginBottom: '20px' }}>
                    {getGenreNames(m.genre_ids)} &nbsp;·&nbsp; {m.duration} phút
                  </p>

                  {/* Date Pills */}
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                    {uniqueDates.map(date => (
                      <button
                        key={date}
                        className={`nike-pill ${currentDate === date ? 'active' : ''}`}
                        style={{ fontSize: '12px', padding: '6px 14px' }}
                        onClick={() => setSelectedDates(prev => ({ ...prev, [m.id]: date }))}
                      >
                        {formatDate(date)}
                      </button>
                    ))}
                  </div>

                  {/* Time Slots */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {currentShowtimes.length > 0 ? currentShowtimes.map(s => (
                      <button
                        key={s.id}
                        onClick={() => { setSelectedMovieId(m.id); setSelectedShowtime({ ...s, movieTitle: m.title }); }}
                        style={{
                          padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', textAlign: 'center',
                          border: '1.5px solid #CACACB', background: '#FAFAFA',
                          fontWeight: '500', transition: 'all 200ms ease',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#111111'; e.currentTarget.style.background = '#111111'; e.currentTarget.style.color = 'white'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#CACACB'; e.currentTarget.style.background = '#FAFAFA'; e.currentTarget.style.color = '#111111'; }}
                      >
                        <div style={{ fontSize: '16px', fontWeight: '700' }}>{formatTime(s.start_time)}</div>
                        <div style={{ fontSize: '11px', color: 'inherit', opacity: 0.7, marginTop: '2px' }}>
                          {Number(s.price).toLocaleString()} đ
                        </div>
                      </button>
                    )) : (
                      <p style={{ color: '#9E9EA0', fontSize: '14px' }}>Không có suất chiếu khả dụng.</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Confirm Modal */}
      <Modal show={!!selectedShowtime} onHide={() => setSelectedShowtime(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>XÁC NHẬN ĐẶT VÉ</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: '24px' }}>
          {selectedShowtime && (
            <div style={{ background: '#FAFAFA', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#707072', fontSize: '14px' }}>Phim</span>
                <span style={{ fontWeight: '600', fontSize: '14px' }}>{selectedShowtime.movieTitle}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#707072', fontSize: '14px' }}>Rạp</span>
                <span style={{ fontWeight: '600', fontSize: '14px' }}>{cinema.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#707072', fontSize: '14px' }}>Ngày</span>
                <span style={{ fontWeight: '600', fontSize: '14px' }}>{formatDate(selectedShowtime.date)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#707072', fontSize: '14px' }}>Giờ chiếu</span>
                <span style={{ fontWeight: '600', fontSize: '14px' }}>{formatTime(selectedShowtime.start_time)}</span>
              </div>
              <hr style={{ borderColor: '#E5E5E5', margin: '4px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#707072', fontSize: '14px' }}>Giá vé</span>
                <span style={{ fontWeight: '700', fontSize: '16px' }}>{Number(selectedShowtime.price).toLocaleString()} đ</span>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer style={{ borderTop: 'none', padding: '0 24px 24px' }}>
          <button
            className="btn-nike-primary"
            style={{ width: '100%', padding: '14px' }}
            onClick={() => navigate(`/booking/${selectedMovieId}`, { state: { showtimeId: selectedShowtime?.id } })}
          >
            Tiếp tục đặt vé
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ShowTime;
