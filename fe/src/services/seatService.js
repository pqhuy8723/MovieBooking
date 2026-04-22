import axiosClient from './axiosClient';

const seatService = {
    // GET /api/seats/screen/:screenId
    getAllByScreenId: async (screenId) => {
        const response = await axiosClient.get(`/seats/screen/${screenId}`);
        return response.data;
    },

    // GET /api/seats/:id
    getById: async (id) => {
        const response = await axiosClient.get(`/seats/${id}`);
        return response.data;
    },

    // POST /api/seats
    create: async (data) => {
        const response = await axiosClient.post('/seats', data);
        return response.data;
    },

    // POST /api/seats/generate
    generateSeats: async (data) => {
        const response = await axiosClient.post('/seats/generate', data);
        return response.data;
    },

    // PUT /api/seats/:id
    update: async (id, data) => {
        const response = await axiosClient.put(`/seats/${id}`, data);
        return response.data;
    },

    // DELETE /api/seats/:id
    delete: async (id) => {
        const response = await axiosClient.delete(`/seats/${id}`);
        return response.data;
    },

    // PATCH /api/seats/:id/restore
    restore: async (id) => {
        const response = await axiosClient.patch(`/seats/${id}/restore`);
        return response.data;
    }
};

export default seatService;
