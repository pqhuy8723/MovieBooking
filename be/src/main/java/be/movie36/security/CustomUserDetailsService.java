package be.movie36.security;

import be.movie36.constant.Message;
import be.movie36.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import be.movie36.repository.UserRepository;
import be.movie36.entity.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {
    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email).orElseThrow(()-> new UsernameNotFoundException(ErrorCode.USER_NOT_FOUND + email));
        return new CustomUserDetails(user);
    }
}
