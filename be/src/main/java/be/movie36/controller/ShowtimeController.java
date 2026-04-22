package be.movie36.controller;

import be.movie36.constant.Message;
import be.movie36.dto.request.ShowtimeRequest;
import be.movie36.dto.response.ApiResponse;
import be.movie36.dto.response.ShowtimeResponse;
import be.movie36.service.ShowtimeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/showtimes")
@RequiredArgsConstructor
public class ShowtimeController {
    private final ShowtimeService service;

    @GetMapping("/movie/{movieId}")
    public ResponseEntity<ApiResponse<List<ShowtimeResponse>>> getByMovieAndDate(
            @PathVariable Long movieId,
            @RequestParam LocalDate date) {
        return ResponseEntity.ok(
                ApiResponse.success(Message.GET_SHOWTIME_SUCCESS, service.getByMovieAndDate(movieId, date)));
    }

    // GET /api/showtimes/movie/{movieId}/all — lấy tất cả showtime của phim (admin)
    @GetMapping("/movie/{movieId}/all")
    public ResponseEntity<ApiResponse<List<ShowtimeResponse>>> getByMovieId(@PathVariable Long movieId) {
        return ResponseEntity.ok(
                ApiResponse.success(Message.GET_SHOWTIME_SUCCESS, service.getByMovieId(movieId)));
    }

    @GetMapping("/screen/{screenId}")
    public ResponseEntity<ApiResponse<List<ShowtimeResponse>>> getByScreenAndDate(
            @PathVariable Long screenId,
            @RequestParam LocalDate date) {
        return ResponseEntity.ok(
                ApiResponse.success(Message.GET_SHOWTIME_SUCCESS, service.getByScreenAndDate(screenId, date)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ShowtimeResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.success(Message.GET_SHOWTIME_BYID, service.getById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ShowtimeResponse>> create(
            @Valid @RequestBody ShowtimeRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success(Message.CREATE_SHOWTIME_SUCCESS, service.create(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ShowtimeResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody ShowtimeRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success(Message.UPDATE_SHOWTIME_SUCCESS, service.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.success(Message.DELETE_SHOWTIME_SUCCESS));
    }

    @PatchMapping("/{id}/restore")
    public ResponseEntity<ApiResponse<Void>> restore(@PathVariable Long id) {
        service.restore(id);
        return ResponseEntity.ok(ApiResponse.success(Message.RESTORE_SUCCESS));
    }
}
