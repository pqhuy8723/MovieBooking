package be.movie36.controller;


import be.movie36.constant.Message;
import be.movie36.dto.request.LanguageRequest;
import be.movie36.dto.response.ApiResponse;
import be.movie36.dto.response.LanguageResponse;
import be.movie36.service.LanguageService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/language")
@RequiredArgsConstructor
public class LanguageController {
    private final LanguageService service;

    // GET /api/language — lấy tất cả (ADMIN)
    @GetMapping
    public ResponseEntity<ApiResponse<Page<LanguageResponse>>> getAll(
            @RequestParam(required = false) String name,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(
                ApiResponse.success(Message.GET_LANGUAGE_SUCCESS, service.getAll(name, pageable)));
    }

    // GET /api/language/active — lấy các language đang active (PUBLIC)
    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<LanguageResponse>>> getAllActive() {
        return ResponseEntity.ok(
                ApiResponse.success(Message.GET_LANGUAGE_SUCCESS, service.getAllActive()));
    }

    // GET /api/language/{id}
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<LanguageResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.success(Message.GET_LANGUAGE_BYID, service.getById(id)));
    }

    // POST /api/language (ADMIN)
    @PostMapping
    public ResponseEntity<ApiResponse<LanguageResponse>> create(
            @Valid @RequestBody LanguageRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success(Message.CREATE_LANGUAGE_SUCCESS, service.create(request)));
    }

    // PUT /api/language/{id} (ADMIN)
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<LanguageResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody LanguageRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success(Message.UPDATE_LANGUAGE_SUCCESS, service.update(id, request)));
    }

    // DELETE /api/language/{id} (ADMIN)
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.success(Message.DELETE_LANGUAGE_SUCCESS));
    }
    // PATCH /api/language/{id}/restore (ADMIN)
    @PatchMapping("/{id}/restore")
    public ResponseEntity<ApiResponse<Void>> restore(@PathVariable Long id) {
        service.restore(id);
        return ResponseEntity.ok(ApiResponse.success(Message.RESTORE_SUCCESS));
    }

}
