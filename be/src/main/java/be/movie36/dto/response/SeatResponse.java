package be.movie36.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class SeatResponse {
    private Long id;
    private String name;
    private String type;
    private String status;
    private Long screenId;
}
