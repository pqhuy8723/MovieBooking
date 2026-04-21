import axiosClient from './axiosClient';

const directorService = {
  // GET /api/directors
  getAll: async (page = 0, size = 5, name = "") => {
    let url = `/directors?page=${page}&size=${size}`;
    if (name) url += `&name=${encodeURIComponent(name)}`;
    const response = await axiosClient.get(url);
    return response.data;
  },

  // GET /api/directors/:id
  getById: async (id) => {
    const response = await axiosClient.get(`/directors/${id}`);
    return response.data;
  },

  // POST /api/directors
  create: async (data) => {
    const response = await axiosClient.post(`/directors`, data);
    return response.data;
  },

  // PUT /api/directors/:id
  update: async (id, data) => {
    const response = await axiosClient.put(`/directors/${id}`, data);
    return response.data;
  },

  // DELETE /api/directors/:id
  delete: async (id) => {
    const response = await axiosClient.delete(`/directors/${id}`);
    return response.data;
  },

  // PATCH /api/directors/:id/restore
  restore: async (id) => {
    const response = await axiosClient.patch(`/directors/${id}/restore`);
    return response.data;
  }
};

export default directorService;
