// frontend/src/services/api.js
import axios from 'axios';

// Change this to match your backend server port (4000)
const API_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

export const searchProperties = async (searchParams) => {
  try {
    console.log('Making API request to:', `${API_URL}/api/property/properties/search`);
    const response = await api.post('/api/property/properties/search', searchParams);
    return response.data;
  } catch (error) {
    console.error('Error searching properties:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    throw error;
  }
};

export const getLocationTrends = async (city) => {
  try {
    const response = await api.get(`/api/property/locations/${encodeURIComponent(city)}/trends`);
    return response.data;
  } catch (error) {
    console.error('Error fetching location trends:', error);
    throw error;
  }
};

export const sendChatMessage = async (messages) => {
  try {
    console.log('Making chat API request to:', `${API_URL}/api/chat`);
    const response = await api.post('/api/chat', { messages });
    return response.data;
  } catch (error) {
    console.error('Error sending chat message:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    throw error;
  }
};

export default api;