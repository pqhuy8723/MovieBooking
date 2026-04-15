import axiosClient from './axiosClient';

const authService = {
  login: async (email, password) => {
    const response = await axiosClient.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (userData) => {
    const response = await axiosClient.post('/auth/register', userData);
    return response.data;
  },

  logout: async () => {
    const response = await axiosClient.post('/auth/logout');
    return response.data;
  },

  getMe: async () => {
    const response = await axiosClient.get('/users/profile');
    return response.data;
  },

  changePassword: async ({ oldPassword, newPassword, confirmPassword }) => {
    const response = await axiosClient.put('/auth/change-password', {
      oldPassword,
      newPassword,
      confirmPassword,
    });
    return response.data;
  },
};

export default authService;
