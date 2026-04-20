package be.movie36.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AdminUpdateUserRequest {

    @NotBlank(message = "Họ và tên không được để trống")
    private String fullName;

    private String phone;

    private String gender;

    private String role;

    private Boolean enabled;
}
