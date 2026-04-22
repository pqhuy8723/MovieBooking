import axiosClient from './axiosClient';

const cinemaService = {
    // GET /api/cinemas
    getAll: async () => {
        const response = await axiosClient.get('/cinemas');
        return response.data;
    },

    // GET /api/cinemas/active
    getAllActive: async () => {
        const response = await axiosClient.get('/cinemas/active');
        return response.data;
    },

    // GET /api/cinemas/:id
    getById: async (id) => {
        const response = await axiosClient.get(`/cinemas/${id}`);
        return response.data;
    },

    // POST /api/cinemas
    create: async (data) => {
        const response = await axiosClient.post('/cinemas', data);
        return response.data;
    },

    // PUT /api/cinemas/:id
    update: async (id, data) => {
        const response = await axiosClient.put(`/cinemas/${id}`, data);
        return response.data;
    },

    // DELETE /api/cinemas/:id
    delete: async (id) => {
        const response = await axiosClient.delete(`/cinemas/${id}`);
        return response.data;
    },

    // PATCH /api/cinemas/:id/restore
    restore: async (id) => {
        const response = await axiosClient.patch(`/cinemas/${id}/restore`);
        return response.data;
    }
};

export default cinemaService;
