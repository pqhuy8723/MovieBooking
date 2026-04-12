package be.movie36.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SeatGenerateRequest {
    @NotNull(message = "ID phòng chiếu không được để trống")
    private Long screenId;

    @NotNull(message = "Số hàng không được để trống")
    @Min(value = 1, message = "Số hàng tối thiểu là 1")
    @Max(value = 26, message = "Số hàng tối đa là 26 (A-Z)")
    private Integer rowCount;

    @NotNull(message = "Số cột không được để trống")
    @Min(value = 1, message = "Số cột tối thiểu là 1")
    private Integer columnCount;

    private String defaultType; // Mặc định là STANDARD
}
