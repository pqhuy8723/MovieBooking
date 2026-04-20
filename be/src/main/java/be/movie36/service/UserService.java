package be.movie36.service;

import be.movie36.dto.request.AdminUpdateUserRequest;
import be.movie36.dto.request.RegisterRequest;
import be.movie36.dto.request.UpdateProfileRequest;
import be.movie36.dto.response.UserResponse;
import be.movie36.entity.User;
import be.movie36.enums.Gender;
import be.movie36.enums.Role;
import be.movie36.exception.AppException;
import be.movie36.exception.ErrorCode;
import be.movie36.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // User tự xem profile
    public UserResponse getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        return toResponse(user);
    }

    // User tự cập nhật profile
    public UserResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        if (request.getGender() != null && !request.getGender().isEmpty()) {
            user.setGender(Gender.valueOf(request.getGender().toUpperCase()));
        }

        user = userRepository.save(user);
        return toResponse(user);
    }

    // Admin: Lấy tất cả user (phân trang)
    public Page<UserResponse> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(this::toResponse);
    }

    // Admin: Tạo tài khoản user mới
    public UserResponse createUser(RegisterRequest request) {
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
        return toResponse(userRepository.save(user));
    }

    // Admin: Lấy user theo ID
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        return toResponse(user);
    }

    // Admin: Cập nhật user (role, enabled, thông tin)
    public UserResponse updateUserByAdmin(Long id, AdminUpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            user.setFullName(request.getFullName());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getGender() != null && !request.getGender().isEmpty()) {
            user.setGender(Gender.valueOf(request.getGender().toUpperCase()));
        }
        if (request.getRole() != null && !request.getRole().isEmpty()) {
            user.setRole(Role.valueOf(request.getRole().toUpperCase()));
        }
        if (request.getEnabled() != null) {
            user.setEnabled(request.getEnabled());
        }

        user = userRepository.save(user);
        return toResponse(user);
    }

    private UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .gender(user.getGender() != null ? user.getGender().name() : null)
                .role(user.getRole() != null ? user.getRole().name() : null)
                .enabled(user.isEnabled())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
