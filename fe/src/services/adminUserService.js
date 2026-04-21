import axiosClient from './axiosClient';

const adminUserService = {
  // GET /api/admin/users?page=0&size=5
  getAll: async (page = 0, size = 5, gender = "", status = "") => {
    let url = `/admin/users?page=${page}&size=${size}`;
    if (gender) url += `&gender=${gender}`;
    if (status !== "") url += `&status=${status}`;
    const response = await axiosClient.get(url);
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
