package be.movie36.repository;

import be.movie36.entity.Booking;
import be.movie36.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
       List<Booking> findByUserIdOrderByCreatedAtDesc(Long userId);

       Optional<Booking> findByBookingCode(String bookingCode);

       @Query("SELECT b FROM Booking b WHERE b.status = be.movie36.enums.BookingStatus.PENDING AND b.createdAt < :cutoffTime")
       List<Booking> findExpiredBookings(@Param("cutoffTime") LocalDateTime cutoffTime);

       @Query("SELECT CASE WHEN COUNT(b) > 0 THEN true ELSE false END " +
                     "FROM Booking b JOIN b.seats s " +
                     "WHERE b.showtime.id = :showtimeId AND s.id IN :seatIds " +
                     "AND b.status IN (be.movie36.enums.BookingStatus.PENDING, be.movie36.enums.BookingStatus.PAID)")
       boolean existsBookingForSeatsInShowtime(
                     @Param("showtimeId") Long showtimeId,
                     @Param("seatIds") List<Long> seatIds);
}
