const path = require("path");
// Load .env từ thư mục gốc của project (3 cấp lên từ src/Components/API/)
require("dotenv").config({ path: path.join(__dirname, "../../../.env") });
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const crypto = require("crypto");
const cron = require("node-cron");
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const { upload, uploadToCloudinary } = require("./utils/cloudinary");
const { sendEmail } = require("./utils/email");

const saltRounds = 10;

const app = express();
app.use(bodyParser.json());
app.use(cors());

// VNPay routes
app.use("/vnpay", require("./vnpay.route"));

// Đường dẫn file database.json
const databasePath = path.join(__dirname, "../../../database.json");

// Cấu hình VNPay (chỉ dùng cho /payment-result cũ)
const vnpayConfig = {
    vnp_TmnCode: process.env.VNPAY_TMN_CODE || "7HJM21XJ", // Mã TMN
    vnp_HashSecret: process.env.VNPAY_HASH_SECRET || "EUGNBYHOEDDNGAR4NW90DXOGTIXGS26I", // Secret Key
    vnp_Url: process.env.VNPAY_URL || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html", // URL thanh toán môi trường TEST
    vnp_ReturnUrl: process.env.VNPAY_LEGACY_RETURN_URL || "http://localhost:5000/payment-result", // URL trả về kết quả thanh toán
};

// Email helper (Resend)
const sendHtmlEmail = async ({ to, subject, html, text }) => {
    await sendEmail({ to, subject, html, text });
};

// Hàm đọc dữ liệu từ file database.json
function getDatabase() {
    try {
        const data = fs.readFileSync(databasePath, "utf8");
        if (!data || data.trim() === "") {
            console.error("Database file is empty!");
            return { accounts: [], movies: [], genres: [], languages: [], movietypes: [], screens: [], cinema: [], seatLocks: [], tickets: [] };
        }
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading database:", error);
        // Return empty database structure if file is corrupted
        return { accounts: [], movies: [], genres: [], languages: [], movietypes: [], screens: [], cinema: [], seatLocks: [], tickets: [] };
    }
}

// Hàm ghi dữ liệu vào file database.json an toàn
function saveDatabase(database) {
    try {
        // Validate JSON trước khi ghi
        const jsonString = JSON.stringify(database, null, 2);
        // Test parse để đảm bảo JSON hợp lệ
        JSON.parse(jsonString);
        // Ghi file với atomic write (ghi vào file tạm rồi rename)
        const tempPath = databasePath + ".tmp";
        fs.writeFileSync(tempPath, jsonString, "utf8");
        fs.renameSync(tempPath, databasePath);
    } catch (error) {
        console.error("Error saving database:", error);
        throw error;
    }
}

// API xử lý quên mật khẩu
app.post("/api/forgot-password", async (req, res) => {
    const { email } = req.body;

    const database = getDatabase();
    const accounts = database.accounts;

    // Kiểm tra xem email có tồn tại trong hệ thống không
    const user = accounts.find((u) => u.email === email);
    if (!user) {
        return res.status(404).json({ message: "Email không tồn tại trong hệ thống!" });
    }

    // Tạo token reset mật khẩu
    const resetToken = Math.random().toString(36).substring(2, 12);
    const tokenExpirationTime = Date.now() + 300000; // 5 phút

    // Gửi email
    const mailOptions = {
        to: email,
        subject: "Đặt lại mật khẩu của bạn",
        html: `
      <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; padding: 20px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
        <img src="https://duongvanluc2002.sirv.com/black_on_trans.png" width="100" height="100" alt="Logo" style="margin-bottom: 20px; display: block; margin-left: auto; margin-right: auto;">
          <h2 style="color: #333; text-align: center;">Xin chào ${user.full_name}</h2>
          <p style="font-size: 16px; color: #555;">Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Vui lòng sử dụng mã dưới đây để thay đổi mật khẩu của bạn:</p>
          <div style="text-align: center; margin: 20px 0;">
            <h3 style="font-size: 24px; color: #007bff; font-weight: bold;">${resetToken}</h3>
          </div>
          <p style="font-size: 16px; color: #555;">Nếu bạn không yêu cầu thay đổi mật khẩu, vui lòng bỏ qua email này. Mã đặt lại mật khẩu này sẽ hết hạn trong vòng 5 phút.</p>
          <hr style="border: 0; border-top: 1px solid #ddd; margin: 30px 0;">
          <p style="font-size: 14px; color: #777; text-align: center;">Nếu bạn gặp bất kỳ vấn đề gì, hãy liên hệ với chúng tôi qua email này.</p>
          <div style="text-align: center; margin-top: 30px;">
            <p style="font-size: 14px; color: #777;">Trân trọng,</p>
            <p style="font-size: 14px; color: #777;">Đội ngũ hỗ trợ khách hàng của chúng tôi</p>
          </div>
        </div>
      </div>
    `,
    };

    // Lưu token và thời gian hết hạn vào tài khoản
    user.resetToken = resetToken;
    user.resetTokenExpiration = tokenExpirationTime;

    try {
        await sendHtmlEmail({
            to: mailOptions.to,
            subject: mailOptions.subject,
            html: mailOptions.html,
            text: `Mã reset của bạn: ${resetToken} (hết hạn sau 5 phút)`,
        });
        saveDatabase(database);
        res.json({ message: "Email đặt lại mật khẩu đã được gửi!" });
    } catch (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({ message: "Gửi email thất bại!" });
    }
});

