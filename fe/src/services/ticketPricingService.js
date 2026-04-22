import axiosClient from './axiosClient';

const ticketPricingService = {
    // Lấy tất cả loại vé (cả active & inactive cho admin quản lý)
    getAll: async () => {
        const response = await axiosClient.get('/ticket-pricings');
        return response.data;
    },

    // Lấy danh sách loại vé đang active (thường dùng cho chức năng booking)
    getAllActive: async () => {
        const response = await axiosClient.get('/ticket-pricings/active');
        return response.data;
    },

    getById: async (id) => {
        const response = await axiosClient.get(`/ticket-pricings/${id}`);
        return response.data;
    },

    create: async (data) => {
        const response = await axiosClient.post('/ticket-pricings', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await axiosClient.put(`/ticket-pricings/${id}`, data);
        return response.data;
    },

    // Soft delete (chuyển sang INACTIVE)
    delete: async (id) => {
        const response = await axiosClient.delete(`/ticket-pricings/${id}`);
        return response.data;
    },

    // Restore (chuyển lại thành ACTIVE)
    restore: async (id) => {
        const response = await axiosClient.patch(`/ticket-pricings/${id}/restore`);
        return response.data;
    }
};

export default ticketPricingService;
