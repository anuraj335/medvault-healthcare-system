const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const User = require('../models/User');

// Get patient's profile
const getPatientProfile = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id })
      .populate('userId', 'name email');
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient profile not found' });
    }

    res.json(patient);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create complete patient profile
const createPatientProfile = async (req, res) => {
  try {
    const {
      dateOfBirth,
      gender,
      bloodGroup,
      contactNumber,
      emergencyContact,
      address,
      chronicConditions,
      allergies
    } = req.body;

    // Check if patient profile already exists
    let patient = await Patient.findOne({ userId: req.user._id });
    
    if (patient) {
      return res.status(400).json({ error: 'Patient profile already exists, use update instead' });
    }

    // Create patient profile
    patient = new Patient({
      userId: req.user._id,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      gender,
      bloodGroup,
      contactNumber,
      emergencyContact,
      address,
      chronicConditions: chronicConditions || [],
      allergies: allergies || [],
      medicalHistory: [],
      prescriptions: []
    });

    await patient.save();
    res.status(201).json(patient);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update patient's profile
const updatePatientProfile = async (req, res) => {
  try {
    const updateData = req.body;
    // Remove fields that shouldn't be updated directly
    delete updateData.userId;
    delete updateData.medicalHistory;
    delete updateData.prescriptions;

    const patient = await Patient.findOneAndUpdate(
      { userId: req.user._id },
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient profile not found' });
    }

    res.json(patient);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update emergency contact information
const updateEmergencyContact = async (req, res) => {
  try {
    const { name, relationship, contactNumber } = req.body;
    
    if (!name || !relationship || !contactNumber) {
      return res.status(400).json({ error: 'Please provide name, relationship, and contact number' });
    }

    const patient = await Patient.findOne({ userId: req.user._id });
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient profile not found' });
    }

    patient.emergencyContact = { name, relationship, contactNumber };
    await patient.save();

    res.json(patient.emergencyContact);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update address information
const updateAddress = async (req, res) => {
  try {
    const { street, city, state, zipCode, country } = req.body;
    
    if (!street || !city || !state || !zipCode || !country) {
      return res.status(400).json({ error: 'Please provide complete address information' });
    }

    const patient = await Patient.findOne({ userId: req.user._id });
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient profile not found' });
    }

    patient.address = { street, city, state, zipCode, country };
    await patient.save();

    res.json(patient.address);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete patient profile
const deletePatientProfile = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient profile not found' });
    }

    // Find doctors who have this patient assigned
    const doctors = await Doctor.find({ patients: patient._id });
    
    // Remove this patient from each doctor's patients list
    for (const doctor of doctors) {
      doctor.patients = doctor.patients.filter(p => p.toString() !== patient._id.toString());
      await doctor.save();
    }

    // Delete the patient document
    await Patient.deleteOne({ _id: patient._id });

    res.json({ message: 'Patient profile deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get patient's chronic conditions
const getChronicConditions = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient profile not found' });
    }

    res.json(patient.chronicConditions || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add chronic condition
const addChronicCondition = async (req, res) => {
  try {
    const { condition } = req.body;
    
    if (!condition) {
      return res.status(400).json({ error: 'Please provide a condition' });
    }

    const patient = await Patient.findOne({ userId: req.user._id });
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient profile not found' });
    }

    // Initialize array if it doesn't exist
    if (!patient.chronicConditions) {
      patient.chronicConditions = [];
    }

    // Check if condition already exists
    if (patient.chronicConditions.includes(condition)) {
      return res.status(400).json({ error: 'This condition is already in your list' });
    }

    patient.chronicConditions.push(condition);
    await patient.save();

    res.status(201).json(patient.chronicConditions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete chronic condition
const deleteChronicCondition = async (req, res) => {
  try {
    const { condition } = req.params;
    
    const patient = await Patient.findOne({ userId: req.user._id });
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient profile not found' });
    }

    // Remove the condition
    patient.chronicConditions = patient.chronicConditions.filter(c => c !== condition);
    await patient.save();

    res.json({ message: 'Condition removed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get patient's allergies
const getAllergies = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient profile not found' });
    }

    res.json(patient.allergies || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add allergy
const addAllergy = async (req, res) => {
  try {
    const { allergy } = req.body;
    
    if (!allergy) {
      return res.status(400).json({ error: 'Please provide an allergy' });
    }

    const patient = await Patient.findOne({ userId: req.user._id });
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient profile not found' });
    }

    // Initialize array if it doesn't exist
    if (!patient.allergies) {
      patient.allergies = [];
    }

    // Check if allergy already exists
    if (patient.allergies.includes(allergy)) {
      return res.status(400).json({ error: 'This allergy is already in your list' });
    }

    patient.allergies.push(allergy);
    await patient.save();

    res.status(201).json(patient.allergies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete allergy
const deleteAllergy = async (req, res) => {
  try {
    const { allergy } = req.params;
    
    const patient = await Patient.findOne({ userId: req.user._id });
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient profile not found' });
    }

    // Remove the allergy
    patient.allergies = patient.allergies.filter(a => a !== allergy);
    await patient.save();

    res.json({ message: 'Allergy removed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get patient's medical history
const getMedicalHistory = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient profile not found' });
    }

    res.json(patient.medicalHistory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add medical history entry
const addMedicalHistoryEntry = async (req, res) => {
  try {
    const { date, diagnosis, treatment, notes } = req.body;
    
    // Validate required fields
    if (!date || !diagnosis || !treatment) {
      return res.status(400).json({ error: 'Please provide date, diagnosis, and treatment' });
    }

    const patient = await Patient.findOne({ userId: req.user._id });
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient profile not found' });
    }

    patient.medicalHistory.push({ date, diagnosis, treatment, notes });
    await patient.save();

    res.status(201).json(patient.medicalHistory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update medical history entry
const updateMedicalHistoryEntry = async (req, res) => {
  try {
    const { entryId } = req.params;
    const updateData = req.body;
    
    const patient = await Patient.findOne({ userId: req.user._id });
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient profile not found' });
    }

    const entryIndex = patient.medicalHistory.findIndex(entry => entry._id.toString() === entryId);
    
    if (entryIndex === -1) {
      return res.status(404).json({ error: 'Medical history entry not found' });
    }

    // Update the specific entry
    Object.keys(updateData).forEach(key => {
      patient.medicalHistory[entryIndex][key] = updateData[key];
    });

    await patient.save();
    res.json(patient.medicalHistory[entryIndex]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete medical history entry
const deleteMedicalHistoryEntry = async (req, res) => {
  try {
    const { entryId } = req.params;
    
    const patient = await Patient.findOne({ userId: req.user._id });
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient profile not found' });
    }

    // Find and remove the entry
    patient.medicalHistory = patient.medicalHistory.filter(
      entry => entry._id.toString() !== entryId
    );

    await patient.save();
    res.json({ message: 'Medical history entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get patient's prescriptions
const getPrescriptions = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient profile not found' });
    }

    res.json(patient.prescriptions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add prescription entry
const addPrescriptionEntry = async (req, res) => {
  try {
    const { date, medication, dosage, frequency, duration, notes } = req.body;
    
    // Validate required fields
    if (!date || !medication || !dosage) {
      return res.status(400).json({ error: 'Please provide date, medication, and dosage' });
    }

    const patient = await Patient.findOne({ userId: req.user._id });
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient profile not found' });
    }

    patient.prescriptions.push({ date, medication, dosage, frequency, duration, notes });
    await patient.save();

    res.status(201).json(patient.prescriptions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update prescription entry
const updatePrescriptionEntry = async (req, res) => {
  try {
    const { entryId } = req.params;
    const updateData = req.body;
    
    const patient = await Patient.findOne({ userId: req.user._id });
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient profile not found' });
    }

    const entryIndex = patient.prescriptions.findIndex(entry => entry._id.toString() === entryId);
    
    if (entryIndex === -1) {
      return res.status(404).json({ error: 'Prescription entry not found' });
    }

    // Update the specific entry
    Object.keys(updateData).forEach(key => {
      patient.prescriptions[entryIndex][key] = updateData[key];
    });

    await patient.save();
    res.json(patient.prescriptions[entryIndex]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete prescription entry
const deletePrescriptionEntry = async (req, res) => {
  try {
    const { entryId } = req.params;
    
    const patient = await Patient.findOne({ userId: req.user._id });
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient profile not found' });
    }

    // Find and remove the entry
    patient.prescriptions = patient.prescriptions.filter(
      entry => entry._id.toString() !== entryId
    );

    await patient.save();
    res.json({ message: 'Prescription entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get patient's assigned doctors
const getAssignedDoctors = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient profile not found' });
    }

    // Find all doctors that have this patient assigned
    const doctors = await Doctor.find({ patients: patient._id })
      .populate('userId', 'name email');

    res.json(doctors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get patient's condition details
const getConditionDetails = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient profile not found' });
    }

    res.json(patient.conditionDetails || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add condition detail
const addConditionDetail = async (req, res) => {
  try {
    const { condition, diagnosedDate, severity, currentSymptoms, medications, notes } = req.body;
    
    if (!condition) {
      return res.status(400).json({ error: 'Please provide the condition name' });
    }

    const patient = await Patient.findOne({ userId: req.user._id });
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient profile not found' });
    }

    // Initialize array if it doesn't exist
    if (!patient.conditionDetails) {
      patient.conditionDetails = [];
    }

    // Check if the condition already has details
    const existingIndex = patient.conditionDetails.findIndex(
      detail => detail.condition.toLowerCase() === condition.toLowerCase()
    );

    if (existingIndex >= 0) {
      return res.status(400).json({ 
        error: 'Details for this condition already exist. Please use update instead.'
      });
    }

    // Add condition to chronicConditions array if not already present
    if (!patient.chronicConditions.includes(condition)) {
      patient.chronicConditions.push(condition);
    }

    // Create the new condition detail
    const newDetail = {
      condition,
      diagnosedDate,
      severity,
      currentSymptoms: currentSymptoms || [],
      medications: medications || [],
      notes,
      lastUpdated: new Date()
    };

    patient.conditionDetails.push(newDetail);
    await patient.save();

    res.status(201).json(newDetail);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update condition detail
const updateConditionDetail = async (req, res) => {
  try {
    const { conditionId } = req.params;
    const updateData = req.body;
    
    const patient = await Patient.findOne({ userId: req.user._id });
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient profile not found' });
    }

    const detailIndex = patient.conditionDetails.findIndex(
      detail => detail._id.toString() === conditionId
    );
    
    if (detailIndex === -1) {
      return res.status(404).json({ error: 'Condition detail not found' });
    }

    // Update only the provided fields
    Object.keys(updateData).forEach(key => {
      // Don't update the condition name itself
      if (key !== 'condition') {
        patient.conditionDetails[detailIndex][key] = updateData[key];
      }
    });

    // Update the lastUpdated timestamp
    patient.conditionDetails[detailIndex].lastUpdated = new Date();

    await patient.save();
    res.json(patient.conditionDetails[detailIndex]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete condition detail
const deleteConditionDetail = async (req, res) => {
  try {
    const { conditionId } = req.params;
    
    const patient = await Patient.findOne({ userId: req.user._id });
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient profile not found' });
    }

    // Find the condition detail
    const detailIndex = patient.conditionDetails.findIndex(
      detail => detail._id.toString() === conditionId
    );
    
    if (detailIndex === -1) {
      return res.status(404).json({ error: 'Condition detail not found' });
    }

    // Get the condition name before removing
    const conditionName = patient.conditionDetails[detailIndex].condition;

    // Remove the condition detail
    patient.conditionDetails.splice(detailIndex, 1);

    // Note: We don't automatically remove from chronicConditions 
    // as the patient might still have the condition even if they delete the details

    await patient.save();
    res.json({ 
      message: `Details for condition "${conditionName}" deleted successfully` 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a specific condition detail
const getSpecificConditionDetail = async (req, res) => {
  try {
    const { conditionId } = req.params;
    
    const patient = await Patient.findOne({ userId: req.user._id });
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient profile not found' });
    }

    const detail = patient.conditionDetails.find(
      detail => detail._id.toString() === conditionId
    );
    
    if (!detail) {
      return res.status(404).json({ error: 'Condition detail not found' });
    }

    res.json(detail);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
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
}; 