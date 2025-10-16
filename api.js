// api.js
import axios from 'axios';

// Base API configuration
const API_URL = 'http://localhost:8000/api';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Handle API errors consistently
const handleApiError = (error) => {
  console.error('API Error:', error);
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.error('Response data:', error.response.data);
    console.error('Response status:', error.response.status);
    return Promise.reject(error.response.data.detail || 'An error occurred with the API');
  } else if (error.request) {
    // The request was made but no response was received
    console.error('No response received:', error.request);
    return Promise.reject('No response received from server');
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error('Request error:', error.message);
    return Promise.reject(error.message);
  }
};

// Patient API functions
export const patientsApi = {
  getAll: () => api.get('/patients/').catch(handleApiError),
  getById: (id) => api.get(`/patients/${id}`).catch(handleApiError),
  getComplete: (id) => api.get(`/patients/${id}/complete`).catch(handleApiError),
  getMedicalRecords: (id) => api.get(`/patients/${id}/medical_records`).catch(handleApiError),
  create: (data) => api.post('/patients/', data).catch(handleApiError),
  update: (id, data) => api.put(`/patients/${id}`, data).catch(handleApiError),
  delete: (id) => api.delete(`/patients/${id}`).catch(handleApiError),
};

// Medical Records API functions
export const medicalRecordsApi = {
  getById: (id) => api.get(`/medical_records/${id}`).catch(handleApiError),
  create: (data) => api.post('/medical_records/', data).catch(handleApiError),
  update: (id, data) => api.put(`/medical_records/${id}`, data).catch(handleApiError),
  delete: (id) => api.delete(`/medical_records/${id}`).catch(handleApiError),
};

// Insurance Policy API functions
export const policiesApi = {
  getForPatient: (patientId) => api.get(`/patients/${patientId}/insurance_policies`).catch(handleApiError),
  getById: (id) => api.get(`/insurance_policies/${id}`).catch(handleApiError),
  create: (data) => api.post('/insurance_policies/', data).catch(handleApiError),
  update: (id, data) => api.put(`/insurance_policies/${id}`, data).catch(handleApiError),
  delete: (id) => api.delete(`/insurance_policies/${id}`).catch(handleApiError),
};

// Claims API functions
export const claimsApi = {
  getForPatient: (patientId) => api.get(`/patients/${patientId}/claims`).catch(handleApiError),
  getById: (id) => api.get(`/claims/${id}`).catch(handleApiError),
  getComplete: (id) => api.get(`/claims/${id}/complete`).catch(handleApiError),
  create: (data) => api.post('/claims/', data).catch(handleApiError),
  update: (id, data) => api.put(`/claims/${id}`, data).catch(handleApiError),
  delete: (id) => api.delete(`/claims/${id}`).catch(handleApiError),
};

// Debug helper for testing backend fixes
export const debugApi = {
  getDashboardDebug: () => api.get('/dashboard/debug').catch(handleApiError),
};

export default api;