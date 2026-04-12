package be.movie36.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class ScreenResponse {
    private Long id;
    private String name;
    private Integer seatingCapacity;
    private String type;
    private String status;
    private SimpleCinemaResponse cinema;

    @Getter
    @Setter
    @Builder
    public static class SimpleCinemaResponse {
        private Long id;
        private String name;
    }
}
