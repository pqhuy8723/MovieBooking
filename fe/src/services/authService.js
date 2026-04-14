import axiosClient from './axiosClient';

const authService = {
  login: async (email, password) => {
    const response = await axiosClient.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (userData) => {
    // Gọi đến API register của bạn ở BE (Có phân quyền user, email, password, etc)
    const response = await axiosClient.post('/auth/register', userData);
    return response.data;
  },

  logout: async () => {
    const response = await axiosClient.post('/auth/logout');
    return response.data;
  },

  getMe: async () => {
    const response = await axiosClient.get('/auth/me');
    return response.data;
  }
};

export default authService;
