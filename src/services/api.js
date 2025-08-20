import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:4000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
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

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    return response?.data || { success: false, message: 'No response from server' };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Connection failed'
    };
  }
};

export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response?.data || { success: false, message: 'No response from server' };
  } catch (error) {
    console.error('Register error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Registration failed'
    };
  }
};

export const getProfile = async () => {
  try {
    const response = await api.get('/users/profile');
    return response.data;
  } catch (error) {
    console.error('Get profile error:', error);
    throw error;
  }
};

export const getEvents = async () => {
  try {
    const response = await api.get('/events');
    return response.data;
  } catch (error) {
    console.error('Get events error:', error);
    throw error;
  }
};

export const joinEvent = async (eventId) => {
  try {
    const response = await api.post(`/events/${eventId}/join`);
    return response.data;
  } catch (error) {
    console.error('Join event error:', error);
    throw error;
  }
};

export const leaveEvent = async (eventId) => {
  try {
    const response = await api.post(`/events/${eventId}/leave`);
    return response.data;
  } catch (error) {
    console.error('Leave event error:', error);
    throw error;
  }
};

// Announcement APIs removed (not implemented in backend)

// Event Management APIs
export const createEvent = async (eventData) => {
  try {
    const response = await api.post('/events', eventData);
    return response.data;
  } catch (error) {
    console.error('Create event error:', error);
    // Re throw with better error message for UI
    const message = error.response?.data?.message || error.response?.data?.errors?.join(', ') || 'Failed to create event';
    throw new Error(message);
  }
};

export const updateEvent = async (eventId, eventData) => {
  try {
    const response = await api.put(`/events/${eventId}`, eventData);
    return response.data;
  } catch (error) {
    console.error('Update event error:', error);
    throw error;
  }
};

export const deleteEvent = async (eventId) => {
  try {
    const response = await api.delete(`/events/${eventId}`);
    return response.data;
  } catch (error) {
    console.error('Delete event error:', error);
    throw error;
  }
};

export const removeVolunteerFromEvent = async (eventId, volunteerId) => {
  try {
    const response = await api.delete(`/events/${eventId}/volunteers/${volunteerId}`);
    return response.data;
  } catch (error) {
    console.error('Remove volunteer error:', error);
    throw error;
  }
};

// Announcement APIs
export const getMyAnnouncements = async () => {
  try {
    const response = await api.get('/announcements/my-announcements');
    return response.data;
  } catch (error) {
    console.error('Get announcements error:', error);
    throw error;
  }
};

export const markAnnouncementAsRead = async (announcementId) => {
  try {
    const response = await api.post(`/announcements/${announcementId}/read`);
    return response.data;
  } catch (error) {
    console.error('Mark announcement as read error:', error);
    throw error;
  }
};

export default api;
