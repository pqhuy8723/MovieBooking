package be.movie36.controller;

import be.movie36.constant.Message;
import be.movie36.dto.request.DirectorRequest;
import be.movie36.dto.response.ApiResponse;
import be.movie36.dto.response.DirectorResponse;
import be.movie36.service.DirectorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/directors")
@RequiredArgsConstructor
public class DirectorController {
    private final DirectorService directorService;

    // GET /api/directors
    @GetMapping
    public ResponseEntity<ApiResponse<Page<DirectorResponse>>> getAll(
            @RequestParam(required = false) String name,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(Message.GET_DIRECTOR_SUCCESS, directorService.getAll(name, pageable)));
    }

    // GET /api/directors/active — lấy tất cả director đang active (dùng cho dropdown form)
    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<DirectorResponse>>> getAllActive() {
        return ResponseEntity.ok(ApiResponse.success(Message.GET_DIRECTOR_SUCCESS, directorService.getAllActive()));
    }

    // GET /api/directors/search
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<DirectorResponse>>> search(@RequestParam String name) {
        return ResponseEntity.ok(ApiResponse.success(Message.GET_DIRECTOR_SUCCESS, directorService.search(name)));
    }

    // GET /api/directors/{id}
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DirectorResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(Message.GET_DIRECTOR_BYID, directorService.getById(id)));
    }

    // POST /api/directors (ADMIN)
    @PostMapping
    public ResponseEntity<ApiResponse<DirectorResponse>> create(
            @Valid @RequestBody DirectorRequest request) {
        return ResponseEntity.ok(ApiResponse.success(Message.CREATE_DIRECTOR_SUCCESS,
                directorService.create(request)));
    }

    // PUT /api/directors (ADMIN)
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<DirectorResponse>> update(
            @PathVariable Long id, @Valid @RequestBody DirectorRequest request) {
        return ResponseEntity.ok(ApiResponse.success(Message.UPDATE_DIRECTOR_SUCCESS,
                directorService.update(id, request)));
    }

    // DELETE /api/directors/{id} (ADMIN)
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        directorService.delete(id);
        return ResponseEntity.ok(ApiResponse.success(Message.DELETE_DIRECTOR_SUCCESS));
    }

    // PATCH /api/directors/{id}/restore (ADMIN)
    @PatchMapping("/{id}/restore")
    public ResponseEntity<ApiResponse<Void>> restore(@PathVariable Long id) {
        directorService.restore(id);
        return ResponseEntity.ok(ApiResponse.success(Message.RESTORE_SUCCESS));
    }

}
