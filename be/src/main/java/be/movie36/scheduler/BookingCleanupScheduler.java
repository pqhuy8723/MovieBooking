package be.movie36.scheduler;

import be.movie36.service.BookingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class BookingCleanupScheduler {
    private final BookingService bookingService;

    // Chạy mỗi 1 phút một lần
    @Scheduled(fixedRate = 60000)
    public void cleanupExpiredBookings() {
        log.info("Running scheduled task to clean up expired bookings...");
        bookingService.cancelExpiredBookings();
    }
}
