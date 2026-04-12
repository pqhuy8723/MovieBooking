package be.movie36.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
public class ShowtimeRequest {
    @NotNull(message = "Ngày chiếu không được để trống")
    private LocalDate date;

    @NotNull(message = "Giờ bắt đầu không được để trống")
    private LocalTime startTime;

    @NotNull(message = "Giờ kết thúc không được để trống")
    private LocalTime endTime;

    @NotNull(message = "Giá vé cơ bản không được để trống")
    private Double price;

    @NotNull(message = "Mã phim không được để trống")
    private Long movieId;

    @NotNull(message = "Mã phòng chiếu không được để trống")
    private Long screenId;

    private String status;
}
