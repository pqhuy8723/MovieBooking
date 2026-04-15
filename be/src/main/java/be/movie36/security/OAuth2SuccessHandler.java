package be.movie36.security;

import be.movie36.constant.Message;
import be.movie36.dto.response.ApiResponse;
import be.movie36.dto.response.AuthResponse;
import be.movie36.entity.RefreshToken;
import be.movie36.entity.User;
import be.movie36.exception.AppException;
import be.movie36.exception.ErrorCode;
import be.movie36.repository.UserRepository;
import be.movie36.security.jwt.JwtService;
import be.movie36.service.RefreshTokenService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

        private final UserRepository userRepository;
        private final JwtService jwtService;
        private final RefreshTokenService refreshTokenService;
        private final ObjectMapper objectMapper;

        @Override
        public void onAuthenticationSuccess(HttpServletRequest request,
                        HttpServletResponse response,
                        Authentication authentication) throws IOException {
                // Lấy email từ OAuth2User
                OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
                String email = oAuth2User.getAttribute("email");

                // Lấy user từ DB
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

                // Tạo JWT
                CustomUserDetails userDetails = new CustomUserDetails(user);
                String accessToken = jwtService.generateToken(userDetails);
                RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);

                // Trả về JSON response
                AuthResponse authResponse = AuthResponse.builder()
                                .accessToken(accessToken)
                                .refreshToken(refreshToken.getToken())
                                .id(user.getId())
                                .email(user.getEmail())
                                .fullName(user.getFullName())
                                .role(user.getRole().name())
                                .build();

                ResponseCookie accessCookie = ResponseCookie.from("accessToken", accessToken)
                                .httpOnly(true)
                                .secure(false)
                                .path("/")
                                .maxAge(900)
                                .build();

                ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", refreshToken.getToken())
                                .httpOnly(true)
                                .secure(false)
                                .path("/")
                                .maxAge(7 * 24 * 60 * 60)
                                .build();

                response.addHeader(HttpHeaders.SET_COOKIE, accessCookie.toString());
                response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());

                response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                response.setStatus(HttpServletResponse.SC_OK);
                objectMapper.writeValue(
                                response.getOutputStream(),
                                ApiResponse.success(Message.LOGIN_GOOGLE_SUCCESS, authResponse));
        }
}
