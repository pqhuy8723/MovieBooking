import React, { useState, useEffect } from "react";
import { Modal, Button, Table } from "react-bootstrap";
import "../../CSS/ShowTime.css";
import { IoTicketOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

function ShowTime() {
  const [selectedDates, setSelectedDates] = useState({});
  const [movie, setMovie] = useState([]);
  const [genres, setGenres] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [cinema, setCinema] = useState([]);
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  const [selectedMovieId, setSelectedMovieId] = useState(null);
  const navigate = useNavigate();

  // Helper function to check if showtime has passed
  const isShowtimePassed = (showtime) => {
    const now = new Date();
    const showtimeDate = new Date(showtime.date);
    const showtimeTime = showtime.start_time.split(":").map(Number);
    
    const showtimeDateTime = new Date(showtimeDate);
    showtimeDateTime.setHours(showtimeTime[0], showtimeTime[1], showtimeTime[2] || 0, 0);
    
    return showtimeDateTime < now;
  };

  useEffect(() => {
    const fakeData = [{
      id: "M1",
      title: "Phim Dummy Showtimes",
      poster: "https://via.placeholder.com/200x300",
      genre_ids: [1],
      duration: 120,
      language_id: 1,
      showtimes: [
        { id: "S1", date: "2026-05-15", start_time: "10:00:00", end_time: "12:00:00", price: 50000 },
        { id: "S2", date: "2026-05-16", start_time: "14:00:00", end_time: "16:00:00", price: 55000 }
      ]
    }];
    
    setMovie(fakeData);
    const initialDates = {};
    fakeData.forEach((m) => {
        if (m.showtimes?.length > 0) {
        const validShowtimes = m.showtimes.filter((st) => !isShowtimePassed(st));
        if (validShowtimes.length > 0) {
            const minDate = validShowtimes.map((st) => st.date).sort()[0];
            initialDates[m.id] = minDate;
        }
        }
    });
    setSelectedDates(initialDates);
    
    setGenres([{ id: 1, name: "Hành Động" }]);
    setLanguages([{ id: 1, name: "Tiếng Việt" }]);
    setCinema({ name: "Cinema Dummy 1" });
  }, []);

  const getUniqueDates = (showtimes) => {
    const uniqueDates = [...new Set(showtimes.map((time) => time.date))];
    return uniqueDates.sort();
  };

  const getGenreNames = (genreIds) =>
    genreIds
      .map((id) => genres.find((genre) => genre.id === id)?.name)
      .join(", ");

  const getLanguageName = (languageId) =>
    languages.find((language) => language.id === languageId)?.name;

  const formatTime = (timeString) => {
    const time = new Date(`1970-01-01T${timeString}`);
    return time.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
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

  const handleDateClick = (movieId, date) => {
    setSelectedDates((prev) => ({
      ...prev,
      [movieId]: date,
    }));
  };

  const handleShowtimeClick = (movieId, showtime) => {
    setSelectedMovieId(movieId); // Set selected movie ID
    setSelectedShowtime(showtime); // Set selected showtime to open modal
  };

  const handleBookTicket = () => {
    if (selectedShowtime && selectedMovieId) {
      // Navigate to booking page with selected movieId and showtimeId
      navigate(`/booking/${selectedMovieId}`, {
        state: { showtimeId: selectedShowtime.id, movieId: selectedMovieId }
      });
    }
  };

  const handleCloseModal = () => {
    setSelectedShowtime(null);
  };

  return (
    <div className="movie-container">
      {movie.map((movie) => (
        <div key={movie.id} className="movie-details">
          <div className="movie-poster">
            <img
              src={movie.poster || "https://via.placeholder.com/200x300"}
              alt={movie.title || "Untitled Movie"}
            />
          </div>

          <div className="movie-infos">
            <h2 className="movie-title">{movie.title || "Untitled Movie"}</h2>
            <div className="movie-genre">
              <span>{getGenreNames(movie.genre_ids)}</span> •{" "}
              {movie.duration || 0} phút
            </div>

            <div className="showtime-section">
              <h3>{getLanguageName(movie.language_id)}</h3>
              <div className="date-navigation">
                {movie.showtimes?.length > 0 &&
                  getUniqueDates(movie.showtimes)
                    .filter((date) => {
                      // Filter out dates that have no valid showtimes (all showtimes have passed)
                      const now = new Date();
                      const showtimesForDate = movie.showtimes.filter((st) => {
                        if (st.date !== date) return false;
                        const showtimeDate = new Date(st.date);
                        const showtimeTime = st.start_time.split(":").map(Number);
                        const showtimeDateTime = new Date(showtimeDate);
                        showtimeDateTime.setHours(showtimeTime[0], showtimeTime[1], showtimeTime[2] || 0, 0);
                        return showtimeDateTime >= now;
                      });
                      return showtimesForDate.length > 0;
                    })
                    .map((date, idx) => (
                      <div
                        key={idx}
                        className={`date-item ${
                          selectedDates[movie.id] === date ? "active" : ""
                        }`}
                        onClick={() => handleDateClick(movie.id, date)}
                      >
                        {formatDate(date)}
                      </div>
                    ))}
              </div>
              <div className="showtimess">
                {movie.showtimes
                  ?.filter(
                    (showtime) => {
                      // Filter by date
                      if (showtime.date !== selectedDates[movie.id]) {
                        return false;
                      }
                      
                      // Check if showtime has passed
                      const now = new Date();
                      const showtimeDate = new Date(showtime.date);
                      const showtimeTime = showtime.start_time.split(":").map(Number);
                      
                      const showtimeDateTime = new Date(showtimeDate);
                      showtimeDateTime.setHours(showtimeTime[0], showtimeTime[1], showtimeTime[2] || 0, 0);
                      
                      return showtimeDateTime >= now;
                    }
                  )
                  .map((showtime, idx) => (
                    <div
                      key={idx}
                      className="showtime-item"
                      onClick={() => handleShowtimeClick(movie.id, showtime)}
                    >
                      <span>{formatTime(showtime.start_time)}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Modal to display selected showtime */}
      <Modal
        show={selectedShowtime !== null} // Open modal if selectedShowtime is not null
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
              <h5>{movie.find((m) => m.id === selectedMovieId)?.title}</h5>
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
          <Button variant="primary" onClick={handleBookTicket}>
            <IoTicketOutline style={{ marginRight: "8px", fontSize: "1.5rem" }} />
            Đặt vé
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default ShowTime;
