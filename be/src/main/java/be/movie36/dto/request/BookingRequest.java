package be.movie36.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class BookingRequest {
    @NotNull(message = "Mã suất chiếu không được để trống")
    private Long showtimeId;

    @NotEmpty(message = "Bạn chưa chọn ghế nào")
    private List<Long> seatIds;
}
