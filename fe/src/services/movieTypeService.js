import axiosClient from './axiosClient';

const movieTypeService = {
    // GET /api/movietype — lấy tất cả (ADMIN)
    getAll: async () => {
        const response = await axiosClient.get('/movietype');
        return response.data;
    },

    // GET /api/movietype/active — lấy các movietype đang active (PUBLIC)
    getAllActive: async () => {
        const response = await axiosClient.get('/movietype/active');
        return response.data;
    },

    // GET /api/movietype/:id
    getById: async (id) => {
        const response = await axiosClient.get(`/movietype/${id}`);
        return response.data;
    },

    // POST /api/movietype (ADMIN)
    create: async (data) => {
        const response = await axiosClient.post('/movietype', data);
        return response.data;
    },

    // PUT /api/movietype/:id (ADMIN)
    update: async (id, data) => {
        const response = await axiosClient.put(`/movietype/${id}`, data);
        return response.data;
    },

    // DELETE /api/movietype/:id (ADMIN)
    delete: async (id) => {
        const response = await axiosClient.delete(`/movietype/${id}`);
        return response.data;
    },

    // PATCH /api/movietype/:id/restore (ADMIN)
    restore: async (id) => {
        const response = await axiosClient.patch(`/movietype/${id}/restore`);
        return response.data;
    }
};

export default movieTypeService;
