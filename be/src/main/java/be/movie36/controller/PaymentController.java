package be.movie36.controller;

import be.movie36.dto.response.ApiResponse;
import be.movie36.dto.response.PaymentResponse;
import be.movie36.service.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payment/vnpay")
@RequiredArgsConstructor
public class PaymentController {
    private final PaymentService paymentService;

    @PostMapping("/create-payment")
    public ResponseEntity<ApiResponse<PaymentResponse>> createPaymentUrl(@RequestParam Long bookingId, HttpServletRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success("Tạo link thanh toán VNPay thành công", paymentService.createPaymentUrl(bookingId, request)));
    }

    @GetMapping("/vnpay-return")
    public ResponseEntity<String> vnpayReturn(HttpServletRequest request) {
        try {
            paymentService.processVnpayReturn(request);
            return ResponseEntity.ok("Thanh toán thành công. Bạn có thể đóng tab này.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Giao dịch thất bại hoặc lỗi bảo mật: " + e.getMessage());
        }
    }
}
