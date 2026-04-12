package be.movie36.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ScreenRequest {
    @NotBlank(message = "Tên phòng chiếu không được để trống")
    private String name;

    @NotNull(message = "Sức chứa không được để trống")
    private Integer seatingCapacity;

    private String type; // 2D, 3D
    private String status;

    @NotNull(message = "ID rạp chiếu không được để trống")
    private Long cinemaId;
}
