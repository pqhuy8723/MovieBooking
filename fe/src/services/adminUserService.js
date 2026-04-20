import axiosClient from './axiosClient';

const adminUserService = {
  // GET /api/admin/users?page=0&size=5
  getAll: async (page = 0, size = 5) => {
    const response = await axiosClient.get(`/admin/users?page=${page}&size=${size}`);
    return response.data;
  },

  // GET /api/admin/users/:id
  getById: async (id) => {
    const response = await axiosClient.get(`/admin/users/${id}`);
    return response.data;
  },

  // POST /api/admin/users
  create: async (data) => {
    const response = await axiosClient.post(`/admin/users`, data);
    return response.data;
  },

  // PUT /api/admin/users/:id
  update: async (id, data) => {
    const response = await axiosClient.put(`/admin/users/${id}`, data);
    return response.data;
  },
};

export default adminUserService;
