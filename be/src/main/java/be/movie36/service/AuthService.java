package be.movie36.service;

import be.movie36.dto.request.ChangePasswordRequest;
import be.movie36.dto.request.LoginRequest;
import be.movie36.dto.request.RefreshTokenRequest;
import be.movie36.dto.request.RegisterRequest;
import be.movie36.dto.response.AuthResponse;
import be.movie36.entity.RefreshToken;
import be.movie36.entity.User;
import be.movie36.enums.Gender;
import be.movie36.enums.Role;
import be.movie36.exception.AppException;
import be.movie36.exception.ErrorCode;
import be.movie36.repository.RefreshTokenRepository;
import be.movie36.repository.UserRepository;
import be.movie36.security.CustomUserDetails;
import be.movie36.security.jwt.JwtService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final RefreshTokenService refreshTokenService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    // register
    @Transactional
    public void register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new AppException(ErrorCode.EMAIL_EXISTED);
        }
        Gender gender = null;
        if (request.getGender() != null && !request.getGender().isBlank()) {
            try {
                gender = Gender.valueOf(request.getGender().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new AppException(ErrorCode.INVALID_GENDER);
            }
        }
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .gender(gender)
                .role(Role.USER)
                .enabled(true)
                .build();
        userRepository.save(user);
    }

    // login
    @Transactional
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        refreshTokenRepository.deleteByUserId(user.getId());
        return buildAuthResponse(user);
    }

    // logout
    @Transactional
    public void logout(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        refreshTokenService.revokeAllTokensByUser(user.getId());
    }
    // refresh token

    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {

        RefreshToken oldToken = refreshTokenService.verifyRefreshToken(request.getRefreshToken());

        refreshTokenService.revokeToken(request.getRefreshToken());

        return buildAuthResponse(oldToken.getUser());
    }

    // changepasswod
    @Transactional
    public void changePassword(String email, ChangePasswordRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new AppException(ErrorCode.WRONG_OLD_PASSWORD);
        }

        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new AppException(ErrorCode.SAME_PASSWORD);
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new AppException(ErrorCode.PASSWORD_NOT_MATCH);
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        refreshTokenService.revokeAllTokensByUser(user.getId());

    }

    // helper
    private AuthResponse buildAuthResponse(User user) {
        CustomUserDetails userDetails = new CustomUserDetails(user);

        String accessToken = jwtService.generateToken(userDetails);

        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .build();
    }
}
