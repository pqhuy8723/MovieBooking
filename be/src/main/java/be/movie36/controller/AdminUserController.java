package be.movie36.controller;

import be.movie36.dto.request.AdminUpdateUserRequest;
import be.movie36.dto.request.RegisterRequest;
import be.movie36.dto.response.ApiResponse;
import be.movie36.dto.response.UserResponse;
import be.movie36.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final UserService userService;

    // GET /api/admin/users?page=0&size=5
    @GetMapping
    public ResponseEntity<ApiResponse<Page<UserResponse>>> getAllUsers(
            @PageableDefault(size = 5) Pageable pageable) {

        Page<UserResponse> users = userService.getAllUsers(pageable);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách người dùng thành công", users));
    }

    // GET /api/admin/users/{id}
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable Long id) {
        UserResponse user = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin người dùng thành công", user));
    }

    // POST /api/admin/users
    @PostMapping
    public ResponseEntity<ApiResponse<UserResponse>> createUser(
            @Valid @RequestBody RegisterRequest request) {
        UserResponse created = userService.createUser(request);
        return ResponseEntity.ok(ApiResponse.success("Tạo tài khoản thành công", created));
    }

    // PUT /api/admin/users/{id}
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody AdminUpdateUserRequest request) {

        UserResponse updated = userService.updateUserByAdmin(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật người dùng thành công", updated));
    }
}
