package be.movie36.service;

import be.movie36.constant.Message;
import be.movie36.entity.User;
import be.movie36.enums.Role;
import be.movie36.exception.ErrorCode;
import be.movie36.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;


@Service
@RequiredArgsConstructor
public class OAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {

        // Lấy thông tin user từ Google
        OAuth2User oAuth2User = super.loadUser(userRequest);
        Map<String, Object> attributes = oAuth2User.getAttributes();

        // Lấy email từ Google
        String email = (String) attributes.get("email");
        if (email == null) {
            throw new OAuth2AuthenticationException(
                    new OAuth2Error(Message.EMAIL_NOT_FOUND),
                    ErrorCode.GOOGLE_EMAIL_NOT_FOUND.getMessage()
            );
        }

        //  Tìm user trong DB — nếu chưa có thì tự động tạo mới
        User user = userRepository.findByEmail(email)
                .orElseGet(() -> createNewUser(attributes, email));

        return new DefaultOAuth2User(
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())),
                attributes,
                "email"
        );
    }

    // Tự động tạo tài khoản nếu đăng nhập Google lần đầu
    private User createNewUser(Map<String, Object> attributes, String email) {
        User newUser = User.builder()
                .email(email)
                .fullName((String) attributes.get("name"))
                .password("")
                .role(Role.USER)
                .enabled(true)
                .build();
        return userRepository.save(newUser);
    }
}
