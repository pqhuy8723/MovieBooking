import { FaPlay } from "react-icons/fa";
import { useState, useEffect } from "react";
import "../../CSS/MoviePage.css";
import { Modal, Button, Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import { IoTicketOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

function MoviePage() {
  const navigate = useNavigate();
  const [movie, setMovie] = useState([]);
  const [movieType, setMovieType] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedMovieType, setSelectedMovieType] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [cinema, setCinema] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  const [language, setLanguage] = useState([]);
  const [showTime, setShowTime] = useState([]);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await fetch("http://localhost:3001/movies");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const moviesData = await response.json();
        setMovie(Array.isArray(moviesData) ? moviesData : []);
      } catch (error) {
        console.error("Error fetching movies:", error);
        setMovie([]);
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

    const fetchCinema = async () => {
      try {
        const response = await fetch("http://localhost:3001/cinema/1");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const cinemaData = await response.json();
        setCinema(cinemaData);
      } catch (error) {
        console.error("Error fetching cinema:", error);
        setCinema([]);
      }
    };

    const fetchLanguages = async () => {
      try {
        const response = await fetch("http://localhost:3001/languages");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const languagesData = await response.json();
        setLanguage(Array.isArray(languagesData) ? languagesData : []);
      } catch (error) {
        console.error("Error fetching languages:", error);
        setLanguage([]);
      }
    };

    fetchMovies();
    fetchGenres();
    fetchMovieTypes();
    fetchCinema();
    fetchLanguages();
  }, []);


  const handleMovieTypeFilter = (type) => {
    setSelectedMovieType(type.id);
  };

  const handleBookTicket = (movieId) => {
    fetch(`http://localhost:3001/movies/${movieId}`)
      .then((response) => response.json())
      .then((data) => {
        if (data?.showtimes?.length > 0) {
          setShowTime(data.showtimes);
          const earliestDate = data.showtimes.map((s) => s.date).sort()[0];
          setSelectedDate(earliestDate);
          setSelectedMovie(movieId);
        } else {
          setShowTime([]);
          setSelectedDate("");
        }
  
        setShowBookingModal(true);
        setShowModal(false);
        setSelectedShowtime(null);
      });
  };
  

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
    });
  };
  const formatTime = (timeString) => {
    const time = new Date(`1970-01-01T${timeString}`);
    return time.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };
  const filteredData = movie.filter(
    (movies) => String(movies.movie_type) === String(selectedMovieType)
  );

  const getGenreNames = (genreIds) =>
    genreIds
      .map((id) => genres.find((genre) => genre.id === id)?.name)
      .join(", ");

  const getLanguageName = (languageId) =>
    language.find((lang) => lang.id === languageId)?.name;

  const openModal = (movie) => {
    setSelectedMovie(movie);
    setShowModal(true);
    setShowBookingModal(false);
    setSelectedShowtime(null);
  };

  const closeModal = () => {
    setShowModal(false);
    setShowBookingModal(false);
    setSelectedShowtime(null);
    setSelectedMovie(null);
  };

  const handleShowtimeClick = (showtime) => {
    setSelectedShowtime(showtime);
    setShowModal(false);
    setShowBookingModal(true);
  };

  const handleCloseModal = () => {
    setSelectedShowtime(null);
  };
  const handleConfirmBooking = () => {
    if (selectedShowtime && selectedMovie) {
      navigate(`/booking/${selectedMovie}`, { 
        state: { showtimeId: selectedShowtime.id, movieId: selectedMovie.id }
      });
    } else {
      console.error("Movie or Showtime not selected");
    }
  };
  
  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  // Helper function to check if showtime has passed
  const isShowtimePassed = (showtime) => {
    const now = new Date();
    const showtimeDate = new Date(showtime.date);
    const showtimeTime = showtime.start_time.split(":").map(Number);
    
    const showtimeDateTime = new Date(showtimeDate);
    showtimeDateTime.setHours(showtimeTime[0], showtimeTime[1], showtimeTime[2] || 0, 0);
    
    return showtimeDateTime < now;
  };

  const filteredShowtimes = showTime.filter(
    (showtime) => showtime.date === selectedDate && !isShowtimePassed(showtime)
  );

  return (
    <>
      <div className="movie-page-content">
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
                  className="movie-items" 
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
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBookTicket(movie.id);
                      }}
                    >
                      <IoTicketOutline
                        style={{ marginRight: "8px", fontSize: "1.5rem" }}
                      />
                      Đặt vé
                    </Button>
                  </div>
                </div>
              );
            })
          ) : (
            <p>Đang load phim</p>
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
            src={selectedMovie?.video_url}
            title="Movie Trailer"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </Modal.Body>
      </Modal>

      <Modal show={showBookingModal} onHide={closeModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Lịch chiếu: {selectedMovie?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h5 style={{ margin: "1rem", textAlign: "center", fontSize: "2rem" }}>
            {cinema.name}
          </h5>
          <div className="container">
            <div className="date-selector">
              {showTime
                .map((s) => s.date)
                .filter((value, index, self) => self.indexOf(value) === index)
                .map((date) => (
                  <div
                    key={date}
                    className={`date-item ${selectedDate === date ? "active" : ""
                      }`}
                    onClick={() => handleDateClick(date)}
                  >
                    {formatDate(date)}
                  </div>
                ))}
            </div>
            <div className="schedule">
              <h2>{getLanguageName(movie.language_id)}</h2>
              {filteredShowtimes.length > 0 ? (
                <div className="time-slot">
                  {filteredShowtimes.map((showtime) => (
                    <div
                      key={showtime.id}
                      className="time-box"
                      onClick={() => handleShowtimeClick(showtime)}
                    >
                      <p>{formatTime(showtime.start_time)}</p>
                      <span>Giá vé: {showtime.price.toLocaleString()} VNĐ</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p>Không có suất chiếu nào cho ngày này.</p>
              )}
            </div>
          </div>
        </Modal.Body>
      </Modal>
      <Modal
        show={selectedShowtime}
        onHide={handleCloseModal}
        centered
        className="custom-modal"
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Bạn đang đặt vé xem phim</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedShowtime && (
            <>
              <h5>{selectedMovie?.title}</h5>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Rạp chiếu</th>
                    <th>Ngày chiếu</th>
                    <th>Giờ chiếu</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{cinema.name}</td>
                    <td>{selectedShowtime.date}</td>
                    <td>{formatTime(selectedShowtime.start_time)}</td>
                  </tr>
                </tbody>
              </Table>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
        <Button variant="primary" onClick={handleConfirmBooking}>
      <IoTicketOutline
        style={{ marginRight: "8px", fontSize: "1.5rem" }}
      />
      Đặt vé
    </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default MoviePage;