// API cập nhật mật khẩu mới
app.post("/api/reset-password", (req, res) => {
    const { email, resetToken, newPassword } = req.body;

    const database = getDatabase();
    const accounts = database.accounts;

    // Kiểm tra xem email có tồn tại trong hệ thống không
    const user = accounts.find((u) => u.email === email);
    if (!user) {
        return res.status(404).json({ message: "Email không tồn tại trong hệ thống!" });
    }

    // Kiểm tra token có hợp lệ không
    if (user.resetToken !== resetToken) {
        return res.status(400).json({ message: "Mã reset không hợp lệ!" });
    }

    // Kiểm tra xem token có hết hạn chưa
    if (Date.now() > user.resetTokenExpiration) {
        delete user.resetToken;
        delete user.resetTokenExpiration;
        saveDatabase(database);
        return res.status(400).json({ message: "Mã reset đã hết hạn!" });
    }

    // Cập nhật mật khẩu
    user.password = bcrypt.hashSync(newPassword, saltRounds);
    delete user.resetToken;
    delete user.resetTokenExpiration;
    saveDatabase(database);

    res.json({ message: "Mật khẩu đã được thay đổi thành công!" });
});

// API đăng ký
app.post("/api/register", async (req, res) => {
    const { full_name, email, password, phone, dob, gender, address } = req.body;

    const database = getDatabase();
    const accounts = database.accounts;

    // Kiểm tra email đã tồn tại chưa
    const existingUser = accounts.find((u) => u.email === email);
    if (existingUser) {
        return res.status(400).json({ message: "Email đã được sử dụng!" });
    }

    // Hash mật khẩu
    const hashedPassword = bcrypt.hashSync(password, saltRounds);

    // Tạo user mới
    const newUser = {
        id: uuidv4(),
        full_name,
        email,
        password: hashedPassword,
        phone,
        dob,
        gender,
        address,
        role: "user",
        status: "active",
        tickets: [],
        created_at: new Date().toISOString(),
    };

    accounts.push(newUser);
    saveDatabase(database);

    res.status(201).json({ message: "Đăng ký thành công!", user: { id: newUser.id, full_name: newUser.full_name, email: newUser.email, role: newUser.role } });
});

// API đăng nhập
app.post("/api/login", (req, res) => {
    const { email, password } = req.body;

    const database = getDatabase();
    const accounts = database.accounts;

    // Tìm user theo email
    const user = accounts.find((u) => u.email === email);
    if (!user) {
        return res.status(401).json({ message: "Email hoặc mật khẩu không đúng!" });
    }

    // Kiểm tra mật khẩu
    let isPasswordValid = false;
    if (user.password.startsWith('$2b$')) {
        // Hashed password
        isPasswordValid = bcrypt.compareSync(password, user.password);
    } else {
        // Plain text (for migration)
        isPasswordValid = password === user.password;
        if (isPasswordValid) {
            // Hash it now
            user.password = bcrypt.hashSync(password, saltRounds);
            saveDatabase(database);
        }
    }

    if (!isPasswordValid) {
        return res.status(401).json({ message: "Email hoặc mật khẩu không đúng!" });
    }

    if (user.status === "inactive") {
        return res.status(401).json({ message: "Tài khoản đã bị khóa!" });
    }

    res.json({ message: "Đăng nhập thành công!", user: { id: user.id, full_name: user.full_name, email: user.email, role: user.role } });
});

