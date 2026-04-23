import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Carousel from "react-bootstrap/Carousel";
import { FaPlay } from "react-icons/fa";
import "../../CSS/Nike.css";

import movieService from "../../services/movieService";
import movieTypeService from "../../services/movieTypeService";
import { useAuth } from "../../context/AuthContext";

function HomePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // Admin redirect — admin không được vào trang home, nhảy thẳng vào dashboard
  useEffect(() => {
    if (isAuthenticated && user?.role === "ADMIN") {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, user, navigate]);
  const [data, setData] = useState([]);
  const [movieType, setMovieType] = useState([]);
  const [selectedMovieType, setSelectedMovieType] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [selectedMovie, setSelectedMovie] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [moviesRes, typesRes] = await Promise.all([
          movieService.getAllActive(),
          movieTypeService.getAllActive()
        ]);

        setData(moviesRes.data || []);

        const types = typesRes.data || [];
        setMovieType(types);

        if (types.length > 0) {
          setSelectedMovieType(types[0].id);
        }
      } catch (error) {
        console.error("Error fetching homepage data:", error);
      }
    };

    fetchData();
  }, []);



  const filteredData = selectedMovieType
    ? data.filter(movie => movie.movieType?.id === selectedMovieType)
    : data;


  const getGenreNames = (genresList) =>
    genresList ? genresList.map((g) => g.name).filter(Boolean).join(" · ") : "";

  const openModal = (movie) => {
    setVideoUrl(movie.videoUrl || "");
    setSelectedMovie(movie);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setVideoUrl("");
    setSelectedMovie(null);
  };

  return (
    <>
      {/* Hero Carousel */}
      <div className="nike-hero">
        <Carousel slide interval={5000} controls indicators={false}>
          {data.map((movie, idx) => (
            <Carousel.Item key={idx}>
              <div style={{ position: 'relative', height: '560px', overflow: 'hidden' }}>
                <img
                  src={movie.banner}
                  alt={movie.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                <div className="nike-hero-overlay">
                  <h1 style={{ fontSize: '56px', fontWeight: '700', color: 'white', textTransform: 'uppercase', lineHeight: '0.95', marginBottom: '20px' }}>
                    {movie.title}
                  </h1>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      className="btn-nike-primary"
                      onClick={() => navigate(`/movie/${movie.id}`)}
                    >
                      Mua vé ngay
                    </button>
                    <button
                      className="btn-nike-secondary"
                      style={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(4px)' }}
                      onClick={() => openModal(movie)}
                    >
                      ▶ Xem trailer
                    </button>
                  </div>
                </div>
              </div>
            </Carousel.Item>
          ))}
        </Carousel>
      </div>

      {/* Content Section */}
      <div className="nike-page">
        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', flexWrap: 'wrap' }}>
          {movieType.map((type) => (
            <button
              key={type.id}
              className={`nike-pill ${selectedMovieType === type.id ? 'active' : ''}`}
              onClick={() => setSelectedMovieType(type.id)}
            >
              {type.name}
            </button>
          ))}
        </div>

        {/* Section Heading */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '24px' }}>
          <h2 className="nike-h1">
            {movieType.find(t => t.id === selectedMovieType)?.name || "Phim"}
          </h2>
          <a href="/movie" style={{ fontSize: '14px', fontWeight: '500', color: '#111111', textDecoration: 'underline' }}>
            Xem tất cả
          </a>
        </div>

        {/* Movie Grid */}
        <div className="nike-movie-grid">
          {filteredData.length > 0 ? (
            filteredData.map((movie) => (
              <div
                key={movie.id}
                className="nike-card"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/movie/${movie.id}`)}
              >
                <div style={{ position: 'relative' }}>
                  <img src={movie.poster} alt={movie.title} style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover' }} />
                  <button
                    style={{
                      position: 'absolute', top: '50%', left: '50%',
                      transform: 'translate(-50%, -50%)',
                      background: 'rgba(0,0,0,0.6)', border: 'none',
                      borderRadius: '50%', width: '56px', height: '56px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', opacity: 0, transition: 'opacity 200ms ease',
                    }}
                    className="play-btn"
                    onClick={(e) => { e.stopPropagation(); openModal(movie); }}
                  >
                    <FaPlay size={20} color="white" />
                  </button>
                </div>
                <div className="nike-card-body">
                  <div className="nike-card-title">{movie.title}</div>
                  <div className="nike-caption">Thể loại: {movie.genres?.join(" ,") || ""}</div>
                  <div className="nike-small" style={{ marginTop: '4px' }}>Thời lượng: {movie.duration} phút</div>
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: '#707072', gridColumn: '1/-1', textAlign: 'center', padding: '48px 0' }}>
              Không có phim nào.
            </p>
          )}
        </div>
      </div>

      {/* Trailer Modal */}
      <Modal show={showModal} onHide={closeModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{selectedMovie?.title} — Trailer</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: '0' }}>
          <iframe
            width="100%"
            height="415"
            src={videoUrl}
            title="Movie Trailer"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </Modal.Body>
      </Modal>

      <style>{`
        .nike-card:hover .play-btn { opacity: 1 !important; }
      `}</style>
    </>
  );
}

export default HomePage;
