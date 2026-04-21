package be.movie36.controller;

import be.movie36.constant.Message;
import be.movie36.dto.request.AdminUpdateUserRequest;
import be.movie36.dto.request.RegisterRequest;
import be.movie36.dto.response.ApiResponse;
import be.movie36.dto.response.UserResponse;
import be.movie36.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import be.movie36.dto.request.UpdateProfileRequest;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // GET /api/users/profile
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserResponse>> getProfile(
            @AuthenticationPrincipal UserDetails userDetails) {

        UserResponse profile = userService.getProfile(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(Message.GET_USER_PROFILE, profile));
    }

    // PUT /api/users/profile
    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UpdateProfileRequest request) {

        UserResponse profile = userService.updateProfile(userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật thông tin thành công", profile));
    }

}