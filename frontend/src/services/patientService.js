import api from './api';

const patientService = {
  // Get patient profile
  getProfile: async () => {
    const response = await api.get('/patients/profile');
    return response.data;
  },

  // Get patient's medical history
  getMedicalHistory: async () => {
    const response = await api.get('/patients/medical-history');
    return response.data;
  },

  // Get patient's prescriptions
  getPrescriptions: async () => {
    const response = await api.get('/patients/prescriptions');
    return response.data;
  },

  // Get patient's doctors
  getDoctors: async () => {
    const response = await api.get('/patients/doctors');
    return response.data;
  },

  // Get patient's condition details
  getConditionDetails: async () => {
    const response = await api.get('/patients/condition-details');
    return response.data;
  },

  // Get specific condition detail
  getSpecificConditionDetail: async (conditionId) => {
    const response = await api.get(`/patients/condition-details/${conditionId}`);
    return response.data;
  },

  // Add condition detail
  addConditionDetail: async (conditionData) => {
    const response = await api.post('/patients/condition-details', conditionData);
    return response.data;
  },

  // Update condition detail
  updateConditionDetail: async (conditionId, conditionData) => {
    const response = await api.put(`/patients/condition-details/${conditionId}`, conditionData);
    return response.data;
  },

  // Delete condition detail
  deleteConditionDetail: async (conditionId) => {
    const response = await api.delete(`/patients/condition-details/${conditionId}`);
    return response.data;
  },

  // Get patient's appointments
  getAppointments: async (status) => {
    let url = '/appointments/patient';
    if (status) {
      url += `?status=${status}`;
    }
    const response = await api.get(url);
    return response.data;
  },

  // Schedule a new appointment
  scheduleAppointment: async (appointmentData) => {
    const response = await api.post('/appointments', appointmentData);
    return response.data;
  },

  // Cancel an appointment
  cancelAppointment: async (appointmentId) => {
    const response = await api.patch(`/appointments/${appointmentId}/cancel`);
    return response.data;
  }
};

export default patientService; 