const mongoose = require('mongoose');

const medicalHistorySchema = new mongoose.Schema({
  date: {
    type: String,
    required: true
  },
  diagnosis: {
    type: String,
    required: true
  },
  treatment: {
    type: String,
    required: true
  },
  notes: {
    type: String
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor'
  }
});

const prescriptionSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true
  },
  medication: {
    type: String,
    required: true
  },
  dosage: {
    type: String,
    required: true
  },
  frequency: {
    type: String
  },
  duration: {
    type: String
  },
  notes: {
    type: String
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor'
  }
});

const conditionDetailSchema = new mongoose.Schema({
  condition: {
    type: String,
    required: true
  },
  diagnosedDate: {
    type: String
  },
  severity: {
    type: String,
    enum: ['mild', 'moderate', 'severe']
  },
  currentSymptoms: [String],
  medications: [String],
  notes: {
    type: String
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

const patientSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  bloodGroup: {
    type: String
  },
  contactNumber: {
    type: String
  },
  emergencyContact: {
    name: String,
    relationship: String,
    contactNumber: String
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  allergies: [String],
  chronicConditions: [String],
  conditionDetails: [conditionDetailSchema],
  medicalHistory: [medicalHistorySchema],
  prescriptions: [prescriptionSchema]
}, { 
  timestamps: true 
});

const Patient = mongoose.model('Patient', patientSchema);

module.exports = Patient; 