// Cron job để kiểm tra và xóa các token hết hạn
cron.schedule("* * * * *", () => {
    const database = getDatabase();
    const accounts = database.accounts;

    accounts.forEach((user) => {
        if (user.resetToken && Date.now() > user.resetTokenExpiration) {
            delete user.resetToken;
            delete user.resetTokenExpiration;

            saveDatabase(database);
        }
    });
});

// Khởi tạo seatLocks nếu chưa có trong database
function initializeSeatLocks() {
    const database = getDatabase();
    if (!database.seatLocks) {
        database.seatLocks = [];
        saveDatabase(database);
    }
}

// API lock ghế khi người dùng chọn và bấm tiếp tục
app.post("/api/lock-seats", (req, res) => {
    const {
        userEmail,
        movie,
        cinema,
        date,
        startTime,
        seats, // mảng các ghế
    } = req.body;

    initializeSeatLocks();
    const database = getDatabase();
    const seatLocks = database.seatLocks || [];

    // Thời gian hết hạn: 10 phút
    const expirationTime = Date.now() + 10 * 60 * 1000; // 10 phút

    // Xóa các lock cũ của cùng user cho cùng showtime (nếu có)
    const lockKey = `${movie}-${cinema}-${date}-${startTime}`;
    const filteredLocks = seatLocks.filter(
        (lock) => !(lock.userEmail === userEmail && lock.lockKey === lockKey)
    );

    // Tạo lock mới cho các ghế
    const newLocks = seats.map((seat) => ({
        id: uuidv4(),
        userEmail,
        movie,
        cinema,
        date,
        startTime,
        seat,
        lockKey,
        expirationTime,
        createdAt: Date.now(),
    }));

    database.seatLocks = [...filteredLocks, ...newLocks];
    saveDatabase(database);

    res.json({
        message: "Ghế đã được giữ thành công!",
        expirationTime: new Date(expirationTime).toISOString(),
    });
});

// API lấy danh sách ghế đang bị lock
app.get("/api/locked-seats", (req, res) => {
    const { movie, cinema, date, startTime } = req.query;

    initializeSeatLocks();
    const database = getDatabase();
    let seatLocks = database.seatLocks || [];

    // Lọc các lock hết hạn
    const now = Date.now();
    seatLocks = seatLocks.filter((lock) => lock.expirationTime > now);

    // Lọc theo showtime nếu có
    if (movie && cinema && date && startTime) {
        const lockKey = `${movie}-${cinema}-${date}-${startTime}`;
        seatLocks = seatLocks.filter((lock) => lock.lockKey === lockKey);
    }

    // Lưu lại sau khi lọc
    database.seatLocks = seatLocks;
    saveDatabase(database);

    // Trả về danh sách ghế đang bị lock
    const lockedSeats = seatLocks.map((lock) => lock.seat);
    res.json({ lockedSeats });
});

// API unlock ghế (khi thanh toán thành công hoặc hủy)
app.post("/api/unlock-seats", (req, res) => {
    const { userEmail, movie, cinema, date, startTime } = req.body;

    initializeSeatLocks();
    const database = getDatabase();
    let seatLocks = database.seatLocks || [];

    const lockKey = `${movie}-${cinema}-${date}-${startTime}`;

    // Xóa các lock của user này cho showtime này
    seatLocks = seatLocks.filter(
        (lock) => !(lock.userEmail === userEmail && lock.lockKey === lockKey)
    );

    database.seatLocks = seatLocks;
    saveDatabase(database);

    res.json({ message: "Đã mở khóa ghế thành công!" });
});

// API upload ảnh lên Cloudinary
app.post("/api/upload-image", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Không có file upload" });
        }
        const result = await uploadToCloudinary(req.file.buffer, "movie_app", {
            mimetype: req.file.mimetype,
            resource_type: req.file.mimetype?.startsWith("image/") ? "image" : "raw",
        });
        return res.json({
            url: result.secure_url,
            public_id: result.public_id,
            resource_type: result.resource_type,
        });
    } catch (error) {
        console.error("Upload Cloudinary error:", error);
        return res.status(500).json({ message: "Upload thất bại" });
    }
});

// Cron job để xóa các seat lock hết hạn (chạy mỗi phút)
cron.schedule("* * * * *", () => {
    initializeSeatLocks();
    const database = getDatabase();
    let seatLocks = database.seatLocks || [];

    const now = Date.now();
    const beforeCount = seatLocks.length;
    seatLocks = seatLocks.filter((lock) => lock.expirationTime > now);
    const afterCount = seatLocks.length;

    if (beforeCount !== afterCount) {
        database.seatLocks = seatLocks;
        saveDatabase(database);
    }
});

