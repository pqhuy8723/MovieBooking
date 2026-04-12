package be.movie36.controller;

import be.movie36.constant.Message;
import be.movie36.dto.request.ScreenRequest;
import be.movie36.dto.response.ApiResponse;
import be.movie36.dto.response.ScreenResponse;
import be.movie36.service.ScreenService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/screens")
@RequiredArgsConstructor
public class ScreenController {
    private final ScreenService service;

    @GetMapping("/cinema/{cinemaId}")
    public ResponseEntity<ApiResponse<List<ScreenResponse>>> getAllByCinemaId(@PathVariable Long cinemaId) {
        return ResponseEntity.ok(
                ApiResponse.success(Message.GET_SCREEN_SUCCESS, service.getAllByCinemaId(cinemaId)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ScreenResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.success(Message.GET_SCREEN_BYID, service.getById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ScreenResponse>> create(
            @Valid @RequestBody ScreenRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success(Message.CREATE_SCREEN_SUCCESS, service.create(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ScreenResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody ScreenRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success(Message.UPDATE_SCREEN_SUCCESS, service.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.success(Message.DELETE_SCREEN_SUCCESS));
    }

    @PatchMapping("/{id}/restore")
    public ResponseEntity<ApiResponse<Void>> restore(@PathVariable Long id) {
        service.restore(id);
        return ResponseEntity.ok(ApiResponse.success(Message.RESTORE_SUCCESS));
    }
}
