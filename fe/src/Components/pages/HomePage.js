import Carousel from "react-bootstrap/Carousel";
import { FaPlay } from "react-icons/fa";
import "../../CSS/HomePage.css";
import { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

function HomePage() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [movieType, setMovieType] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedMovieType, setSelectedMovieType] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [selectedMovie, setSelectedMovie] = useState(null);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await fetch("http://localhost:3001/movies");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const moviesData = await response.json();
        setData(Array.isArray(moviesData) ? moviesData : []);
      } catch (error) {
        console.error("Error fetching movies:", error);
        setData([]);
      }
    };

    const fetchGenres = async () => {
      try {
        const response = await fetch("http://localhost:3001/genres");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const genresData = await response.json();
        setGenres(Array.isArray(genresData) ? genresData : []);
      } catch (error) {
        console.error("Error fetching genres:", error);
        setGenres([]);
      }
    };

    const fetchMovieTypes = async () => {
      try {
        const response = await fetch("http://localhost:3001/movietypes");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const typesData = await response.json();
        setMovieType(Array.isArray(typesData) ? typesData : []);
        // Set default selectedMovieType to first movie type if available
        if (Array.isArray(typesData) && typesData.length > 0) {
          setSelectedMovieType(typesData[0].id);
        }
      } catch (error) {
        console.error("Error fetching movie types:", error);
        setMovieType([]);
      }
    };

    fetchMovies();
    fetchGenres();
    fetchMovieTypes();
  }, []);

  const handleMovieTypeFilter = (type) => {
    setSelectedMovieType(type.id);
  };

  const filteredData = data.filter(
    (movie) => String(movie.movie_type) === String(selectedMovieType)
  );

  const getGenreNames = (genreIds) =>
    genreIds
      .map((id) => genres.find((genre) => genre.id === id)?.name)
      .join(", ");

  const openModal = (movie) => {
    setVideoUrl(movie.video_url);
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
      <Carousel slide interval={5000}>
        {data.map((movie, index) => (
          <Carousel.Item key={index}>
            <img
              className="d-block w-100"
              src={movie.banner}
              alt={`Slide ${index + 1}`}
              style={{ 
                objectFit: "cover",
                objectPosition: "center",
                width: "100%",
                height: "100%"
              }}
            />
          </Carousel.Item>
        ))}
      </Carousel>

      <div className="home-page-content">
        <nav className="navi">
          {movieType.length > 0 ? (
            movieType.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => handleMovieTypeFilter(type)}
                className={selectedMovieType === type.id ? "actived" : ""}
              >
                {type.name}
              </button>
            ))
          ) : (
            <p>Loading movie types...</p>
          )}
        </nav>

        <div className="movie-list">
          {filteredData.length > 0 ? (
            filteredData.map((movie) => {
              return (
                <div 
                  className="movie-item" 
                  key={movie.id}
                  onClick={() => navigate(`/movie/${movie.id}`)}
                >
                  <div className="image-container">
                    <img
                      src={
                        movie.poster || "https://via.placeholder.com/200x300"
                      }
                      alt={movie.title}
                    />
                    <div
                      className="overlay-icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        openModal(movie);
                      }}
                    >
                      <FaPlay size={40} color="white" />
                    </div>
                  </div>
                  <div className="movie-content">
                    <h3 className="movie-title">{movie.title}</h3>
                    <ul>
                      <li>
                        <span>Thể loại:</span> {getGenreNames(movie.genre_ids)}
                      </li>
                      <li>
                        <span>Thời lượng:</span> {movie.duration || "N/A"} phút
                      </li>
                      <li>
                        <span>Ngày khởi chiếu:</span>{" "}
                        {movie.release_date || "N/A"}
                      </li>
                    </ul>
                  </div>
                </div>
              );
            })
          ) : (
            <p>Loading movies...</p>
          )}
        </div>
      </div>

      <Modal show={showModal} onHide={closeModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Trailer: {selectedMovie?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <iframe
            width="100%"
            height="415"
            src={videoUrl}
            title="Movie Trailer"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default HomePage;
