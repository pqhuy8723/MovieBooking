import axiosClient from './axiosClient';

const movieService = {
    // Lấy tất cả danh sách phim (Admin)
    getAll: async () => {
        const response = await axiosClient.get('/movies');
        return response.data;
    },

    // Lấy danh sách phim đang chiếu
    getAllActive: async () => {
        const response = await axiosClient.get('/movies/active');
        return response.data;
    },

    // Lấy chi tiết một bộ phim
    getById: async (id) => {
        const response = await axiosClient.get(`/movies/${id}`);
        return response.data;
    },

    // Phân trang hoặc tìm kiếm phim
    search: async (title) => {
        const response = await axiosClient.get(`/movies/search`, { params: { title } });
        return response.data;
    },

    // Lọc theo thể loại
    getByGenre: async (genreId) => {
        const response = await axiosClient.get(`/movies/genre/${genreId}`);
        return response.data;
    },

    // Lọc theo loại phim
    getByMovieType: async (movieTypeId) => {
        const response = await axiosClient.get(`/movies/type/${movieTypeId}`);
        return response.data;
    },

    // Thêm phim mới
    create: async (data) => {
        const response = await axiosClient.post('/movies', data);
        return response.data;
    },

    // Cập nhật phim
    update: async (id, data) => {
        const response = await axiosClient.put(`/movies/${id}`, data);
        return response.data;
    },

    // Xoá phim (hoặc ẩn)
    delete: async (id) => {
        const response = await axiosClient.delete(`/movies/${id}`);
        return response.data;
    }
};

export default movieService;
