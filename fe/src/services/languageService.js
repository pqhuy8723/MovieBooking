import axiosClient from './axiosClient';

const languageService = {
  // GET /api/language
  getAll: async (page = 0, size = 5, name = "") => {
    let url = `/language?page=${page}&size=${size}`;
    if (name) url += `&name=${encodeURIComponent(name)}`;
    const response = await axiosClient.get(url);
    return response.data;
  },

  // GET /api/language/active
  getAllActive: async () => {
    const response = await axiosClient.get('/language/active');
    return response.data;
  },

  // GET /api/language/:id
  getById: async (id) => {
    const response = await axiosClient.get(`/language/${id}`);
    return response.data;
  },

  // POST /api/language
  create: async (data) => {
    const response = await axiosClient.post(`/language`, data);
    return response.data;
  },

  // PUT /api/language/:id
  update: async (id, data) => {
    const response = await axiosClient.put(`/language/${id}`, data);
    return response.data;
  },

  // DELETE /api/language/:id
  delete: async (id) => {
    const response = await axiosClient.delete(`/language/${id}`);
    return response.data;
  },

  // PATCH /api/language/:id/restore
  restore: async (id) => {
    const response = await axiosClient.patch(`/language/${id}/restore`);
    return response.data;
  }
};

export default languageService;
