package be.movie36.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class MovieSummaryResponse {
    private Long id;
    private String title;
    private String poster;
    private String banner;
    private String videoUrl;
    private Integer duration;
    private List<String> genres;
    private MovieTypeResponse movieType;
}
