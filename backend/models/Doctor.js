const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  }
});

const doctorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  specialization: {
    type: String,
    required: true,
    trim: true
  },
  hospital: {
    name: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    }
  },
  qualifications: [{
    degree: String,
    institution: String,
    year: Number
  }],
  experience: {
    type: Number, // Years of experience
    default: 0
  },
  licenseNumber: {
    type: String
  },
  contactNumber: {
    type: String
  },
  bio: {
    type: String
  },
  availability: [availabilitySchema],
  patients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient'
  }]
}, { 
  timestamps: true 
});

const Doctor = mongoose.model('Doctor', doctorSchema);

module.exports = Doctor; 