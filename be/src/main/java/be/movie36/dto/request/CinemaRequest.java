package be.movie36.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CinemaRequest {
    @NotBlank(message = "Tên rạp không được để trống")
    private String name;

    @NotBlank(message = "Địa chỉ rạp không được để trống")
    private String address;

    private String phone;
    private String email;
    private String description;
    
    private String status;
}
