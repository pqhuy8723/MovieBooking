import axiosClient from './axiosClient';

const actorService = {
  // GET /api/actors
  getAll: async (page = 0, size = 5, name = "") => {
    let url = `/actors?page=${page}&size=${size}`;
    if (name) url += `&name=${encodeURIComponent(name)}`;
    const response = await axiosClient.get(url);
    return response.data;
  },

  // GET /api/actors/:id
  getById: async (id) => {
    const response = await axiosClient.get(`/actors/${id}`);
    return response.data;
  },

  // POST /api/actors
  create: async (data) => {
    const response = await axiosClient.post(`/actors`, data);
    return response.data;
  },

  // PUT /api/actors/:id
  update: async (id, data) => {
    const response = await axiosClient.put(`/actors/${id}`, data);
    return response.data;
  },

  // DELETE /api/actors/:id
  delete: async (id) => {
    const response = await axiosClient.delete(`/actors/${id}`);
    return response.data;
  },

  // PATCH /api/actors/:id/restore
  restore: async (id) => {
    const response = await axiosClient.patch(`/actors/${id}/restore`);
    return response.data;
  }
};

export default actorService;
