import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../CSS/Nike.css";
import movieService from "../../services/movieService";
import showtimeService from "../../services/showtimeService";

const MovieDetail = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const movieData = await movieService.getById(id);
        setMovie(movieData.data);
        
        const showtimeData = await showtimeService.getByMovieId(id);
        const activeShowtimes = showtimeData.data.filter(s => s.status === 'ACTIVE');
        setShowtimes(activeShowtimes);
        
        if (activeShowtimes.length > 0) {
            const uniqueDates = [...new Set(activeShowtimes.map(s => s.date))].sort();
            setSelectedDate(uniqueDates[0]);
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu phim:", error);
      }
    };
    
    fetchData();
  }, [id]);

  if (!movie) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
      <div className="spinner-border text-dark" role="status" />
    </div>
  );

  const getGenreNames = (genresList) => genresList?.map(g => g.name).join(" · ") || "Chưa cập nhật";
  const getActorNames = (actorsList) => actorsList?.map(a => a.name).join(", ") || "Chưa cập nhật";
  const getDirectorNames = (directorsList) => directorsList?.map(d => d.name).join(", ") || "Chưa cập nhật";
  const formatDate = s => new Date(s).toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit" });
  const formatTime = t => {
    if (!t) return "";
    const [h, m] = t.split(":").map(Number);
    const d = new Date(); d.setHours(h, m, 0);
    return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false });
  };

  const uniqueDates = [...new Set(showtimes.map(s => s.date))].sort();
  const filteredShowtimes = showtimes.filter(s => s.date === selectedDate);
  
  const showtimesByCinema = filteredShowtimes.reduce((acc, s) => {
    if (!acc[s.cinemaName]) acc[s.cinemaName] = [];
    acc[s.cinemaName].push(s);
    return acc;
  }, {});

  const metaItems = [
    { label: "Đạo diễn", value: getDirectorNames(movie.directors) },
    { label: "Diễn viên", value: getActorNames(movie.actors) },
    { label: "Thể loại", value: getGenreNames(movie.genres) },
    { label: "Thời lượng", value: `${movie.duration} phút` },
    { label: "Ngôn ngữ", value: movie.language?.name || "Chưa cập nhật" },
    { label: "Khởi chiếu", value: movie.releaseDate || movie.release_date || "Chưa cập nhật" },
  ];

  return (
    <div style={{ fontFamily: 'Helvetica, Arial, sans-serif', background: '#FFFFFF', minHeight: '80vh' }}>
      {/* Breadcrumb */}
      <div style={{ background: '#F5F5F5', padding: '12px 48px', borderBottom: '1px solid #E5E5E5' }}>
        <button onClick={() => navigate('/movie')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#707072', fontSize: '14px', fontWeight: '500', padding: 0 }}>
          ← Danh sách phim
        </button>
      </div>

      {/* Main content */}
      <div className="nike-page" style={{ paddingTop: '48px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '64px', alignItems: 'start' }}>
          {/* Poster */}
          <div>
            <img
              src={movie.poster}
              alt={movie.title}
              style={{ width: '100%', borderRadius: '0', display: 'block' }}
            />
          </div>

          {/* Info */}
          <div>
            <h1 style={{ fontSize: '40px', fontWeight: '700', textTransform: 'uppercase', color: '#111111', lineHeight: '1.1', marginBottom: '16px' }}>
              {movie.title}
            </h1>
            <p style={{ fontSize: '16px', color: '#707072', lineHeight: '1.75', marginBottom: '32px' }}>
              {movie.description}
            </p>

            {/* Meta grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 32px', marginBottom: '40px', borderTop: '1px solid #E5E5E5', paddingTop: '32px' }}>
              {metaItems.map((item, i) => (
                <div key={i}>
                  <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9E9EA0', marginBottom: '4px' }}>{item.label}</div>
                  <div style={{ fontSize: '15px', fontWeight: '500', color: '#111111' }}>{item.value}</div>
                </div>
              ))}
            </div>

            {/* Showtime Picker */}
            <div style={{ borderTop: '2px solid #111111', paddingTop: '32px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', textTransform: 'uppercase', color: '#111111', marginBottom: '20px' }}>
                Chọn suất chiếu
              </h2>

              {/* Date pills */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
                {uniqueDates.map(date => (
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

              {/* Time slots grouped by cinema */}
              <div style={{ marginBottom: '32px' }}>
                {Object.keys(showtimesByCinema).length === 0 ? (
                  <p style={{ fontSize: '14px', color: '#707072' }}>Không có suất chiếu nào trong ngày này.</p>
                ) : (
                  Object.keys(showtimesByCinema).map(cinemaName => (
                    <div key={cinemaName} style={{ marginBottom: '24px' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#111111', marginBottom: '12px' }}>
                        {cinemaName}
                      </h3>
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        {showtimesByCinema[cinemaName].map(s => (
                          <button
                            key={s.id}
                            onClick={() => setSelectedShowtime(s)}
                            style={{
                              padding: '12px 20px', borderRadius: '8px', cursor: 'pointer', textAlign: 'center',
                              border: selectedShowtime?.id === s.id ? '2px solid #111111' : '1.5px solid #CACACB',
                              background: selectedShowtime?.id === s.id ? '#111111' : '#FAFAFA',
                              color: selectedShowtime?.id === s.id ? 'white' : '#111111',
                              fontWeight: '500', transition: 'all 200ms ease', minWidth: '90px'
                            }}
                          >
                            <div style={{ fontSize: '18px', fontWeight: '700' }}>{formatTime(s.startTime)}</div>
                            <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.8 }}>{Number(s.price).toLocaleString()} đ</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <button
                className="btn-nike-primary"
                style={{ padding: '14px 48px', fontSize: '16px', opacity: selectedShowtime ? 1 : 0.4, cursor: selectedShowtime ? 'pointer' : 'not-allowed' }}
                disabled={!selectedShowtime}
                onClick={() => navigate(`/booking/${movie.id}`, { state: { showtimeId: selectedShowtime?.id } })}
              >
                Đặt vé ngay
              </button>
            </div>
          </div>
        </div>

        {/* Trailer */}
        {movie.videoUrl && (
          <div style={{ marginTop: '80px', borderTop: '1px solid #E5E5E5', paddingTop: '48px' }}>
            <h2 className="nike-h1" style={{ marginBottom: '24px' }}>TRAILER</h2>
            <div style={{ position: 'relative', paddingBottom: '56.25%', background: '#111111' }}>
              <iframe
                src={movie.videoUrl}
                title="Trailer"
                frameBorder="0"
                allowFullScreen
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieDetail;
