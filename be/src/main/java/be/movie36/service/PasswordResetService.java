package be.movie36.service;

import be.movie36.dto.request.ForgotPasswordRequest;
import be.movie36.dto.request.ResetPasswordRequest;
import be.movie36.dto.request.VerifyOtpRequest;
import be.movie36.entity.Otp;
import be.movie36.entity.User;
import be.movie36.exception.AppException;
import be.movie36.exception.ErrorCode;
import be.movie36.repository.OtpRepository;
import be.movie36.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class PasswordResetService {
    private final OtpRepository otpRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final RefreshTokenService refreshTokenService;

    // send otp
    @Transactional
    public void sendOtp(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        otpRepository.deleteByUserId(user.getId());

        String sendOtp = String.format("%06d", new Random().nextInt(999999));
        Otp resetOtp = Otp.builder()
                .otp(sendOtp)
                .user(user)
                .expiryDate(LocalDateTime.now().plusMinutes(10))
                .used(false)
                .build();
        otpRepository.save(resetOtp);

        emailService.sendOtpEmail(user.getEmail(), sendOtp);
    }

    // verify otp
    public void verifyOtp(VerifyOtpRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        Otp resetOtp = otpRepository.findByOtpAndUsedFalse(request.getOtp())
                .orElseThrow(() -> new AppException(ErrorCode.OTP_INVALID));

        if (!resetOtp.getUser().getId().equals(user.getId())) {
            throw new AppException(ErrorCode.OTP_INVALID);
        }

        if (resetOtp.getExpiryDate().isBefore(LocalDateTime.now())) {
            otpRepository.delete(resetOtp);
            throw new AppException(ErrorCode.OTP_EXPIRED);
        }
    }

    // resetpassword
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new AppException(ErrorCode.PASSWORD_NOT_MATCH);
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        Otp resetOtp = otpRepository.findByOtpAndUsedFalse(request.getOtp())
                .orElseThrow(() -> new AppException(ErrorCode.OTP_INVALID));

        if (!resetOtp.getUser().getId().equals(user.getId())) {
            throw new AppException(ErrorCode.OTP_INVALID);
        }

        if (resetOtp.getExpiryDate().isBefore(LocalDateTime.now())) {
            otpRepository.delete(resetOtp);
            throw new AppException(ErrorCode.OTP_EXPIRED);
        }

        resetOtp.setUsed(true);
        otpRepository.save(resetOtp);


        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);


        refreshTokenService.revokeAllTokensByUser(user.getId());
    }
}
