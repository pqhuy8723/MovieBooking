package be.movie36.controller;

import be.movie36.constant.Message;
import be.movie36.dto.request.BookingRequest;
import be.movie36.dto.response.ApiResponse;
import be.movie36.dto.response.BookingResponse;
import be.movie36.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {
    private final BookingService bookingService;

    @PostMapping
    public ResponseEntity<ApiResponse<BookingResponse>> createBooking(@Valid @RequestBody BookingRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success(Message.BOOKING_SUCCESS, bookingService.createBooking(request)));
    }

    @GetMapping("/my-bookings")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getMyBookings() {
        return ResponseEntity.ok(
                ApiResponse.success(Message.GET_BOOKING_SUCCESS, bookingService.getMyBookings()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.success(Message.GET_BOOKING_BYID, bookingService.getById(id)));
    }

    @PutMapping("/{id}/pay")
    public ResponseEntity<ApiResponse<BookingResponse>> payBooking(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.success(Message.PAY_BOOKING_SUCCESS, bookingService.payBooking(id)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> cancelBooking(@PathVariable Long id) {
        bookingService.cancelBooking(id);
        return ResponseEntity.ok(
                ApiResponse.success(Message.CANCEL_BOOKING_SUCCESS));
    }
}
