const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require('uuid');
const { sendEmail } = require("./utils/email");

const databasePath = path.join(__dirname, "../../../database.json");

// VNPAY configuration (tách ra env)
const vnp_TmnCode = process.env.VNPAY_TMN_CODE || "7HJM21XJ";
const vnp_HashSecret = process.env.VNPAY_HASH_SECRET || "EUGNBYHOEDDNGAR4NW90DXOGTIXGS26I";
const vnp_Url = process.env.VNPAY_URL || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
const vnp_ReturnUrl = process.env.VNPAY_RETURN_URL || "http://localhost:5000/vnpay/return";
const vnp_IpnUrl = process.env.VNPAY_IPN_URL || "http://localhost:5000/vnpay/ipn";

const sendHtmlEmail = async ({ to, subject, html, text }) => {
    await sendEmail({ to, subject, html, text });
};

// Helper function to sort object keys alphabetically
function sortObject(obj) {
    const sorted = {};
    const keys = Object.keys(obj).sort();
    keys.forEach((key) => {
        sorted[key] = obj[key];
    });
    return sorted;
}

// Helper function to create VNPAY secure hash
function createSecureHash(data) {
    const sortedData = sortObject(data);
    const signData = Object.keys(sortedData)
        .map((key) => `${key}=${encodeURIComponent(sortedData[key]).replace(/%20/g, "+")}`)
        .join("&");
    return crypto.createHmac("sha512", vnp_HashSecret).update(signData).digest("hex");
}

// Hàm đọc dữ liệu từ file database.json
function getDatabase() {
    return JSON.parse(fs.readFileSync(databasePath, "utf8"));
}

exports.createPayment = async (req, res) => {
    try {
        const { bookingData } = req.body;

        if (!bookingData) {
            return res.status(400).json({ message: "Thông tin đặt vé không hợp lệ." });
        }

        const {
            userEmail,
            fullName,
            phone,
            cinema,
            movie,
            duration,
            screen,
            seats,
            date,
            startTime,
            endTime,
            totalPrice,
        } = bookingData;

        // Tạo mã booking tạm thời
        const bookingCode = `MOVIE-${Date.now()}`;

        // Lưu booking vào pendingBookings
        const database = getDatabase();
        if (!database.pendingBookings) {
            database.pendingBookings = [];
        }

        const pendingBooking = {
            booking_code: bookingCode,
            userEmail,
            fullName,
            phone,
            cinema,
            movie,
            duration,
            screen,
            seats,
            date,
            startTime,
            endTime,
            totalPrice,
            createdAt: new Date().toISOString(),
        };

        database.pendingBookings.push(pendingBooking);
        fs.writeFileSync(databasePath, JSON.stringify(database, null, 2));

        // Tạo thông tin thanh toán VNPay
        const createDate = new Date().toISOString().replace(/[-:T.]/g, "").slice(0, 14);
        const ipAddr =
            req.headers["x-forwarded-for"] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket?.remoteAddress;

        const vnpParams = {
            vnp_Version: "2.1.0",
            vnp_Command: "pay",
            vnp_TmnCode: vnp_TmnCode,
            vnp_Amount: totalPrice * 100, // VNPay yêu cầu tính bằng đồng
            vnp_CurrCode: "VND",
            vnp_TxnRef: bookingCode,
            vnp_OrderInfo: `Thanh toán vé phim ${movie}`,
            vnp_OrderType: "100000",
            vnp_Locale: "vn",
            vnp_CreateDate: createDate,
            vnp_IpAddr: ipAddr,
            vnp_ReturnUrl: vnp_ReturnUrl,
        };

        vnpParams.vnp_SecureHash = createSecureHash(vnpParams);
        const queryString = new URLSearchParams(sortObject(vnpParams)).toString();
        const paymentUrl = `${vnp_Url}?${queryString}`;

        return res.status(200).json({
            message: "Tạo liên kết thanh toán thành công!",
            paymentUrl,
            booking_code: bookingCode,
        });
    } catch (err) {
        console.error("Lỗi khi tạo thanh toán VNPAY:", err);
        return res.status(500).json({ message: "Lỗi server khi xử lý thanh toán." });
    }
};

