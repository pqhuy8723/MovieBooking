package be.movie36.dto.response;


import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class MovieTypeResponse {
    private Long id;
    private String name;
    private String status;
}
