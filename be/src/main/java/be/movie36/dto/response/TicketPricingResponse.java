package be.movie36.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class TicketPricingResponse {
    private Long id;
    private String type;
    private Double price;
    private String ageGroup;
    private String rules;
    private String status;
}
