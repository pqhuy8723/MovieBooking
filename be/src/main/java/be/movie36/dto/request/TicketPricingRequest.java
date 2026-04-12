package be.movie36.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TicketPricingRequest {
    @NotBlank(message = "Loại giá vé không được để trống")
    private String type;

    @NotNull(message = "Giá vé không được để trống")
    private Double price;

    private String ageGroup;
    private String rules;
    private String status;
}
