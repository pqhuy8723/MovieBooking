import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Lưu thông tin user ({ id, email, full_name, role })
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Khôi phục user state khi reload trang nhờ HTTP-only cookie gửi kèm request
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const data = await authService.getMe();
        // Giả sử API trả về định dạng { code, message, data: { user } }
        const userInfo = data.user || data.data; 
        setUser(userInfo); 
        setIsAuthenticated(true);
      } catch (error) {
        // Lỗi 401 hoặc chưa login -> Xóa state
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    checkLoginStatus();

    // Lắng nghe window event tử axios interceptor để tự động clear thẻ nếu session chết ngang
    const handleUnauthorized = () => {
      setUser(null);
      setIsAuthenticated(false);
    };
    window.addEventListener('auth-unauthorized', handleUnauthorized);

    return () => {
      window.removeEventListener('auth-unauthorized', handleUnauthorized);
    };
  }, []);

  const login = async (email, password) => {
    try {
      const data = await authService.login(email, password);
      // Giả sử API trả về user bên trong data hoặc data.user tuỳ thiết kế BE
      const userInfo = data.user || data.data || data; 
      setUser(userInfo); 
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Email hoặc mật khẩu không chính xác' 
      };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Lỗi khi logout:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
