package be.movie36.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class CinemaResponse {
    private Long id;
    private String name;
    private String address;
    private String phone;
    private String email;
    private String description;
    private String status;
}
