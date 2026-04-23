import { FaPlay, FaSearch } from "react-icons/fa";
import { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "../../CSS/Nike.css";
import movieService from "../../services/movieService";
import movieTypeService from "../../services/movieTypeService";

function MoviePage() {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [movieTypes, setMovieTypes] = useState([]);
  const [selectedTypeId, setSelectedTypeId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [moviesRes, typesRes] = await Promise.all([
          movieService.getAllActive(),
          movieTypeService.getAllActive(),
        ]);
        const movieList = moviesRes.data || [];
        const typeList = typesRes.data || [];
        setMovies(movieList);
        setMovieTypes(typeList);
        if (typeList.length > 0) setSelectedTypeId(typeList[0].id);
      } catch (err) {
        console.error("Lỗi tải dữ liệu:", err);
        setError("Không thể tải danh sách phim. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredMovies = movies.filter((m) => {
    const matchType = selectedTypeId ? m.movieType?.id === selectedTypeId : true;
    const matchSearch = m.title?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchSearch;
  });

  const openTrailer = (e, m) => {
    e.stopPropagation();
    setSelectedMovie(m);
    setShowModal(true);
  };

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
      <div className="spinner-border text-dark" role="status" />
    </div>
  );

  if (error) return (
    <div style={{ textAlign: "center", padding: "64px", color: "#707072" }}>{error}</div>
  );

  return (
    <>
      <div className="nike-page" style={{ paddingTop: "32px" }}>

        {/* Header row: filter pills + search */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", marginBottom: "32px" }}>

          {/* Movie type pills */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button
              className={`nike-pill ${selectedTypeId === null ? "active" : ""}`}
              onClick={() => setSelectedTypeId(null)}
            >
              Tất cả
            </button>
            {movieTypes.map((type) => (
              <button
                key={type.id}
                className={`nike-pill ${selectedTypeId === type.id ? "active" : ""}`}
                onClick={() => setSelectedTypeId(type.id)}
              >
                {type.name}
              </button>
            ))}
          </div>


        </div>

        <h1 className="nike-h1" style={{ marginBottom: "24px" }}>
          {selectedTypeId
            ? movieTypes.find((t) => t.id === selectedTypeId)?.name?.toUpperCase()
            : "TẤT CẢ PHIM"}
        </h1>

        {/* Movie Grid */}
        <div className="nike-movie-grid">
          {filteredMovies.length > 0 ? (
            filteredMovies.map((m) => (
              <div key={m.id} style={{ cursor: "pointer" }} onClick={() => navigate(`/movie/${m.id}`)}>
                <div style={{ position: "relative" }}>
                  <img
                    src={m.poster}
                    alt={m.title}
                    style={{ width: "100%", aspectRatio: "2/3", objectFit: "cover", display: "block" }}
                  />
                  {/* Trailer button */}
                  {m.videoUrl && (
                    <button
                      style={{
                        position: "absolute", top: "12px", right: "12px",
                        background: "rgba(0,0,0,0.7)", border: "none", borderRadius: "50%",
                        width: "40px", height: "40px",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer",
                      }}
                      onClick={(e) => openTrailer(e, m)}
                    >
                      <FaPlay size={14} color="white" />
                    </button>
                  )}
                  {/* Movie type badge */}
                  {m.movieType?.name && (
                    <div style={{
                      position: "absolute", top: "12px", left: "12px",
                      background: "#111111", color: "#FFFFFF",
                      fontSize: "10px", fontWeight: "700",
                      padding: "3px 8px", borderRadius: "4px",
                      textTransform: "uppercase", letterSpacing: "0.05em",
                    }}>
                      {m.movieType.name}
                    </div>
                  )}
                </div>
                <div style={{ padding: "12px 0" }}>
                  <div style={{ fontSize: "16px", fontWeight: "500", color: "#111111", marginBottom: "4px" }}>{m.title}</div>
                  <div style={{ fontSize: "14px", color: "#707072" }}>{m.genres?.join(" · ")}</div>
                  <div style={{ fontSize: "12px", color: "#9E9EA0", marginTop: "4px" }}>{m.duration} phút</div>
                  <button
                    className="btn-nike-primary"
                    style={{ marginTop: "12px", width: "100%", padding: "10px", fontSize: "14px" }}
                    onClick={(e) => { e.stopPropagation(); navigate(`/movie/${m.id}`); }}
                  >
                    Mua vé
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: "#707072", gridColumn: "1/-1", textAlign: "center", padding: "64px 0" }}>
              Không có phim nào phù hợp.
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
          <iframe
            width="100%"
            height="415"
            src={selectedMovie?.videoUrl}
            title="Trailer"
            frameBorder="0"
            allowFullScreen
          />
        </Modal.Body>
      </Modal>
    </>
  );
}

export default MoviePage;
