import axiosClient from './axiosClient';

const bookingService = {
  create: (bookingData) => {
    return axiosClient.post('/api/bookings', bookingData);
  },
  getMyBookings: () => {
    return axiosClient.get('/api/bookings/my-bookings');
  },
  getById: (id) => {
    return axiosClient.get(`/api/bookings/${id}`);
  },
  pay: (id) => {
    return axiosClient.put(`/api/bookings/${id}/pay`);
  },
  cancel: (id) => {
    return axiosClient.delete(`/api/bookings/${id}`);
  }
};

export default bookingService;
