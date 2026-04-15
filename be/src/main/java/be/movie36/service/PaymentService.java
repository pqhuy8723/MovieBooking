package be.movie36.service;

import be.movie36.config.VNPayConfig;
import be.movie36.dto.response.PaymentResponse;
import be.movie36.entity.Booking;
import be.movie36.entity.Seat;
import be.movie36.enums.BookingStatus;
import be.movie36.exception.AppException;
import be.movie36.exception.ErrorCode;
import be.movie36.repository.BookingRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.SimpleDateFormat;
import java.util.*;

@Service
@RequiredArgsConstructor
public class PaymentService {
    private final VNPayConfig vnPayConfig;
    private final BookingRepository bookingRepository;
    private final EmailService emailService;

    public PaymentResponse createPaymentUrl(Long bookingId, HttpServletRequest request) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new AppException(ErrorCode.INVALID_INPUT);
        }

        long amount = (long) (booking.getTotalPrice() * 100);

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", "2.1.0");
        vnp_Params.put("vnp_Command", "pay");
        vnp_Params.put("vnp_TmnCode", vnPayConfig.getVnpTmnCode());
        vnp_Params.put("vnp_Amount", String.valueOf(amount));
        vnp_Params.put("vnp_CurrCode", "VND");

        vnp_Params.put("vnp_TxnRef", booking.getBookingCode());
        vnp_Params.put("vnp_OrderInfo", "Thanh toan ve " + booking.getBookingCode());
        vnp_Params.put("vnp_OrderType", "other");

        String locate = "vn";
        vnp_Params.put("vnp_Locale", locate);

        vnp_Params.put("vnp_ReturnUrl", vnPayConfig.getVnpReturnUrl());
        vnp_Params.put("vnp_IpAddr", "127.0.0.1");

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnp_CreateDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

        cld.add(Calendar.MINUTE, 10);
        String vnp_ExpireDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

        String queryUrl = vnPayConfig.createQueryString(vnp_Params);

        return PaymentResponse.builder()
                .paymentUrl(vnPayConfig.getVnpPayUrl() + "?" + queryUrl)
                .build();
    }

    @Transactional
    public void processVnpayReturn(HttpServletRequest request) {
        Map<String, String> fields = new HashMap<>();
        for (Enumeration<String> params = request.getParameterNames(); params.hasMoreElements();) {
            String fieldName = params.nextElement();
            String fieldValue = request.getParameter(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                fields.put(fieldName, fieldValue);
            }
        }

        String vnp_SecureHash = request.getParameter("vnp_SecureHash");
        if (fields.containsKey("vnp_SecureHashType")) {
            fields.remove("vnp_SecureHashType");
        }
        if (fields.containsKey("vnp_SecureHash")) {
            fields.remove("vnp_SecureHash");
        }

        String signValue = vnPayConfig.hmacSHA512(vnPayConfig.getVnpHashSecret(), vnPayConfig.hashAllFields(fields));

        if (signValue.equals(vnp_SecureHash)) {
            if ("00".equals(request.getParameter("vnp_TransactionStatus"))) {
                String bookingCode = request.getParameter("vnp_TxnRef");
                Booking booking = bookingRepository.findByBookingCode(bookingCode)
                        .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

                if (booking.getStatus() == BookingStatus.PENDING) {
                    booking.setStatus(BookingStatus.PAID);
                    bookingRepository.save(booking);

                    List<String> seatNames = booking.getSeats().stream().map(Seat::getName).toList();
                    String totalAmountFormatted = String.format("%,.0f", booking.getTotalPrice());

                    emailService.sendBookingConfirmationEmail(
                            booking.getUser().getEmail(),
                            bookingCode,
                            booking.getShowtime().getMovie().getTitle(),
                            totalAmountFormatted,
                            seatNames);
                }
            } else {
                throw new AppException(ErrorCode.INVALID_INPUT);
            }
        } else {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
    }
}
