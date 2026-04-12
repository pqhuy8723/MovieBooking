package be.movie36.controller;


import be.movie36.constant.Message;
import be.movie36.dto.request.MovieTypeRequest;
import be.movie36.dto.response.ApiResponse;
import be.movie36.dto.response.MovieTypeResponse;
import be.movie36.service.MovieTypeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/movietype")
@RequiredArgsConstructor
public class MovieTypeController {
    private final MovieTypeService service;

    // GET /api/movietype — lấy tất cả (ADMIN)
    @GetMapping
    public ResponseEntity<ApiResponse<List<MovieTypeResponse>>> getAll() {
        return ResponseEntity.ok(
                ApiResponse.success(Message.GET_MOVIETYPE_SUCCESS, service.getAll()));
    }

    // GET /api/movietype/active — lấy các movietype đang active (PUBLIC)
    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<MovieTypeResponse>>> getAllActive() {
        return ResponseEntity.ok(
                ApiResponse.success(Message.GET_MOVIETYPE_SUCCESS, service.getAllActive()));
    }

    // GET /api/movietype/{id}
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MovieTypeResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.success(Message.GET_MOVIETYPE_BYID, service.getById(id)));
    }

    // POST /api/movietype (ADMIN)
    @PostMapping
    public ResponseEntity<ApiResponse<MovieTypeResponse>> create(
            @Valid @RequestBody MovieTypeRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success(Message.CREATE_MOVIETYPE_SUCCESS, service.create(request)));
    }

    // PUT /api/movietype/{id} (ADMIN)
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<MovieTypeResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody MovieTypeRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success(Message.UPDATE_MOVIETYPE_SUCCESS, service.update(id, request)));
    }

    // DELETE /api/movietype/{id} (ADMIN)
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.success(Message.DELETE_MOVIETYPE_SUCCESS));
    }

    // PATCH /api/movietype/{id}/restore (ADMIN)
    @PatchMapping("/{id}/restore")
    public ResponseEntity<ApiResponse<Void>> restore(@PathVariable Long id) {
        service.restore(id);
        return ResponseEntity.ok(ApiResponse.success(Message.RESTORE_SUCCESS));
    }
}
