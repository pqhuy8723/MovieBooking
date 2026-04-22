package be.movie36.controller;


import be.movie36.constant.Message;
import be.movie36.dto.request.ActorRequest;
import be.movie36.dto.response.ActorResponse;
import be.movie36.dto.response.ApiResponse;
import be.movie36.service.ActorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/actors")
@RequiredArgsConstructor
public class ActorController {
    private final ActorService actorService;
    // GET /api/actors — lấy tất cả
    @GetMapping
    public ResponseEntity<ApiResponse<Page<ActorResponse>>> getAll(
            @RequestParam(required = false) String name,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(Message.GET_ACTOR_SUCCESS, actorService.getAll(name, pageable)));
    }
    // GET /api/actors/active — lấy tất cả actor đang active (dùng cho dropdown form)
    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<ActorResponse>>> getAllActive() {
        return ResponseEntity.ok(ApiResponse.success(Message.GET_ACTOR_SUCCESS, actorService.getAllActive()));
    }
    // GET /api/actors/search
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<ActorResponse>>> search(@RequestParam String name) {
        return ResponseEntity.ok(ApiResponse.success(Message.GET_ACTOR_SUCCESS, actorService.search(name)));
    }
    // GET /api/actors/{id}
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ActorResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(Message.GET_ACTOR_BYID, actorService.getById(id)));
    }
    // POST /api/actors (ADMIN)
    @PostMapping
    public ResponseEntity<ApiResponse<ActorResponse>> create(
            @Valid @RequestBody ActorRequest request) {
        return ResponseEntity.ok(ApiResponse.success(Message.CREATE_ACTOR_SUCCESS,
                actorService.create(request)));
    }
    // PUT /api/actors/{id} (ADMIN)
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ActorResponse>> update(
            @PathVariable Long id, @Valid @RequestBody ActorRequest request) {
        return ResponseEntity.ok(ApiResponse.success(Message.UPDATE_ACTOR_SUCCESS,
                actorService.update(id, request)));
    }
    //DELETE /api/actors/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        actorService.delete(id);
        return ResponseEntity.ok(ApiResponse.success(Message.DELETE_ACTOR_SUCCESS));
    }

    // PATCH /api/actors/{id}/restore (ADMIN)
    @PatchMapping("/{id}/restore")
    public ResponseEntity<ApiResponse<Void>> restore(@PathVariable Long id) {
        actorService.restore(id);
        return ResponseEntity.ok(ApiResponse.success(Message.RESTORE_SUCCESS));
    }
}
