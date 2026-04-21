package be.movie36.controller;

import be.movie36.constant.Message;
import be.movie36.dto.request.GenreRequest;
import be.movie36.dto.response.ApiResponse;
import be.movie36.dto.response.GenreResponse;
import be.movie36.service.GenreService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/genres")
@RequiredArgsConstructor
public class GenreController {
    private final GenreService genreService;

    // GET /api/genres — lấy tất cả (ADMIN)
    @GetMapping
    public ResponseEntity<ApiResponse<Page<GenreResponse>>> getAll(
            @RequestParam(required = false) String name,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(
                ApiResponse.success(Message.GET_GENRE_SUCCESS, genreService.getAll(name, pageable)));
    }

    // GET /api/genres/active — lấy các genre đang active (PUBLIC)
    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<GenreResponse>>> getAllActive() {
        return ResponseEntity.ok(
                ApiResponse.success(Message.GET_GENRE_SUCCESS, genreService.getAllActive()));
    }

    // GET /api/genres/{id}
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<GenreResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.success(Message.GET_GENRE_BYID, genreService.getById(id)));
    }

    // POST /api/genres (ADMIN)
    @PostMapping
    public ResponseEntity<ApiResponse<GenreResponse>> create(
            @Valid @RequestBody GenreRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success(Message.CREATE_GENRE_SUCCESS, genreService.create(request)));
    }

    // PUT /api/genres/{id} (ADMIN)
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<GenreResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody GenreRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success(Message.UPDATE_GENRE_SUCCESS, genreService.update(id, request)));
    }

    // DELETE /api/genres/{id} (ADMIN)
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        genreService.delete(id);
        return ResponseEntity.ok(ApiResponse.success(Message.DELETE_GENRE_SUCCESS));
    }

    // PATCH /api/genres/{id}/restore (ADMIN)
    @PatchMapping("/{id}/restore")
    public ResponseEntity<ApiResponse<Void>> restore(@PathVariable Long id) {
        genreService.restore(id);
        return ResponseEntity.ok(ApiResponse.success(Message.RESTORE_SUCCESS));
    }





}
