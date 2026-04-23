package be.movie36.service;

import be.movie36.dto.request.BookingRequest;
import be.movie36.dto.response.BookingResponse;
import be.movie36.entity.*;
import be.movie36.enums.BookingStatus;
import be.movie36.enums.Status;
import be.movie36.exception.AppException;
import be.movie36.exception.ErrorCode;
import be.movie36.repository.*;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {
    private final BookingRepository bookingRepository;
    private final ShowtimeRepository showtimeRepository;
    private final SeatRepository seatRepository;
    private final UserRepository userRepository;
    private final TicketPricingRepository ticketPricingRepository;

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public BookingResponse createBooking(BookingRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        Showtime showtime = showtimeRepository.findById(request.getShowtimeId())
                .orElseThrow(() -> new AppException(ErrorCode.SHOWTIME_NOT_FOUND));

        if (showtime.getStatus() != Status.ACTIVE) {
            throw new AppException(ErrorCode.SHOWTIME_NOT_FOUND);
        }

        // Sắp xếp IDs trước để tránh Deadlock khi lấy Lock
        List<Long> sortedSeatIds = request.getSeatIds().stream().sorted().collect(Collectors.toList());
        List<Seat> seats = seatRepository.findByIdsWithLock(sortedSeatIds);
        
        if (seats.size() != sortedSeatIds.size()) {
            throw new AppException(ErrorCode.SEAT_NOT_FOUND);
        }

        // Validate seats belong to showtime's screen
        for (Seat seat : seats) {
            if (!seat.getScreen().getId().equals(showtime.getScreen().getId())) {
                throw new AppException(ErrorCode.SEAT_NOT_IN_SCREEN);
            }
        }

        // Concurrency check: double booking
        boolean isDoubleBooked = bookingRepository.existsBookingForSeatsInShowtime(showtime.getId(), request.getSeatIds(), List.of(BookingStatus.PENDING, BookingStatus.PAID));
        if (isDoubleBooked) {
            throw new AppException(ErrorCode.SEAT_ALREADY_BOOKED);
        }

        // Calculate price efficiently using Map to avoid N+1 query
        List<TicketPricing> activePricings = ticketPricingRepository.findByStatus(Status.ACTIVE);
        java.util.Map<String, Double> pricingMap = activePricings.stream()
                .collect(Collectors.toMap(
                    TicketPricing::getType, 
                    TicketPricing::getPrice, 
                    (existing, replacement) -> existing));

        double basePrice = showtime.getPrice() != null ? showtime.getPrice() : 0.0;
        double totalPrice = 0.0;
        
        for (Seat seat : seats) {
            double surcharge = pricingMap.getOrDefault(seat.getType(), 0.0);
            totalPrice += (basePrice + surcharge);
        }

        Booking booking = Booking.builder()
                .bookingCode("B" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .totalPrice(totalPrice)
                .status(BookingStatus.PENDING)
                .user(user)
                .showtime(showtime)
                .seats(seats)
                .build();

        booking = bookingRepository.save(booking);

        return toResponse(booking);
    }

    @Transactional
    public BookingResponse payBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

        if (booking.getStatus() == BookingStatus.PAID) {
            throw new AppException(ErrorCode.BOOKING_ALREADY_PAID);
        }

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new AppException(ErrorCode.BOOKING_EXPIRED);
        }

        // Check if expired before paying (10 minutes)
        if (booking.getCreatedAt().plusMinutes(10).isBefore(LocalDateTime.now())) {
            booking.setStatus(BookingStatus.CANCELLED);
            bookingRepository.save(booking);
            throw new AppException(ErrorCode.BOOKING_EXPIRED);
        }

        booking.setStatus(BookingStatus.PAID);
        return toResponse(bookingRepository.save(booking));
    }

    @Transactional
    public void cancelBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));
        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);
    }

    public List<BookingResponse> getMyBookings() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        return bookingRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public BookingResponse getById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));
        return toResponse(booking);
    }

    // Cron Job logic
    @Transactional
    public void cancelExpiredBookings() {
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(10);
        List<Booking> expiredBookings = bookingRepository.findExpiredBookings(BookingStatus.PENDING, cutoff);
        for (Booking b : expiredBookings) {
            b.setStatus(BookingStatus.CANCELLED);
            bookingRepository.save(b);
        }
    }

    private BookingResponse toResponse(Booking booking) {
        return BookingResponse.builder()
                .id(booking.getId())
                .bookingCode(booking.getBookingCode())
                .totalPrice(booking.getTotalPrice())
                .status(booking.getStatus().name())
                .createdAt(booking.getCreatedAt())
                .showtimeId(booking.getShowtime().getId())
                .movieTitle(booking.getShowtime().getMovie().getTitle())
                .moviePoster(booking.getShowtime().getMovie().getPoster())
                .cinemaName(booking.getShowtime().getScreen().getCinema().getName())
                .screenName(booking.getShowtime().getScreen().getName())
                .seatNames(booking.getSeats().stream().map(Seat::getName).collect(Collectors.toList()))
                .build();
    }
}
