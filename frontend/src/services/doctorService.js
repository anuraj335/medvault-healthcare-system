import api from './api';

const doctorService = {
  // Get doctor profile
  getProfile: async () => {
    const response = await api.get('/doctors/profile');
    return response.data;
  },

  // Get doctor's patients
  getPatients: async () => {
    const response = await api.get('/doctors/patients');
    return response.data;
  },

  // Search for patients (to assign)
  searchPatients: async (query) => {
    const response = await api.get(`/doctors/patients/search?query=${query}`);
    return response.data;
  },

  // Get specific patient details
  getPatientDetails: async (patientId) => {
    const response = await api.get(`/doctors/patients/${patientId}`);
    return response.data;
  },

  // Add medical history to patient
  addMedicalHistory: async (patientId, historyData) => {
    const response = await api.post(`/doctors/patients/${patientId}/medical-history`, historyData);
    return response.data;
  },

  // Add prescription to patient
  addPrescription: async (patientId, prescriptionData) => {
    const response = await api.post(`/doctors/patients/${patientId}/prescriptions`, prescriptionData);
    return response.data;
  },

  // Assign patient to doctor
  assignPatient: async (patientId) => {
    const response = await api.post('/doctors/assign-patient', { patientId });
    return response.data;
  },

  // Get patient's condition details
  getPatientConditionDetails: async (patientId) => {
    const response = await api.get(`/doctors/patients/${patientId}/condition-details`);
    return response.data;
  },

  // Get doctor's appointments
  getAppointments: async (filters = {}) => {
    let queryParams = '';
    
    if (filters.status) {
      queryParams += `status=${filters.status}&`;
    }
    
    if (filters.startDate) {
      queryParams += `startDate=${filters.startDate}&`;
    }
    
    if (filters.endDate) {
      queryParams += `endDate=${filters.endDate}&`;
    }
    
    if (queryParams) {
      queryParams = `?${queryParams.slice(0, -1)}`;
    }
    
    const response = await api.get(`/api/appointments/doctor${queryParams}`);
    return response.data;
  },

  // Update appointment status
  updateAppointment: async (appointmentId, updateData) => {
    const response = await api.put(`/api/appointments/${appointmentId}`, updateData);
    return response.data;
  },

  // Cancel appointment
  cancelAppointment: async (appointmentId) => {
    const response = await api.patch(`/api/appointments/${appointmentId}/cancel`);
    return response.data;
  },

  // Get available time slots for a specific day
  getAvailableTimeSlots: async (date) => {
    const response = await api.get(`/api/appointments/doctor/available-slots?date=${date}`);
    return response.data;
  }
};

export default doctorService; 