exports.ipn = async (req, res) => {
    try {
        let vnpParams = req.query;
        const secureHash = vnpParams["vnp_SecureHash"];
        delete vnpParams["vnp_SecureHash"];
        delete vnpParams["vnp_SecureHashType"];

        const calculatedHash = createSecureHash(vnpParams);

        if (secureHash !== calculatedHash) {
            return res.status(200).json({ RspCode: "97", Message: "Checksum failed" });
        }

        const bookingCode = vnpParams["vnp_TxnRef"];
        const vnpResponseCode = vnpParams["vnp_ResponseCode"];

        if (vnpResponseCode !== "00") {
            return res.status(200).json({ RspCode: vnpResponseCode, Message: "Payment failed" });
        }

        const database = getDatabase();
        const pendingBookings = database.pendingBookings || [];
        const pending = pendingBookings.find((b) => b.booking_code === bookingCode);

        if (!pending) {
            return res.status(404).json({ RspCode: "01", Message: "Không tìm thấy đơn đặt vé chờ." });
        }

        const {
            userEmail,
            fullName,
            phone,
            cinema,
            movie,
            duration,
            screen,
            seats,
            date,
            startTime,
            endTime,
            totalPrice,
        } = pending;

        // Tìm tài khoản người dùng
        const accounts = database.accounts || [];
        const user = accounts.find((u) => u.email === userEmail);
        if (!user) {
            return res.status(404).json({ RspCode: "01", Message: "Không tìm thấy tài khoản người dùng!" });
        }

        // Tạo ID cho ticket
        const ticketId = uuidv4();

        // Tạo ticket mới với status active (đã thanh toán)
        const newTicket = {
            id: ticketId,
            movie,
            cinema,
            seats,
            date,
            startTime,
            endTime,
            totalPrice,
            screen,
            status: "active", // Đã thanh toán
        };

        if (!user.tickets) {
            user.tickets = [];
        }
        user.tickets.push(newTicket);

        // Gửi email xác nhận
        const html = `
          <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 30px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; padding: 20px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
            
            <!-- Logo Section -->
            <div style="text-align: center;">
              <img src="https://duongvanluc2002.sirv.com/black_on_trans.png" width="120" height="120" alt="Logo" style="margin-bottom: 20px;">
            </div>

            <!-- Title Section -->
            <h2 style="color: #333; text-align: center; font-size: 24px; font-weight: bold; margin-bottom: 20px;">
              Xác nhận đặt vé cho <span style="color: #007BFF;">${movie}</span>
            </h2>

            <!-- Payment Success Notice -->
            <div style="background-color: #d4edda; border: 1px solid #c3e6cb; border-radius: 5px; padding: 15px; margin-bottom: 20px; text-align: center;">
              <p style="color: #155724; font-size: 18px; font-weight: bold; margin: 0;">Thanh toán thành công qua VNPay</p>
            </div>

            <!-- Ticket Information Section -->
            <div style="border-top: 2px solid #f0f0f0; padding-top: 20px;">
              
              <!-- Ticket ID -->
              <div style="margin-bottom: 15px;">
                <p style="font-size: 16px; color: #555;"><strong>Mã vé:</strong> ${ticketId}</p>
              </div>

              <!-- Booker's Information -->
              <div style="margin-bottom: 15px;">
                <p style="font-size: 16px; color: #555;"><strong>Người đặt:</strong> ${fullName}</p>
                <p style="font-size: 16px; color: #555;"><strong>Email:</strong> ${userEmail}</p>
                <p style="font-size: 16px; color: #555;"><strong>Số điện thoại:</strong> ${phone}</p>
              </div>

              <!-- Show Information -->
              <div style="margin-bottom: 20px;">
                <p style="font-size: 16px; color: #555;"><strong>Rạp chiếu:</strong> ${cinema}</p>
                <p style="font-size: 16px; color: #555;"><strong>Ghế:</strong> ${seats.join(", ")}</p>
                <p style="font-size: 16px; color: #555;"><strong>Ngày chiếu:</strong> ${date}</p>
                <p style="font-size: 16px; color: #555;"><strong>Thời gian chiếu:</strong> ${startTime} - ${endTime}</p>
                <p style="font-size: 16px; color: #555;"><strong>Phòng chiếu:</strong> ${screen}</p>
              </div>

              <!-- Total Price -->
              <div style="margin-bottom: 20px; border-top: 1px solid #f0f0f0; padding-top: 10px;">
                <p style="font-size: 18px; color: #007BFF; font-weight: bold;"><strong>Tổng tiền đã thanh toán:</strong> ${totalPrice.toLocaleString("vi-VN")} ₫</p>
              </div>
            </div>

            <!-- Additional Information -->
            <div style="font-size: 16px; color: #555; margin-top: 20px; text-align: center;">
              <p style="font-size: 16px; color: #28a745; font-weight: bold;">Vé của bạn đã được xác nhận và thanh toán thành công. Vui lòng mang theo thông tin này đến rạp để nhận vé. MOVIE88 xin cảm ơn!</p>
              <hr style="border: 0; border-top: 1px solid #ddd; margin: 30px 0;">
            </div>

            <!-- Footer Section -->
            <div style="text-align: center; font-size: 14px; color: #777;">
              <p style="font-size: 14px;">Nếu bạn gặp bất kỳ vấn đề gì, hãy liên hệ với chúng tôi qua email này.</p>
              <div style="margin-top: 20px;">
                <p>Trân trọng,</p>
                <p>Đội ngũ hỗ trợ khách hàng của chúng tôi</p>
              </div>
            </div>
          </div>
        </div>
        `;

        await sendHtmlEmail({
            to: userEmail,
            subject: "Xác nhận đặt vé - Thanh toán thành công",
            html,
            text: `Mã vé: ${ticketId}
Phim: ${movie}
Rạp: ${cinema}
Ghế: ${seats.join(", ")}
Ngày: ${date}
Giờ: ${startTime} - ${endTime}
Phòng: ${screen}
Tổng tiền: ${totalPrice.toLocaleString("vi-VN")} ₫`,
        });

        // Xóa pending booking
        database.pendingBookings = pendingBookings.filter((b) => b.booking_code !== bookingCode);

        // Unlock seats
        if (database.seatLocks) {
            const lockKey = `${movie}-${cinema}-${date}-${startTime}`;
            database.seatLocks = database.seatLocks.filter(
                (lock) => !(lock.userEmail === userEmail && lock.lockKey === lockKey)
            );
        }

        // Lưu database
        fs.writeFileSync(databasePath, JSON.stringify(database, null, 2));

        return res.status(200).json({ RspCode: "00", Message: "Success" });
    } catch (err) {
        console.error("Lỗi IPN:", err);
        return res.status(500).json({ RspCode: "99", Message: "Unknown error" });
    }
};

exports.return = async (req, res) => {
    try {
        let vnpParams = req.query;
        const secureHash = vnpParams["vnp_SecureHash"];
        delete vnpParams["vnp_SecureHash"];
        delete vnpParams["vnp_SecureHashType"];

        const calculatedHash = createSecureHash(vnpParams);

        if (secureHash === calculatedHash) {
            const bookingCode = vnpParams["vnp_TxnRef"];
            const vnpResponseCode = vnpParams["vnp_ResponseCode"];

            if (vnpResponseCode === "00") {
                return res.redirect(`http://localhost:3000/payment-success?booking_code=${bookingCode}`);
            } else {
                return res.redirect("http://localhost:3000/payment-failure");
            }
        } else {
            return res.redirect("http://localhost:3000/payment-failure?error=checksum_failed");
        }
    } catch (err) {
        console.error("Lỗi khi xử lý return URL:", err);
        return res.redirect("http://localhost:3000/payment-failure?error=server_error");
    }
};
