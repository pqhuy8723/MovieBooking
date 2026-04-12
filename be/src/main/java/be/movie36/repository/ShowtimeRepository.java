package be.movie36.repository;

import be.movie36.entity.Showtime;
import be.movie36.enums.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface ShowtimeRepository extends JpaRepository<Showtime, Long> {

    List<Showtime> findByMovieIdAndDate(Long movieId, LocalDate date);

    List<Showtime> findByScreenIdAndDate(Long screenId, LocalDate date);

    @Query("SELECT s FROM Showtime s WHERE s.screen.id = :screenId AND s.date = :date " +
           "AND s.status = :status " +
           "AND (:startTime < s.endTime AND :endTime > s.startTime) " +
           "AND (:excludeId IS NULL OR s.id != :excludeId)")
    List<Showtime> findOverlappingShowtimes(
            @Param("screenId") Long screenId,
            @Param("date") LocalDate date,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime,
            @Param("status") Status status,
            @Param("excludeId") Long excludeId);
}
