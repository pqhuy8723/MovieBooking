package be.movie36.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
public class BookingResponse {
    private Long id;
    private String bookingCode;
    private Double totalPrice;
    private String status;
    private LocalDateTime createdAt;

    // Phim và Rạp
    private Long showtimeId;
    private String movieTitle;
    private String moviePoster;
    private String cinemaName;
    private String screenName;

    // Danh sách ghế chọn
    private List<String> seatNames;
}
