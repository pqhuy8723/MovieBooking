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

  updateProfile: async (profileData) => {
    const response = await axiosClient.put('/users/profile', profileData);
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

  forgotPassword: async (email) => {
    const response = await axiosClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  verifyOtp: async (email, otp) => {
    const response = await axiosClient.post('/auth/verify-otp', { email, otp });
    return response.data;
  },

  resetPassword: async ({ email, otp, newPassword, confirmPassword }) => {
    const response = await axiosClient.post('/auth/reset-password', {
      email,
      otp,
      newPassword,
      confirmPassword,
    });
    return response.data;
  },
};

export default authService;
