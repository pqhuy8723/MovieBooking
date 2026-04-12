package be.movie36.config;

import be.movie36.security.CustomUserDetailsService;
import be.movie36.security.OAuth2FailureHandler;
import be.movie36.security.OAuth2SuccessHandler;
import be.movie36.security.jwt.JwtAuthenticationEntryPoint;
import be.movie36.security.jwt.JwtAuthenticationFilter;
import be.movie36.service.OAuth2UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.web.HttpSessionOAuth2AuthorizationRequestRepository;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final OAuth2UserService oAuth2UserService;
    private final OAuth2SuccessHandler oAuth2SuccessHandler;
    private final OAuth2FailureHandler oAuth2FailureHandler;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public HttpSessionOAuth2AuthorizationRequestRepository authorizationRequestRepository() {
        return new HttpSessionOAuth2AuthorizationRequestRepository();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                // Auth — public
                                "/api/auth/register",
                                "/api/auth/login",
                                "/api/auth/refresh",
                                "/api/auth/forgot-password",
                                "/api/auth/reset-password",

                                // OAuth2
                                "/oauth2/**",
                                "/login/oauth2/code/**",

                                // Movie — public
                                "/api/movies/active",
                                "/api/movies/{id}",
                                "/api/movies/genre/**",
                                "/api/movies/type/**",

                                // Genre, Language, MovieType — public (chỉ active)
                                "/api/genres/active",
                                "/api/languages/active",
                                "/api/movie-types/active",

                                // Actor, Director — public
                                "/api/actors/**",
                                "/api/directors/**",

                                // Cinema, Screen, Seat, Pricing, Showtime — public
                                "/api/cinemas/active",
                                "/api/cinemas/{id}",
                                "/api/screens/cinema/**",
                                "/api/seats/screen/**",
                                "/api/ticket-pricings/active",
                                "/api/ticket-pricings/{id}",
                                "/api/showtimes/movie/**",
                                "/api/showtimes/screen/**",
                                "/api/showtimes/{id}",

                                // Swagger
                                "/swagger-ui/**",
                                "/v3/api-docs/**",

                                // Payment Callback
                                "/api/payment/vnpay/vnpay-return",

                                // Static
                                "/css/**",
                                "/js/**",
                                "/images/**")
                        .permitAll()

                        .requestMatchers(
                                "/api/admin/**",
                                "/api/movies/**",
                                "/api/genres/**",
                                "/api/languages/**",
                                "/api/movie-types/**",
                                "/api/cinemas/**",
                                "/api/screens/**",
                                "/api/seats/**",
                                "/api/ticket-pricings/**",
                                "/api/showtimes/**")
                        .hasRole("ADMIN")

                        .anyRequest().authenticated())
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(jwtAuthenticationEntryPoint))
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .oauth2Login(oauth2 -> oauth2
                        .authorizationEndpoint(authorization -> authorization
                                .authorizationRequestRepository(
                                        authorizationRequestRepository()))
                        .userInfoEndpoint(userInfo -> userInfo
                                .userService(oAuth2UserService))
                        .successHandler(oAuth2SuccessHandler)
                        .failureHandler(oAuth2FailureHandler))
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}