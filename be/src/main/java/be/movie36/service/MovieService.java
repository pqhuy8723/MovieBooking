package be.movie36.service;

import be.movie36.dto.request.MovieRequest;
import be.movie36.dto.response.ActorResponse;
import be.movie36.dto.response.DirectorResponse;
import be.movie36.dto.response.GenreResponse;
import be.movie36.dto.response.MovieResponse;
import be.movie36.entity.*;
import be.movie36.enums.Status;
import be.movie36.enums.AgeRating;
import be.movie36.exception.AppException;
import be.movie36.exception.ErrorCode;
import be.movie36.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class MovieService {
    private final MovieRepository movieRepository;
    private final GenreRepository genreRepository;
    private final ActorRepository actorRepository;
    private final DirectorRepository directorRepository;
    private final LanguageRepository languageRepository;
    private final MovieTypeRepository movieTypeRepository;

    // tao moi movie
    @Transactional
    public MovieResponse create(MovieRequest request) {
        if (movieRepository.findByTitle(request.getTitle()).isPresent()) {
            throw new AppException(ErrorCode.MOVIE_EXISTED);
        }
        Movie movie = Movie.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .duration(request.getDuration())
                .poster(request.getPoster())
                .banner(request.getBanner())
                .videoUrl(request.getVideoUrl())
                .releaseDate(request.getReleaseDate())
                .rating(request.getRating())
                .ageRating(parseAgeRating(request.getAgeRating()))
                .country(request.getCountry())
                .status(parseStatus(request.getStatus()))
                .genres(fetchGenres(request.getGenreIds()))
                .actors(fetchActors(request.getActorIds()))
                .directors(fetchDirectors(request.getDirectorIds()))
                .language(fetchLanguage(request.getLanguageId()))
                .movieType(fetchMovieType(request.getMovieTypeId()))
                .build();
        return toResponse(movieRepository.save(movie));
    }

    // lay ra danh sach
    public List<MovieResponse> getAll() {
        return movieRepository.findAll().stream().map(this::toResponse).toList();
    }

    // lay ra danh sach active
    public List<MovieResponse> getAllActive() {
        return movieRepository.findByStatus(Status.ACTIVE).stream().map(this::toResponse).toList();
    }

    // lay ra theo id
    public MovieResponse getById(Long id) {
        return toResponse(findById(id));
    }

    // tim kiem theo title
    public List<MovieResponse> search(String title) {
        return movieRepository.findByTitleContainingIgnoreCase(title)
                .stream().map(this::toResponse).toList();
    }

    // lay ra theo genge
    public List<MovieResponse> getByGenre(Long genreId) {
        return movieRepository.findByGenresId(genreId).stream().map(this::toResponse).toList();
    }

    // lay ra tjep mobie type
    public List<MovieResponse> getByMovieType(Long movieTypeId) {
        MovieType movieType = fetchMovieType(movieTypeId);
        return movieRepository.findByMovieType(movieType).stream().map(this::toResponse).toList();
    }

    // cap nhat
    @Transactional
    public MovieResponse update(Long id, MovieRequest request) {
        Movie movie = findById(id);

        // Kiểm tra tên mới có trùng với phim khác không
        movieRepository.findByTitle(request.getTitle())
                .ifPresent(existing -> {
                    if (!existing.getId().equals(id)) {
                        throw new AppException(ErrorCode.MOVIE_EXISTED);
                    }
                });

        movie.setTitle(request.getTitle());
        movie.setDescription(request.getDescription());
        movie.setDuration(request.getDuration());
        movie.setPoster(request.getPoster());
        movie.setBanner(request.getBanner());
        movie.setVideoUrl(request.getVideoUrl());
        movie.setReleaseDate(request.getReleaseDate());
        movie.setRating(request.getRating());
        movie.setAgeRating(parseAgeRating(request.getAgeRating()));
        movie.setCountry(request.getCountry());
        movie.setStatus(parseStatus(request.getStatus()));
        movie.setGenres(fetchGenres(request.getGenreIds()));
        movie.setActors(fetchActors(request.getActorIds()));
        movie.setDirectors(fetchDirectors(request.getDirectorIds()));
        movie.setLanguage(fetchLanguage(request.getLanguageId()));
        movie.setMovieType(fetchMovieType(request.getMovieTypeId()));

        return toResponse(movieRepository.save(movie));
    }
    // xoa movie
    @Transactional
    public void delete(Long id) {
        Movie movie = findById(id);

        // Chặn xóa nếu còn showtime active
        if (movieRepository.hasActiveShowtime(id)) {
            throw new AppException(ErrorCode.MOVIE_HAS_ACTIVE_SHOWTIME);
        }

        movie.setStatus(Status.INACTIVE);
        movieRepository.save(movie);
    }

    // Helper
    private Movie findById(Long id) {
        return movieRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.MOVIE_TYPE_NOT_FOUND));
    }

    private Set<Genre> fetchGenres(Set<Long> ids) {
        Set<Genre> result = new HashSet<>(genreRepository.findAllById(ids));
        if (result.size() != ids.size()) {
            throw new AppException(ErrorCode.GENRE_NOT_FOUND);
        }
        return result;
    }

    private Set<Actor> fetchActors(Set<Long> ids) {
        Set<Actor> result = new HashSet<>(actorRepository.findAllById(ids));
        if (result.size() != ids.size()) {
            throw new AppException(ErrorCode.ACTOR_NOT_FOUND);
        }
        return result;
    }

    private Set<Director> fetchDirectors(Set<Long> ids) {
        Set<Director> result = new HashSet<>(directorRepository.findAllById(ids));
        if (result.size() != ids.size()) throw new AppException(ErrorCode.DIRECTOR_NOT_FOUND);
        return result;
    }

    private Language fetchLanguage(Long id) {
        return languageRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.LANGUAGE_NOT_FOUND));
    }

    private MovieType fetchMovieType(Long id) {
        return movieTypeRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.MOVIE_TYPE_NOT_FOUND));
    }

    private AgeRating parseAgeRating(String ageRating) {
        if (ageRating == null || ageRating.isBlank()) return AgeRating.P;
        try {
            return AgeRating.valueOf(ageRating.toUpperCase());
        } catch (IllegalArgumentException e) {
            return AgeRating.P;
        }
    }

    private Status parseStatus(String status) {
        if (status == null || status.isBlank()) return Status.ACTIVE;
        try {
            return Status.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new AppException(ErrorCode.INVALID_STATUS);
        }
    }

    private MovieResponse toResponse(Movie movie) {
        return MovieResponse.builder()
                .id(movie.getId())
                .title(movie.getTitle())
                .description(movie.getDescription())
                .duration(movie.getDuration())
                .poster(movie.getPoster())
                .banner(movie.getBanner())
                .videoUrl(movie.getVideoUrl())
                .releaseDate(movie.getReleaseDate())
                .rating(movie.getRating())
                .ageRating(movie.getAgeRating() != null ? movie.getAgeRating().name() : null)
                .country(movie.getCountry())
                .status(movie.getStatus().name())
                .genres(movie.getGenres().stream()
                        .map(g -> GenreResponse.builder()
                                .id(g.getId())
                                .name(g.getName())
                                .status(g.getStatus().name())
                                .build())
                        .toList())
                .actors(movie.getActors().stream()
                        .map(a -> ActorResponse.builder()
                                .id(a.getId())
                                .name(a.getName())
                                .status(a.getStatus().name())
                                .build())
                        .toList())
                .directors(movie.getDirectors().stream()
                        .map(d -> DirectorResponse.builder()
                                .id(d.getId())
                                .name(d.getName())
                                .status(d.getStatus().name())
                                .build())
                        .toList())
                .language(movie.getLanguage() != null ? movie.getLanguage().getName() : null)
                .movieType(movie.getMovieType() != null ? movie.getMovieType().getName() : null)
                .createdAt(movie.getCreatedAt())
                .build();
    }

}
