import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Room API calls
export const createRoom = (formData) => {
  return api.post('/room/create', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const updateRoom = (roomId, formData) => {
  return api.put(`/room/${roomId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const deleteRoom = (roomId) => api.delete(`/room/${roomId}`);
export const updateRoomAccess = (accessData) => api.put('/room/access', accessData);
export const searchRooms = (searchTerm, pageable) => api.get('/room/search', { params: { searchTerm, ...pageable } });
export const getAvailableRooms = (startTime, endTime) => api.get('/room/available', { params: { startTime, endTime } });
export const getRoomById = (roomId) => api.get(`/room/${roomId}`);
export const getOrganizationRooms = (pageable) => api.get('/room/organization', { params: pageable });
export const getAvailableRoomsWithCapacity = (startTime, endTime, minCapacity) => api.get('/room/available/capacity', { params: { startTime, endTime, minCapacity } });
export const getAllRooms = (pageable) => api.get('/room/all', { params: pageable });

// System Config API endpoints
export const getSystemAdminRegistrationEnabled = async () => {
    try {
        const response = await api.get('/api/system-config/system-admin-registration-enabled');
        return response.data;
    } catch (error) {
        console.error('Error checking system admin registration status:', error);
        throw error;
    }
};

export const setSystemAdminRegistrationEnabled = async (enabled) => {
    try {
        await api.put(`/api/system-config/system-admin-registration-enabled?enabled=${enabled}`);
    } catch (error) {
        console.error('Error updating system admin registration status:', error);
        throw error;
    }
};

export default api;