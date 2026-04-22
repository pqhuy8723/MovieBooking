import axiosClient from './axiosClient';

const screenService = {
    // GET /api/screens/cinema/:cinemaId
    getAllByCinemaId: async (cinemaId) => {
        const response = await axiosClient.get(`/screens/cinema/${cinemaId}`);
        return response.data;
    },

    // GET /api/screens/:id
    getById: async (id) => {
        const response = await axiosClient.get(`/screens/${id}`);
        return response.data;
    },

    // POST /api/screens
    create: async (data) => {
        const response = await axiosClient.post('/screens', data);
        return response.data;
    },

    // PUT /api/screens/:id
    update: async (id, data) => {
        const response = await axiosClient.put(`/screens/${id}`, data);
        return response.data;
    },

    // DELETE /api/screens/:id
    delete: async (id) => {
        const response = await axiosClient.delete(`/screens/${id}`);
        return response.data;
    },

    // PATCH /api/screens/:id/restore
    restore: async (id) => {
        const response = await axiosClient.patch(`/screens/${id}/restore`);
        return response.data;
    }
};

export default screenService;