// // API xử lý thanh toán
// app.post("/payment", (req, res) => {
//     const ticketInfo = req.body;

//     // Tạo mã giao dịch (txnRef)
//     const txnRef = new Date().getTime();

//     // Thông tin thanh toán
//     const vnp_Params = {
//         vnp_TmnCode: vnpayConfig.vnp_TmnCode,
//         vnp_Amount: ticketInfo.totalAmount * 100, // Số tiền thanh toán, VNPay yêu cầu tính bằng đồng
//         vnp_OrderInfo: `Thanh toán vé phim ${ticketInfo.movieTitle}`,
//         vnp_ReturnUrl: vnpayConfig.vnp_ReturnUrl,
//         vnp_TxnRef: txnRef,
//         vnp_CreateDate: new Date().toISOString().replace(/[-T:\.Z]/g, ""), // Ngày tạo đơn hàng
//         vnp_Locale: "vn", // Hoặc "en" tùy thuộc vào ngôn ngữ bạn muốn
//         vnp_CurrCode: "VND", // Đơn vị tiền tệ
//         vnp_Version: "2.1.0", // Phiên bản API
//         vnp_Command: "pay", // Lệnh thanh toán
//         vnp_OrderType: "100000", // Loại đơn hàng, 100000 cho thanh toán trực tuyến
//         vnp_IpAddr: req.ip, // Địa chỉ IP người dùng
//         vnp_ExpireDate: new Date(Date.now() + 10 * 60 * 1000).toISOString().replace(/[-T:\.Z]/g, ""), // Thời gian hết hạn (10 phút)
//     };

//     // Tạo chữ ký
//     const queryString = Object.keys(vnp_Params)
//         .map((key) => `${key}=${vnp_Params[key]}`)
//         .join("&");

//     const secureHash = crypto
//         .createHmac("sha512", vnpayConfig.vnp_HashSecret)
//         .update(queryString)
//         .digest("hex");

//     // Thêm chữ ký vào tham số
//     vnp_Params.vnp_SecureHash = secureHash;

//     // Tạo URL thanh toán
//     const vnpUrl = `${vnpayConfig.vnp_Url}?${new URLSearchParams(vnp_Params).toString()}`;
//     console.log("URL Payment gửi đến VNPay:", vnpUrl);

//     // Trả về URL thanh toán
//     res.json({ url: vnpUrl });
// });

// Xử lý kết quả thanh toán
app.get("/payment-result", async (req, res) => {
    const vnpayData = req.query;
    const secureHash = vnpayData.vnp_SecureHash;

    const queryString = Object.keys(vnpayData)
        .filter((key) => key !== "vnp_SecureHash")
        .map((key) => `${key}=${vnpayData[key]}`)
        .join("&");

    const hashData = crypto
        .createHmac("sha512", vnpayConfig.vnp_HashSecret)
        .update(queryString)
        .digest("hex");

    if (secureHash === hashData && vnpayData.vnp_ResponseCode === "00") {
        // Thanh toán thành công
        const ticketInfo = {
            userName: vnpayData.vnp_BillFirstName,
            movieTitle: "Tên Phim", // Lấy thông tin phim từ database
            showDate: "Ngày Chiếu", // Lấy ngày chiếu
            showTime: "Giờ Chiếu", // Lấy giờ chiếu
            seats: "Ghế Đã Chọn", // Lấy ghế từ thông tin frontend
            totalAmount: vnpayData.vnp_Amount / 100, // Tiền đã thanh toán
        };

        // Gửi email thông báo cho người dùng
        try {
            await sendTicketEmail(vnpayData.vnp_BillEmail, ticketInfo);
            res.send("Thanh toán thành công và email đã được gửi.");
        } catch (error) {
            console.error("Error sending ticket email:", error);
            res.send("Thanh toán thành công nhưng gửi email thất bại.");
        }
    } else {
        res.send("Thanh toán thất bại.");
    }
});

