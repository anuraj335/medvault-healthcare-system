const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const User = require('../models/User');

// Get doctor's profile
const getDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id })
      .populate('userId', 'name email');
    
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor profile not found' });
    }

    res.json(doctor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update doctor's profile
const updateDoctorProfile = async (req, res) => {
  try {
    const updateData = req.body;
    // Remove fields that shouldn't be updated directly
    delete updateData.userId;
    delete updateData.patients;

    const doctor = await Doctor.findOneAndUpdate(
      { userId: req.user._id },
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor profile not found' });
    }

    res.json(doctor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add or update doctor's availability
const updateAvailability = async (req, res) => {
  try {
    const { availability } = req.body;
    
    if (!availability || !Array.isArray(availability)) {
      return res.status(400).json({ error: 'Please provide availability as an array' });
    }

    const doctor = await Doctor.findOneAndUpdate(
      { userId: req.user._id },
      { $set: { availability } },
      { new: true, runValidators: true }
    );
    
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor profile not found' });
    }

    res.json(doctor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add qualification
const addQualification = async (req, res) => {
  try {
    const { degree, institution, year } = req.body;
    
    if (!degree || !institution) {
      return res.status(400).json({ error: 'Please provide degree and institution' });
    }

    const doctor = await Doctor.findOne({ userId: req.user._id });
    
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor profile not found' });
    }

    doctor.qualifications.push({ degree, institution, year });
    await doctor.save();

    res.status(201).json(doctor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update qualification
const updateQualification = async (req, res) => {
  try {
    const { qualificationId } = req.params;
    const updateData = req.body;
    
    const doctor = await Doctor.findOne({ userId: req.user._id });
    
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor profile not found' });
    }

    const qualificationIndex = doctor.qualifications.findIndex(
      qual => qual._id.toString() === qualificationId
    );
    
    if (qualificationIndex === -1) {
      return res.status(404).json({ error: 'Qualification not found' });
    }

    // Update the specific qualification
    Object.keys(updateData).forEach(key => {
      doctor.qualifications[qualificationIndex][key] = updateData[key];
    });

    await doctor.save();
    res.json(doctor.qualifications[qualificationIndex]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete qualification
const deleteQualification = async (req, res) => {
  try {
    const { qualificationId } = req.params;
    
    const doctor = await Doctor.findOne({ userId: req.user._id });
    
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor profile not found' });
    }

    // Find and remove the qualification
    doctor.qualifications = doctor.qualifications.filter(
      qual => qual._id.toString() !== qualificationId
    );

    await doctor.save();
    res.json({ message: 'Qualification deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get doctor's patients
const getDoctorPatients = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor profile not found' });
    }

    const patients = await Patient.find({ _id: { $in: doctor.patients } })
      .populate('userId', 'name email');

    res.json(patients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get specific patient details
const getPatientDetails = async (req, res) => {
  try {
    const patientId = req.params.patientId;
    
    const patient = await Patient.findById(patientId)
      .populate('userId', 'name email');
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    res.json(patient);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get patient's condition details
const getPatientConditionDetails = async (req, res) => {
  try {
    const patientId = req.params.patientId;
    
    const patient = await Patient.findById(patientId);
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    res.json(patient.conditionDetails || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get specific condition detail of a patient
const getPatientSpecificConditionDetail = async (req, res) => {
  try {
    const { patientId, conditionId } = req.params;
    
    const patient = await Patient.findById(patientId);
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
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

// Add medical history to patient
const addMedicalHistory = async (req, res) => {
  try {
    const patientId = req.params.patientId;
    const { date, diagnosis, treatment, notes } = req.body;
    
    // Validate required fields
    if (!date || !diagnosis || !treatment) {
      return res.status(400).json({ error: 'Please provide date, diagnosis, and treatment' });
    }

    const patient = await Patient.findById(patientId);
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Get doctor ID
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor profile not found' });
    }

    patient.medicalHistory.push({ 
      date, 
      diagnosis, 
      treatment, 
      notes,
      doctorId: doctor._id 
    });
    
    await patient.save();

    res.status(201).json(patient.medicalHistory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update medical history
const updateMedicalHistory = async (req, res) => {
  try {
    const { patientId, entryId } = req.params;
    const updateData = req.body;
    
    const patient = await Patient.findById(patientId);
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const entryIndex = patient.medicalHistory.findIndex(
      entry => entry._id.toString() === entryId
    );
    
    if (entryIndex === -1) {
      return res.status(404).json({ error: 'Medical history entry not found' });
    }

    // Get doctor ID
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor profile not found' });
    }

    // Check if the doctor created this entry
    if (patient.medicalHistory[entryIndex].doctorId && 
        patient.medicalHistory[entryIndex].doctorId.toString() !== doctor._id.toString()) {
      return res.status(403).json({ error: 'You can only update entries you created' });
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

// Delete medical history
const deleteMedicalHistory = async (req, res) => {
  try {
    const { patientId, entryId } = req.params;
    
    const patient = await Patient.findById(patientId);
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const entryIndex = patient.medicalHistory.findIndex(
      entry => entry._id.toString() === entryId
    );
    
    if (entryIndex === -1) {
      return res.status(404).json({ error: 'Medical history entry not found' });
    }

    // Get doctor ID
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor profile not found' });
    }

    // Check if the doctor created this entry
    if (patient.medicalHistory[entryIndex].doctorId && 
        patient.medicalHistory[entryIndex].doctorId.toString() !== doctor._id.toString()) {
      return res.status(403).json({ error: 'You can only delete entries you created' });
    }

    // Remove the entry
    patient.medicalHistory.splice(entryIndex, 1);
    await patient.save();

    res.json({ message: 'Medical history entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add prescription to patient
const addPrescription = async (req, res) => {
  try {
    const patientId = req.params.patientId;
    const { date, medication, dosage, frequency, duration, notes } = req.body;
    
    // Validate required fields
    if (!date || !medication || !dosage) {
      return res.status(400).json({ error: 'Please provide date, medication, and dosage' });
    }

    const patient = await Patient.findById(patientId);
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Get doctor ID
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor profile not found' });
    }

    patient.prescriptions.push({ 
      date, 
      medication, 
      dosage, 
      frequency, 
      duration, 
      notes,
      doctorId: doctor._id 
    });
    
    await patient.save();

    res.status(201).json(patient.prescriptions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update prescription
const updatePrescription = async (req, res) => {
  try {
    const { patientId, prescriptionId } = req.params;
    const updateData = req.body;
    
    const patient = await Patient.findById(patientId);
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const prescriptionIndex = patient.prescriptions.findIndex(
      prescription => prescription._id.toString() === prescriptionId
    );
    
    if (prescriptionIndex === -1) {
      return res.status(404).json({ error: 'Prescription not found' });
    }

    // Get doctor ID
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor profile not found' });
    }

    // Check if the doctor created this prescription
    if (patient.prescriptions[prescriptionIndex].doctorId && 
        patient.prescriptions[prescriptionIndex].doctorId.toString() !== doctor._id.toString()) {
      return res.status(403).json({ error: 'You can only update prescriptions you created' });
    }

    // Update the specific prescription
    Object.keys(updateData).forEach(key => {
      patient.prescriptions[prescriptionIndex][key] = updateData[key];
    });

    await patient.save();
    res.json(patient.prescriptions[prescriptionIndex]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete prescription
const deletePrescription = async (req, res) => {
  try {
    const { patientId, prescriptionId } = req.params;
    
    const patient = await Patient.findById(patientId);
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const prescriptionIndex = patient.prescriptions.findIndex(
      prescription => prescription._id.toString() === prescriptionId
    );
    
    if (prescriptionIndex === -1) {
      return res.status(404).json({ error: 'Prescription not found' });
    }

    // Get doctor ID
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor profile not found' });
    }

    // Check if the doctor created this prescription
    if (patient.prescriptions[prescriptionIndex].doctorId && 
        patient.prescriptions[prescriptionIndex].doctorId.toString() !== doctor._id.toString()) {
      return res.status(403).json({ error: 'You can only delete prescriptions you created' });
    }

    // Remove the prescription
    patient.prescriptions.splice(prescriptionIndex, 1);
    await patient.save();

    res.json({ message: 'Prescription deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Assign patient to doctor
const assignPatient = async (req, res) => {
  try {
    const { patientId } = req.body;
    
    // Validate patient ID
    if (!patientId) {
      return res.status(400).json({ error: 'Please provide patient ID' });
    }

    // Check if patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Check if doctor exists
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor profile not found' });
    }

    // Check if patient is already assigned to this doctor
    if (doctor.patients.includes(patientId)) {
      return res.status(400).json({ error: 'Patient already assigned to you' });
    }

    // Assign patient to doctor
    doctor.patients.push(patientId);
    await doctor.save();

    res.status(200).json(doctor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Remove patient from doctor
const removePatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    // Check if doctor exists
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor profile not found' });
    }

    // Check if patient is assigned to this doctor
    const patientIndex = doctor.patients.findIndex(id => id.toString() === patientId);
    if (patientIndex === -1) {
      return res.status(404).json({ error: 'Patient not assigned to you' });
    }

    // Remove patient from doctor
    doctor.patients.splice(patientIndex, 1);
    await doctor.save();

    res.status(200).json({ message: 'Patient removed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Search for patients (to assign)
const searchPatients = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Please provide a search query' });
    }

    // Find the doctor to exclude already assigned patients
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor profile not found' });
    }

    // Find all patients matching query by name or email, excluding already assigned patients
    const userMatches = await User.find({
      role: 'patient',
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    });

    // Get the patient IDs from the user matches
    const userIds = userMatches.map(user => user._id);

    // Find patients with the matching user IDs
    const patients = await Patient.find({
      userId: { $in: userIds },
      _id: { $nin: doctor.patients } // Exclude already assigned patients
    })
    .populate('userId', 'name email');

    res.json(patients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
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
}; 