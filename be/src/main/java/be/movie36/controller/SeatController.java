package be.movie36.controller;

import be.movie36.constant.Message;
import be.movie36.dto.request.SeatGenerateRequest;
import be.movie36.dto.request.SeatRequest;
import be.movie36.dto.response.ApiResponse;
import be.movie36.dto.response.SeatResponse;
import be.movie36.service.SeatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/seats")
@RequiredArgsConstructor
public class SeatController {
    private final SeatService service;

    @GetMapping("/screen/{screenId}")
    public ResponseEntity<ApiResponse<List<SeatResponse>>> getAllByScreenId(@PathVariable Long screenId) {
        return ResponseEntity.ok(
                ApiResponse.success(Message.GET_SEAT_SUCCESS, service.getAllByScreenId(screenId)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SeatResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.success(Message.GET_SEAT_BYID, service.getById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SeatResponse>> create(
            @Valid @RequestBody SeatRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success(Message.CREATE_SEAT_SUCCESS, service.create(request)));
    }

    @PostMapping("/generate")
    public ResponseEntity<ApiResponse<List<SeatResponse>>> generateSeats(
            @Valid @RequestBody SeatGenerateRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success(Message.GENERATE_SEAT_SUCCESS, service.generateSeats(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SeatResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody SeatRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success(Message.UPDATE_SEAT_SUCCESS, service.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.success(Message.DELETE_SEAT_SUCCESS));
    }

    @PatchMapping("/{id}/restore")
    public ResponseEntity<ApiResponse<Void>> restore(@PathVariable Long id) {
        service.restore(id);
        return ResponseEntity.ok(ApiResponse.success(Message.RESTORE_SUCCESS));
    }
}
