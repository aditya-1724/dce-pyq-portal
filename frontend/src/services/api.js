import axios from 'axios';

// 🔗 Backend ka URL - Railway URL daalega
const API_URL = process.env.REACT_APP_API_URL || 'https://dce-pyq-portal-production.up.railway.app';

// Axios instance banao
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Har request mein token add karo (agar login hai to)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('🚀 Request:', config.method.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - errors handle karne ke liye
api.interceptors.response.use(
  (response) => {
    console.log('✅ Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ Response Error:', error.message);
    
    // Network error - backend nahi chal raha
    if (error.code === 'ERR_NETWORK') {
      console.error('🔥 Backend server nahi chal raha!');
    }
    
    // Token expire ho gaya
    if (error.response?.status === 401) {
      console.log('🔑 Token expire - login page par bhejo');
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// ==================== AUTH APIs ====================

// Login
export const login = async (email, password) => {
  try {
    const response = await api.post('/login', { email, password });
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response;
  } catch (error) {
    throw error;
  }
};

// Signup
export const signup = async (userData) => {
  try {
    const response = await api.post('/signup', userData);
    return response;
  } catch (error) {
    throw error;
  }
};

// Forgot Password
export const forgotPassword = async (email, newPassword) => {
  try {
    const response = await api.post('/forgot-password', { email, newPassword });
    return response;
  } catch (error) {
    throw error;
  }
};

// Verify OTP
export const verifyOTP = async (email, otp) => {
  try {
    const response = await api.post('/verify-otp', { email, otp });
    return response;
  } catch (error) {
    throw error;
  }
};

// Resend OTP
export const resendOTP = async (email) => {
  try {
    const response = await api.post('/resend-otp', { email });
    return response;
  } catch (error) {
    throw error;
  }
};

// Reset Password with OTP
export const resetPasswordWithOTP = async (email, otp, newPassword) => {
  try {
    const response = await api.post('/reset-password-with-otp', { 
      email, 
      otp, 
      newPassword 
    });
    return response;
  } catch (error) {
    throw error;
  }
};

// Get Profile
export const getProfile = async () => {
  try {
    const response = await api.get('/profile');
    return response;
  } catch (error) {
    throw error;
  }
};

// Logout
export const logout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('user');
};

// ==================== SUBJECT APIs ====================

// Get all subjects
export const getAllSubjects = async () => {
  try {
    const response = await api.get('/subjects');
    return response;
  } catch (error) {
    throw error;
  }
};

// Get subjects by branch & semester
export const getSubjects = async (branch, semester) => {
  try {
    const response = await api.get(`/subjects/${branch}/${semester}`);
    return response;
  } catch (error) {
    throw error;
  }
};

// Add subject (admin)
export const addSubject = async (subjectData) => {
  try {
    const response = await api.post('/add-subject', subjectData);
    return response;
  } catch (error) {
    throw error;
  }
};

// Delete subject (admin)
export const deleteSubject = async (id) => {
  try {
    const response = await api.delete(`/delete-subject/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
};

// ==================== PYQ APIs ====================

// Get PYQs by subject, branch, semester
export const getPYQs = async (subjectId, branch, semester) => {
  try {
    const response = await api.get(`/pyqs/${subjectId}/${branch}/${semester}`);
    return response;
  } catch (error) {
    throw error;
  }
};

// Get all PYQs
export const getAllPYQs = async () => {
  try {
    const response = await api.get('/pyqs/all');
    return response;
  } catch (error) {
    throw error;
  }
};

// Upload PYQ (admin)
export const uploadPYQ = async (formData) => {
  try {
    const response = await api.post('/upload-pyq', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  } catch (error) {
    throw error;
  }
};

// Delete PYQ (admin)
export const deletePYQ = async (id) => {
  try {
    const response = await api.delete(`/delete-pyq/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
};

// ==================== ADMIN APIs ====================

// Get admin stats
export const getAdminStats = async () => {
  try {
    const response = await api.get('/admin/stats');
    return response;
  } catch (error) {
    throw error;
  }
};

// Get all users (admin)
export const getAllUsers = async () => {
  try {
    const response = await api.get('/users');
    return response;
  } catch (error) {
    throw error;
  }
};

// Delete user (admin)
export const deleteUser = async (id) => {
  try {
    const response = await api.delete(`/delete-user/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export default api;