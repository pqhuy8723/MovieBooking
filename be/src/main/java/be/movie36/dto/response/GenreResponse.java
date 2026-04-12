package be.movie36.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class GenreResponse {
    private Long id;
    private String name;
    private String status;
}
