package be.movie36.service;


import be.movie36.dto.response.UserResponse;
import be.movie36.entity.User;
import be.movie36.exception.AppException;
import be.movie36.exception.ErrorCode;
import be.movie36.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public UserResponse getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

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
                .createdAt(user.getCreatedAt())
                .build();
    }
}