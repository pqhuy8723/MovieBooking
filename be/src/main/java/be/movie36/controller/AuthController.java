package be.movie36.controller;


import be.movie36.constant.Message;
import be.movie36.dto.request.*;
import be.movie36.dto.response.ApiResponse;
import be.movie36.dto.response.AuthResponse;
import be.movie36.service.AuthService;
import be.movie36.service.PasswordResetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseCookie;
import org.springframework.http.HttpHeaders;
import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    private final PasswordResetService passwordResetService;

    // POST /api/auth/register
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Void>> register(
            @Valid @RequestBody RegisterRequest request) {

        authService.register(request);
        return ResponseEntity.ok(ApiResponse.success(Message.REGISTER_SUCCESS));
    }

    // POST /api/auth/login
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        AuthResponse data = authService.login(request);
        setCookies(response, data.getAccessToken(), data.getRefreshToken());
        return ResponseEntity.ok(ApiResponse.success(Message.LOGIN_SUCCESS, data));
    }

    // POST /api/auth/logout
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @AuthenticationPrincipal UserDetails userDetails, HttpServletResponse response) {

        authService.logout(userDetails.getUsername());
        clearCookies(response);
        return ResponseEntity.ok(ApiResponse.success(Message.LOGOUT_SUCCESS));
    }

    // POST /api/auth/refresh
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(
            @Valid @RequestBody RefreshTokenRequest request, HttpServletResponse response) {

        AuthResponse data = authService.refreshToken(request);
        setCookies(response, data.getAccessToken(), data.getRefreshToken());
        return ResponseEntity.ok(ApiResponse.success(Message.REFRESH_SUCCESS, data));
    }

    //  // PUT /api/auth/change-password
    @PutMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(@AuthenticationPrincipal UserDetails userDetails,
                                                            @Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.success(Message.CHANGE_PASSWORD_SUCCESS));
    }

    // POST /api/auth/forgot-password
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {

        passwordResetService.sendOtp(request);
        return ResponseEntity.ok(
                ApiResponse.success("Mã OTP đã được gửi đến email của bạn"));
    }

    // POST /api/auth/verify-otp
    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<Void>> verifyOtp(
            @Valid @RequestBody VerifyOtpRequest request) {

        passwordResetService.verifyOtp(request);
        return ResponseEntity.ok(
                ApiResponse.success("OTP hợp lệ"));
    }

    // POST /api/auth/reset-password  (public)
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {

        passwordResetService.resetPassword(request);
        return ResponseEntity.ok(
                ApiResponse.success("Đặt lại mật khẩu thành công, vui lòng đăng nhập lại"));
    }

    private void setCookies(HttpServletResponse response, String accessToken, String refreshToken) {
        ResponseCookie accessCookie = ResponseCookie.from("accessToken", accessToken)
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(900)
                .build();

        ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(7 * 24 * 60 * 60)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, accessCookie.toString());
        response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());
    }

    private void clearCookies(HttpServletResponse response) {
        ResponseCookie accessCookie = ResponseCookie.from("accessToken", "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(0) // Expire immediately
                .build();

        ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(0)
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, accessCookie.toString());
        response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());
    }

}
