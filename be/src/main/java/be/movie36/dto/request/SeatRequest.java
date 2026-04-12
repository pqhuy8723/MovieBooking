package be.movie36.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SeatRequest {
    @NotBlank(message = "Tên ghế không được để trống")
    private String name;

    private String type;
    private String status;

    @NotNull(message = "ID phòng chiếu không được để trống")
    private Long screenId;
}
