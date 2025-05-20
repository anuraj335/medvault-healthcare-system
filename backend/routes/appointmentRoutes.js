const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { verifyToken, isDoctor, isPatient } = require('../middleware/authMiddleware');

// Get all appointments for a doctor (doctor only)
router.get('/doctor/:doctorId', 
  verifyToken, 
  isDoctor, 
  appointmentController.getDoctorAppointments
);

// Get all appointments for a patient (patient only)
router.get('/patient/:patientId', 
  verifyToken, 
  isPatient, 
  appointmentController.getPatientAppointments
);

// Create a new appointment (both doctor and patient)
router.post('/', 
  verifyToken, 
  appointmentController.createAppointment
);

// Update an appointment (both doctor and patient)
router.put('/:id', 
  verifyToken, 
  appointmentController.updateAppointment
);

// Cancel an appointment (both doctor and patient)
router.patch('/:id/cancel', 
  verifyToken, 
  appointmentController.cancelAppointment
);

// Get detailed information about an appointment
router.get('/:id', 
  verifyToken, 
  appointmentController.getAppointmentDetails
);

// Get available time slots for a doctor on a specific day
router.get('/doctor/:doctorId/available-slots', 
  verifyToken, 
  appointmentController.getDoctorAvailableSlots
);

module.exports = router; 