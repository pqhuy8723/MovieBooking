import axiosClient from './axiosClient';

const bookingService = {
  create: (bookingData) => {
    return axiosClient.post('/bookings', bookingData);
  },
  getMyBookings: () => {
    return axiosClient.get('/bookings/my-bookings');
  },
  getById: (id) => {
    return axiosClient.get(`/bookings/${id}`);
  },
  pay: (id) => {
    return axiosClient.put(`/bookings/${id}/pay`);
  },
  createVNPayUrl: (bookingId) => {
    return axiosClient.post(`/payment/vnpay/create-payment`, null, { params: { bookingId } });
  },
  cancel: (id) => {
    return axiosClient.delete(`/bookings/${id}`);
  }
};

export default bookingService;
