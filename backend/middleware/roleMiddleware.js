const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');

// Check if doctor is assigned to patient
const doctorPatientAccess = async (req, res, next) => {
  try {
    const doctorId = req.user._id;
    const patientId = req.params.patientId;

    // Find doctor's record
    const doctor = await Doctor.findOne({ userId: doctorId });
    
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor record not found.' });
    }

    // Check if patient is in doctor's patients array
    if (doctor.patients.includes(patientId)) {
      next();
    } else {
      res.status(403).json({ error: 'Access denied. This patient is not assigned to you.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error checking doctor-patient relationship.' });
  }
};

// Check if patient is accessing their own data
const ownPatientData = (req, res, next) => {
  try {
    const userId = req.user._id;
    const requestedUserId = req.params.userId;

    if (userId.toString() === requestedUserId.toString()) {
      next();
    } else {
      res.status(403).json({ error: 'Access denied. You can only access your own data.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error checking user identity.' });
  }
};

module.exports = { doctorPatientAccess, ownPatientData }; 