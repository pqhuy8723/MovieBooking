package be.movie36.service;

import be.movie36.exception.AppException;
import be.movie36.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {
    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendOtpEmail(String toEmail, String otp) {
        try {

            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("[Movie36] Mã OTP đặt lại mật khẩu");
            message.setText(
                    "Xin chào!\n\n" +
                            "Mã OTP của bạn là: " + otp + "\n\n" +
                            "Mã có hiệu lực trong 10 phút.\n" +
                            "Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.\n\n" +
                            "Movie36 Team");
            mailSender.send(message);
        } catch (Exception e) {
            throw new AppException(ErrorCode.EMAIL_SEND_FAILED);
        }
    }

    public void sendBookingConfirmationEmail(String toEmail, String bookingCode, String movieTitle, String totalAmount, java.util.List<String> seats) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("[Movie36] Xác nhận thanh toán & Vé xem phim");
            message.setText(
                    "Xin chào!\n\n" +
                    "Bạn đã thanh toán thành công vé xem phim tại Movie36.\n\n" +
                    "Mã Đặt Vé: " + bookingCode + "\n" +
                    "Phim: " + movieTitle + "\n" +
                    "Ghế: " + String.join(", ", seats) + "\n" +
                    "Tổng tiền: " + totalAmount + " VNĐ\n\n" +
                    "Vui lòng đưa mã đặt vé này tại quầy để nhận vé cứng.\n\n" +
                    "Movie36 Team"
            );
            mailSender.send(message);
        } catch (Exception e) {
            // Log error but don't fail the transaction
            System.err.println("Failed to send ticket email: " + e.getMessage());
        }
    }
}
