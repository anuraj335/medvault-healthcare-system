const express = require('express');
const router = express.Router();
const { 
  getDoctorProfile, 
  updateDoctorProfile,
  updateAvailability,
  addQualification,
  updateQualification,
  deleteQualification,
  getDoctorPatients, 
  getPatientDetails,
  getPatientConditionDetails,
  getPatientSpecificConditionDetail,
  addMedicalHistory,
  updateMedicalHistory,
  deleteMedicalHistory,
  addPrescription,
  updatePrescription,
  deletePrescription,
  assignPatient,
  removePatient,
  searchPatients
} = require('../controllers/doctorController');
const { verifyToken, doctorOnly } = require('../middleware/auth');
const { doctorPatientAccess } = require('../middleware/roleMiddleware');

// Apply auth middleware to all routes
router.use(verifyToken, doctorOnly);

// Doctor profile routes
router.get('/profile', getDoctorProfile);
router.put('/profile', updateDoctorProfile);
router.put('/availability', updateAvailability);

// Doctor qualifications routes
router.post('/qualifications', addQualification);
router.put('/qualifications/:qualificationId', updateQualification);
router.delete('/qualifications/:qualificationId', deleteQualification);

// Patient management routes
router.get('/patients', getDoctorPatients);
router.get('/patients/search', searchPatients);
router.get('/patients/:patientId', doctorPatientAccess, getPatientDetails);
router.post('/assign-patient', assignPatient);
router.delete('/patients/:patientId', removePatient);

// Patient condition details routes
router.get('/patients/:patientId/condition-details', doctorPatientAccess, getPatientConditionDetails);
router.get('/patients/:patientId/condition-details/:conditionId', doctorPatientAccess, getPatientSpecificConditionDetail);

// Medical history routes
router.post('/patients/:patientId/medical-history', doctorPatientAccess, addMedicalHistory);
router.put('/patients/:patientId/medical-history/:entryId', doctorPatientAccess, updateMedicalHistory);
router.delete('/patients/:patientId/medical-history/:entryId', doctorPatientAccess, deleteMedicalHistory);

// Prescription routes
router.post('/patients/:patientId/prescriptions', doctorPatientAccess, addPrescription);
router.put('/patients/:patientId/prescriptions/:prescriptionId', doctorPatientAccess, updatePrescription);
router.delete('/patients/:patientId/prescriptions/:prescriptionId', doctorPatientAccess, deletePrescription);

module.exports = router; 