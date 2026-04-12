package be.movie36.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
@Builder
public class ShowtimeResponse {
    private Long id;
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private Double price;
    private String status;

    // Lồng ghép thêm Context của Phim
    private Long movieId;
    private String movieTitle;
    private String moviePoster;

    // Lồng ghép thêm Context của Phòng chiếu / Rạp
    private Long screenId;
    private String screenName;
    private Long cinemaId;
    private String cinemaName;
}
