package be.movie36.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ErrorCode {

    EMAIL_EXISTED(400, "Email đã được sử dụng"),
    WRONG_CREDENTIALS(401, "Email hoặc mật khẩu không đúng"),
    TOKEN_EXPIRED(401, "Token đã hết hạn, vui lòng đăng nhập lại"),
    TOKEN_INVALID(401, "Token không hợp lệ"),
    TOKEN_REVOKED(401, "Token đã bị thu hồi"),
    UNAUTHORIZED(403, "Không có quyền truy cập"),
    LOGIN_FAILED(401, "Email hoặc mật khẩu không chính xác"),
    USER_NOT_FOUND(404, "Không tìm thấy người dùng"),

    WRONG_OLD_PASSWORD(400, "Mật khẩu cũ không đúng"),
    PASSWORD_NOT_MATCH(400, "Mật khẩu mới và xác nhận mật khẩu không khớp"),
    SAME_PASSWORD(400, "Mật khẩu mới không được trùng với mật khẩu cũ"),

    INVALID_INPUT(400, "Dữ liệu không hợp lệ"),
    INVALID_GENDER(400, "Gender không hợp lệ, chỉ chấp nhận: MALE, FEMALE, OTHER"),
    INTERNAL_ERROR(500, "Lỗi hệ thống, vui lòng thử lại sau"),

    GOOGLE_EMAIL_NOT_FOUND(400, "Không lấy được email từ Google"),

    GENRE_NOT_FOUND(404, "Không tìm thấy thể loại phim"),
    GENRE_EXISTED(400, "Thể loại phim đã tồn tại"),

    LANGUAGE_NOT_FOUND(404, "Không tìm thấy ngôn ngữ"),
    LANGUAGE_EXISTED(400, "Ngôn ngữ đã tồn tại"),

    MOVIE_TYPE_NOT_FOUND(404, "Không tìm thấy loại phim"),
    MOVIE_TYPE_EXISTED(400, "Loại phim đã tồn tại"),

    INVALID_STATUS(400, "Trạng thái không hợp lệ, chỉ chấp nhận: ACTIVE, INACTIVE"),

    ACTOR_NOT_FOUND(404, "Không tìm thấy diễn viên"),
    ACTOR_EXISTED(400, "Diễn viên đã tồn tại"),
    DIRECTOR_NOT_FOUND(404, "Không tìm thấy đạo diễn"),
    DIRECTOR_EXISTED(400, "Đạo diễn đã tồn tại"),

    MOVIE_NOT_FOUND(404, "Không tìm thấy phim"),
    MOVIE_EXISTED(400, "Phim đã tồn tại"),
    MOVIE_HAS_ACTIVE_SHOWTIME(400, "Không thể xóa phim đang có suất chiếu active"),

    OTP_INVALID(400, "OTP không hợp lệ"),
    OTP_EXPIRED(400, "OTP đã hết hạn, vui lòng yêu cầu OTP mới"),
    OTP_USED(400, "OTP đã được sử dụng"),
    EMAIL_SEND_FAILED(500, "Gửi email thất bại, vui lòng thử lại"),

    CINEMA_NOT_FOUND(404, "Không tìm thấy rạp phim"),
    CINEMA_EXISTED(400, "Tên rạp phim đã tồn tại"),

    SCREEN_NOT_FOUND(404, "Không tìm thấy phòng chiếu"),
    SCREEN_EXISTED(400, "Tên phòng chiếu đã tồn tại trong rạp này"),

    SEAT_NOT_FOUND(404, "Không tìm thấy ghế"),
    SEAT_EXISTED(400, "Ghế đã tồn tại trong phòng chiếu này"),
    SEAT_CAPACITY_EXCEEDED(400, "Số lượng ghế vượt quá sức chứa của phòng chiếu"),
    INVALID_ROW_COL_COUNT(400, "Số lượng hàng ghế hoặc cột phải nằm trong khoảng (1-26)"),

    PRICING_NOT_FOUND(404, "Không tìm thấy bảng giá"),
    PRICING_EXISTED(400, "Loại giá vé này đã tồn tại"),

    SHOWTIME_NOT_FOUND(404, "Không tìm thấy suất chiếu"),
    SHOWTIME_TIME_CONFLICT(400, "Thời gian suất chiếu bị trùng lặp với lịch chiếu khác của phòng này"),

    BOOKING_NOT_FOUND(404, "Không tìm thấy giao dịch đặt vé"),
    SEAT_ALREADY_BOOKED(400, "Một hoặc nhiều ghế bạn chọn đã có người đặt, vui lòng chọn lại"),
    SEAT_NOT_IN_SCREEN(400, "Ghế không tồn tại trong phòng chiếu này"),
    BOOKING_EXPIRED(400, "Giao dịch đã hết hạn thanh toán"),
    BOOKING_ALREADY_PAID(400, "Giao dịch này đã được thanh toán rồi");

    private final int status;
    private final String message;
}
