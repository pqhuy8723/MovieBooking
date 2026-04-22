import axiosClient from './axiosClient';

const showtimeService = {
    // Lấy tất cả suất chiếu của phim (dùng cho admin edit)
    getByMovieId: async (movieId) => {
        const response = await axiosClient.get(`/showtimes/movie/${movieId}/all`);
        return response.data;
    },

    // Lấy danh sách suất chiếu của phim theo ngày
    getByMovieAndDate: async (movieId, date) => {
        const response = await axiosClient.get(`/showtimes/movie/${movieId}`, { params: { date } });
        return response.data;
    },

    // Lấy danh sách suất chiếu của phòng chiếu theo ngày
    getByScreenAndDate: async (screenId, date) => {
        const response = await axiosClient.get(`/showtimes/screen/${screenId}`, { params: { date } });
        return response.data;
    },

    // Lấy chi tiết suất chiếu
    getById: async (id) => {
        const response = await axiosClient.get(`/showtimes/${id}`);
        return response.data;
    },

    // Thêm suất chiếu mới
    create: async (data) => {
        const response = await axiosClient.post('/showtimes', data);
        return response.data;
    },

    // Cập nhật suất chiếu
    update: async (id, data) => {
        const response = await axiosClient.put(`/showtimes/${id}`, data);
        return response.data;
    },

    // Kéo suất chiếu về INACTIVE
    delete: async (id) => {
        const response = await axiosClient.delete(`/showtimes/${id}`);
        return response.data;
    },

    // Restore suất chiếu về ACTIVE
    restore: async (id) => {
        const response = await axiosClient.patch(`/showtimes/${id}/restore`);
        return response.data;
    }
};

export default showtimeService;
