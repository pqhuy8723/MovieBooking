const path = require("path");
// Load .env từ thư mục gốc của project (3 cấp lên từ src/Components/API/utils/)
require("dotenv").config({ path: path.join(__dirname, "../../../../.env") });
const { v2: cloudinary } = require("cloudinary");
const multer = require("multer");

const {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
} = process.env;

// Debug: Kiểm tra đường dẫn .env và các biến môi trường
const envPath = path.join(__dirname, "../../../../.env");

// Kiểm tra và cấu hình Cloudinary
if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  });
} else {
  console.warn("Cloudinary not configured properly. Please check .env file at:", envPath);
  console.warn("Required variables:");
  console.warn("CLOUDINARY_CLOUD_NAME=your_cloud_name");
  console.warn("CLOUDINARY_API_KEY=your_api_key");
  console.warn("   CLOUDINARY_API_SECRET=your_api_secret");
}

const storage = multer.memoryStorage();

// Multer middleware cho upload file
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// Upload buffer lên Cloudinary
const uploadToCloudinary = (buffer, folder = "movie_app", options = {}) => {
  return new Promise((resolve, reject) => {
    // Kiểm tra cấu hình Cloudinary trước khi upload
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
      return reject(new Error(
        "Cloudinary chưa được cấu hình. Vui lòng tạo file .env với các biến:\n" +
        "CLOUDINARY_CLOUD_NAME=your_cloud_name\n" +
        "CLOUDINARY_API_KEY=your_api_key\n" +
        "CLOUDINARY_API_SECRET=your_api_secret"
      ));
    }

    // Đảm bảo Cloudinary đã được cấu hình
    cloudinary.config({
      cloud_name: CLOUDINARY_CLOUD_NAME,
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET,
    });

    const { mimetype = "image/jpeg", resource_type = "image" } = options;

    const base64 = buffer.toString("base64");
    const dataUri = `data:${mimetype};base64,${base64}`;

    cloudinary.uploader.upload(
      dataUri,
      {
        folder,
        resource_type,
        transformation:
          resource_type === "image"
            ? [
                { width: 1600, height: 1600, crop: "limit" },
                { quality: "auto" },
              ]
            : undefined,
      },
      (err, result) => {
        if (err) {
          return reject(err);
        }
        resolve(result);
      }
    );
  });
};

module.exports = {
  upload,
  uploadToCloudinary,
};
