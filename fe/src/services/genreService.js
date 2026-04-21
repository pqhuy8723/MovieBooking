import axiosClient from './axiosClient';

const genreService = {
  // GET /api/genres
  getAll: async (page = 0, size = 5, name = "") => {
    let url = `/genres?page=${page}&size=${size}`;
    if (name) url += `&name=${encodeURIComponent(name)}`;
    const response = await axiosClient.get(url);
    return response.data;
  },

  // GET /api/genres/active
  getAllActive: async () => {
    const response = await axiosClient.get('/genres/active');
    return response.data;
  },

  // GET /api/genres/:id
  getById: async (id) => {
    const response = await axiosClient.get(`/genres/${id}`);
    return response.data;
  },

  // POST /api/genres
  create: async (data) => {
    const response = await axiosClient.post(`/genres`, data);
    return response.data;
  },

  // PUT /api/genres/:id
  update: async (id, data) => {
    const response = await axiosClient.put(`/genres/${id}`, data);
    return response.data;
  },

  // DELETE /api/genres/:id
  delete: async (id) => {
    const response = await axiosClient.delete(`/genres/${id}`);
    return response.data;
  },

  // PATCH /api/genres/:id/restore
  restore: async (id) => {
    const response = await axiosClient.patch(`/genres/${id}/restore`);
    return response.data;
  }
};

export default genreService;
