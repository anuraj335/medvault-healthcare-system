const express = require('express');
const router = express.Router();
const { 
  getPatientProfile, 
  createPatientProfile,
  updatePatientProfile,
  updateEmergencyContact,
  updateAddress,
  deletePatientProfile,
  getChronicConditions,
  addChronicCondition,
  deleteChronicCondition,
  getAllergies,
  addAllergy,
  deleteAllergy,
  getConditionDetails,
  addConditionDetail,
  updateConditionDetail,
  deleteConditionDetail,
  getSpecificConditionDetail,
  getMedicalHistory, 
  addMedicalHistoryEntry,
  updateMedicalHistoryEntry,
  deleteMedicalHistoryEntry,
  getPrescriptions,
  addPrescriptionEntry,
  updatePrescriptionEntry,
  deletePrescriptionEntry,
  getAssignedDoctors
} = require('../controllers/patientController');
const { verifyToken, patientOnly } = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(verifyToken, patientOnly);

// Patient profile routes
router.get('/profile', getPatientProfile);
router.post('/profile', createPatientProfile);
router.put('/profile', updatePatientProfile);
router.delete('/profile', deletePatientProfile);

// Patient specific information routes
router.put('/emergency-contact', updateEmergencyContact);
router.put('/address', updateAddress);

// Chronic conditions routes
router.get('/conditions', getChronicConditions);
router.post('/conditions', addChronicCondition);
router.delete('/conditions/:condition', deleteChronicCondition);

// Condition details routes
router.get('/condition-details', getConditionDetails);
router.post('/condition-details', addConditionDetail);
router.get('/condition-details/:conditionId', getSpecificConditionDetail);
router.put('/condition-details/:conditionId', updateConditionDetail);
router.delete('/condition-details/:conditionId', deleteConditionDetail);

// Allergies routes
router.get('/allergies', getAllergies);
router.post('/allergies', addAllergy);
router.delete('/allergies/:allergy', deleteAllergy);

// Medical history routes
router.get('/medical-history', getMedicalHistory);
router.post('/medical-history', addMedicalHistoryEntry);
router.put('/medical-history/:entryId', updateMedicalHistoryEntry);
router.delete('/medical-history/:entryId', deleteMedicalHistoryEntry);

// Prescription routes
router.get('/prescriptions', getPrescriptions);
router.post('/prescriptions', addPrescriptionEntry);
router.put('/prescriptions/:entryId', updatePrescriptionEntry);
router.delete('/prescriptions/:entryId', deletePrescriptionEntry);

// Doctor routes
router.get('/doctors', getAssignedDoctors);

module.exports = router; 