// Hàm gửi email (Resend)
const sendTicketEmail = async (userEmail, ticketInfo) => {
    await sendHtmlEmail({
        to: userEmail,
        subject: `Thông tin vé đặt chỗ - ${ticketInfo.movieTitle}`,
        html: `
      <h2>Thông tin vé của bạn</h2>
      <p><strong>Người đặt:</strong> ${ticketInfo.userName}</p>
      <p><strong>Phim:</strong> ${ticketInfo.movieTitle}</p>
      <p><strong>Ngày chiếu:</strong> ${ticketInfo.showDate}</p>
      <p><strong>Giờ chiếu:</strong> ${ticketInfo.showTime}</p>
      <p><strong>Ghế:</strong> ${ticketInfo.seats}</p>
      <p><strong>Tổng tiền:</strong> ${ticketInfo.totalAmount}</p>
    `,
        text: `Người đặt: ${ticketInfo.userName}
Phim: ${ticketInfo.movieTitle}
Ngày chiếu: ${ticketInfo.showDate}
Giờ chiếu: ${ticketInfo.showTime}
Ghế: ${ticketInfo.seats}
Tổng tiền: ${ticketInfo.totalAmount}`,
    });
};
app.post("/api/confirm-booking", async (req, res) => {
    const {
        userEmail,
        fullName,
        phone,
        cinema,
        movie,
        duration,
        screen,
        seats,  // seats sẽ là mảng
        date,
        startTime,
        endTime,
        totalPrice,
    } = req.body;

    const database = getDatabase();
    const accounts = database.accounts;

    // Tìm tài khoản của người dùng
    const user = accounts.find((u) => u.email === userEmail);
    if (!user) {
        return res.status(404).json({ message: "Không tìm thấy tài khoản người dùng!" });
    }

    // Tạo ID cho ticket mới
    const ticketId = uuidv4();  // Tạo ID duy nhất cho ticket

    // Cập nhật thông tin vé vào tài khoản người dùng
    const newTicket = {
        id: ticketId,  // Thêm ID cho ticket
        movie,
        cinema,
        seats,  // Lưu seats dưới dạng mảng
        date,
        startTime,
        endTime,
        totalPrice,
        screen,
        status: "inactive",
    };

    user.tickets.push(newTicket);

    // Gửi email xác nhận
    const mailOptions = {
        to: userEmail,
        subject: "Xác nhận đặt vé",
        html: `
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
                <p style="font-size: 16px; color: #555;"><strong>Ghế:</strong> ${seats.join(", ")}</p>  <!-- Hiển thị seats dưới dạng chuỗi -->
                <p style="font-size: 16px; color: #555;"><strong>Ngày chiếu:</strong> ${date}</p>
                <p style="font-size: 16px; color: #555;"><strong>Thời gian chiếu:</strong> ${startTime} - ${endTime}</p>
                <p style="font-size: 16px; color: #555;"><strong>Phòng chiếu:</strong> ${screen}</p>
              </div>

              <!-- Total Price -->
              <div style="margin-bottom: 20px; border-top: 1px solid #f0f0f0; padding-top: 10px;">
                <p style="font-size: 16px; color: #555;"><strong>Tổng tiền:</strong> ${totalPrice.toLocaleString("vi-VN", { style: "currency", currency: "VND" })} (chưa thanh toán.)</p>
              </div>
            </div>

            <!-- Additional Information -->
            <div style="font-size: 16px; color: #555; margin-top: 20px; text-align: center;">
              <p style="font-size: 16px; color: #e74c3c; font-weight: bold;">Vui lòng mang thông tin này đến quầy để thanh toán và nhận vé. MOVIE88 xin cảm ơn!</p>
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
        `,
    };

    try {
        await sendHtmlEmail({
            to: mailOptions.to,
            subject: mailOptions.subject,
            html: mailOptions.html,
            text: `Mã vé: ${ticketId}\nPhim: ${movie}\nRạp: ${cinema}\nGhế: ${seats.join(", ")}\nNgày: ${date}\nGiờ: ${startTime} - ${endTime}\nPhòng: ${screen}\nTổng tiền: ${totalPrice}`,
        });
    } catch (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({ message: "Gửi email thất bại!" });
    }

    // Unlock seats sau khi thanh toán thành công
    initializeSeatLocks();
    let seatLocks = database.seatLocks || [];
    const lockKey = `${movie}-${cinema}-${date}-${startTime}`;
    seatLocks = seatLocks.filter(
        (lock) => !(lock.userEmail === userEmail && lock.lockKey === lockKey)
    );
    database.seatLocks = seatLocks;

    // Lưu thông tin vào database.json
    saveDatabase(database);

    res.json({ message: "Đặt vé thành công và email đã được gửi!", ticketId });
});


// Chạy server
const PORT = 5000;
app.listen(PORT, () => {
});
