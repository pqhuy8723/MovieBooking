package be.movie36.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class MovieResponse {
    private Long id;
    private String title;
    private String description;
    private Integer duration;
    private String poster;
    private String banner;
    private String videoUrl;
    private LocalDate releaseDate;
    private Double rating;
    private String ageRating;
    private String country;
    private String status;
    private List<GenreResponse> genres;
    private List<ActorResponse> actors;
    private List<DirectorResponse> directors;
    private String language;
    private String movieType;
    private LocalDateTime createdAt;
}