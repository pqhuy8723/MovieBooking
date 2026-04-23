package be.movie36.service;

import be.movie36.dto.request.ShowtimeRequest;
import be.movie36.dto.response.ShowtimeResponse;
import be.movie36.entity.Movie;
import be.movie36.entity.Screen;
import be.movie36.entity.Showtime;
import be.movie36.enums.Status;
import be.movie36.exception.AppException;
import be.movie36.exception.ErrorCode;
import be.movie36.repository.MovieRepository;
import be.movie36.repository.ScreenRepository;
import be.movie36.repository.ShowtimeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ShowtimeService {
    private final ShowtimeRepository showtimeRepository;
    private final MovieRepository movieRepository;
    private final ScreenRepository screenRepository;
    private final be.movie36.repository.BookingRepository bookingRepository;

    public ShowtimeResponse create(ShowtimeRequest request) {
        Movie movie = movieRepository.findById(request.getMovieId())
                .orElseThrow(() -> new AppException(ErrorCode.MOVIE_NOT_FOUND));

        Screen screen = screenRepository.findById(request.getScreenId())
                .orElseThrow(() -> new AppException(ErrorCode.SCREEN_NOT_FOUND));

        // Time overlap validation
        List<Showtime> overlaps = showtimeRepository.findOverlappingShowtimes(
                screen.getId(), request.getDate(), request.getStartTime(), request.getEndTime(), Status.ACTIVE, null);
        if (!overlaps.isEmpty()) {
            throw new AppException(ErrorCode.SHOWTIME_TIME_CONFLICT);
        }

        Showtime showtime = Showtime.builder()
                .date(request.getDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .price(request.getPrice())
                .movie(movie)
                .screen(screen)
                .status(parseStatus(request.getStatus()))
                .build();

        return toResponse(showtimeRepository.save(showtime));
    }

    public ShowtimeResponse update(Long id, ShowtimeRequest request) {
        Showtime showtime = findById(id);

        Movie movie = movieRepository.findById(request.getMovieId())
                .orElseThrow(() -> new AppException(ErrorCode.MOVIE_NOT_FOUND));

        Screen screen = screenRepository.findById(request.getScreenId())
                .orElseThrow(() -> new AppException(ErrorCode.SCREEN_NOT_FOUND));

        // Time overlap validation (excluding itself)
        List<Showtime> overlaps = showtimeRepository.findOverlappingShowtimes(
                screen.getId(), request.getDate(), request.getStartTime(), request.getEndTime(), Status.ACTIVE, id);
        if (!overlaps.isEmpty()) {
            throw new AppException(ErrorCode.SHOWTIME_TIME_CONFLICT);
        }

        showtime.setDate(request.getDate());
        showtime.setStartTime(request.getStartTime());
        showtime.setEndTime(request.getEndTime());
        showtime.setPrice(request.getPrice());
        showtime.setMovie(movie);
        showtime.setScreen(screen);
        showtime.setStatus(parseStatus(request.getStatus()));

        return toResponse(showtimeRepository.save(showtime));
    }

    public ShowtimeResponse getById(Long id) {
        return toResponse(findById(id));
    }

    public List<Long> getBookedSeats(Long id) {
        return bookingRepository.findBookedSeatIdsForShowtime(id, java.util.List.of(be.movie36.enums.BookingStatus.PENDING, be.movie36.enums.BookingStatus.PAID));
    }

    public List<ShowtimeResponse> getByMovieAndDate(Long movieId, LocalDate date) {
        return showtimeRepository.findByMovieIdAndDate(movieId, date)
                .stream().map(this::toResponse).toList();
    }

    public List<ShowtimeResponse> getByMovieId(Long movieId) {
        return showtimeRepository.findByMovieIdOrderByDateAscStartTimeAsc(movieId)
                .stream().map(this::toResponse).toList();
    }

    public List<ShowtimeResponse> getByScreenAndDate(Long screenId, LocalDate date) {
        return showtimeRepository.findByScreenIdAndDate(screenId, date)
                .stream().map(this::toResponse).toList();
    }

    public void delete(Long id) {
        Showtime showtime = findById(id);
        showtime.setStatus(Status.INACTIVE);
        showtimeRepository.save(showtime);
    }

    public void restore(Long id) {
        Showtime showtime = findById(id);
        showtime.setStatus(Status.ACTIVE);
        showtimeRepository.save(showtime);
    }

    private Showtime findById(Long id) {
        return showtimeRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SHOWTIME_NOT_FOUND));
    }

    private Status parseStatus(String status) {
        if (status == null || status.isBlank()) {
            return Status.ACTIVE;
        }
        try {
            return Status.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new AppException(ErrorCode.INVALID_STATUS);
        }
    }

    private ShowtimeResponse toResponse(Showtime showtime) {
        return ShowtimeResponse.builder()
                .id(showtime.getId())
                .date(showtime.getDate())
                .startTime(showtime.getStartTime())
                .endTime(showtime.getEndTime())
                .price(showtime.getPrice())
                .status(showtime.getStatus().name())
                .movieId(showtime.getMovie().getId())
                .movieTitle(showtime.getMovie().getTitle())
                .moviePoster(showtime.getMovie().getPoster())
                .screenId(showtime.getScreen().getId())
                .screenName(showtime.getScreen().getName())
                .cinemaId(showtime.getScreen().getCinema().getId())
                .cinemaName(showtime.getScreen().getCinema().getName())
                .build();
    }
}
