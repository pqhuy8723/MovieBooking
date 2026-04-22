package be.movie36.repository;

import be.movie36.entity.Movie;
import be.movie36.entity.MovieType;
import be.movie36.enums.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

public interface MovieRepository extends JpaRepository<Movie, Long> {
    Optional<Movie> findByTitle(String title);

    List<Movie> findByStatus(Status status);

    List<Movie> findByMovieType(MovieType movieType);

    List<Movie> findByGenresId(Long genreId);

    List<Movie> findByTitleContainingIgnoreCase(String title);

    @Query("SELECT COUNT(s) > 0 FROM Showtime s WHERE s.movie.id = :movieId AND s.status = be.movie36.enums.Status.ACTIVE")
    boolean hasActiveShowtime(@Param("movieId") Long movieId);

    @Query("SELECT m FROM Movie m WHERE m.status = 'ACTIVE' AND m.movieType.id = :typeId")
    List<Movie> findByTypeId(Long typeId);
}
