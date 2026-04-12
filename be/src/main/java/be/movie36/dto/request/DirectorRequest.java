package be.movie36.dto.request;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class DirectorRequest {
    @NotBlank(message = "Tên đạo diễn không được để trống")
    @Size(max = 100, message = "Tên không quá 100 ký tự")
    private String name;

    private String status;
}
