package be.movie36.controller;

import be.movie36.constant.Message;
import be.movie36.dto.request.CinemaRequest;
import be.movie36.dto.response.ApiResponse;
import be.movie36.dto.response.CinemaResponse;
import be.movie36.service.CinemaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cinemas")
@RequiredArgsConstructor
public class CinemaController {
    private final CinemaService service;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CinemaResponse>>> getAll() {
        return ResponseEntity.ok(
                ApiResponse.success(Message.GET_CINEMA_SUCCESS, service.getAll()));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<CinemaResponse>>> getAllActive() {
        return ResponseEntity.ok(
                ApiResponse.success(Message.GET_CINEMA_SUCCESS, service.getAllActive()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CinemaResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.success(Message.GET_CINEMA_BYID, service.getById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CinemaResponse>> create(
            @Valid @RequestBody CinemaRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success(Message.CREATE_CINEMA_SUCCESS, service.create(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CinemaResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody CinemaRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success(Message.UPDATE_CINEMA_SUCCESS, service.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.success(Message.DELETE_CINEMA_SUCCESS));
    }

    @PatchMapping("/{id}/restore")
    public ResponseEntity<ApiResponse<Void>> restore(@PathVariable Long id) {
        service.restore(id);
        return ResponseEntity.ok(ApiResponse.success(Message.RESTORE_SUCCESS));
    }
}
