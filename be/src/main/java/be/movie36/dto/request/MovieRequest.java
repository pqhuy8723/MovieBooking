package be.movie36.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;
import java.util.Set;

@Data
public class MovieRequest {

    @NotBlank(message = "Tên phim không được để trống")
    @Size(max = 200, message = "Tên phim không quá 200 ký tự")
    private String title;

    private String description;

    @NotNull(message = "Thời lượng không được để trống")
    @Min(value = 1, message = "Thời lượng phải lớn hơn 0")
    private Integer duration;

    private String poster;
    private String banner;
    private String videoUrl;

    @NotNull(message = "Ngày khởi chiếu không được để trống")
    private LocalDate releaseDate;

    private Double rating;
    private String ageRating; // P, K, T13, T16, T18, C
    private String country;

    private String status;

    @NotEmpty(message = "Phim phải có ít nhất 1 thể loại")
    private Set<Long> genreIds;

    @NotEmpty(message = "Phim phải có ít nhất 1 diễn viên")
    private Set<Long> actorIds;

    @NotEmpty(message = "Phim phải có ít nhất 1 đạo diễn")
    private Set<Long> directorIds;

    @NotNull(message = "Ngôn ngữ không được để trống")
    private Long languageId;

    @NotNull(message = "Loại phim không được để trống")
    private Long movieTypeId;
}