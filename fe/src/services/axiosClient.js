import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:8080/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});


axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Nếu gặp lỗi 401 (chưa login hoặc session hết hạn) -> Phát sự kiện để AuthContext bắt lấy
    if (error.response && error.response.status === 401) {
      window.dispatchEvent(new Event('auth-unauthorized'));
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
