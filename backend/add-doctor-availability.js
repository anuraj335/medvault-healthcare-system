require('dotenv').config();
const mongoose = require('mongoose');
const Doctor = require('./models/Doctor');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function addDoctorAvailability() {
  try {
    console.log('Searching for doctor with specialization "alzheimer"...');
    
    // Find the doctor by specialization
    const doctor = await Doctor.findOne({ specialization: 'alzheimer' });
    
    if (!doctor) {
      console.log('Doctor not found!');
      return;
    }
    
    console.log('Found doctor:', doctor._id);
    console.log('Current availability:', doctor.availability);
    
    // Add default availability (Monday to Friday, 9 AM to 5 PM)
    const defaultAvailability = [
      { day: 'monday', startTime: '09:00', endTime: '17:00' },
      { day: 'tuesday', startTime: '09:00', endTime: '17:00' },
      { day: 'wednesday', startTime: '09:00', endTime: '17:00' },
      { day: 'thursday', startTime: '09:00', endTime: '17:00' },
      { day: 'friday', startTime: '09:00', endTime: '17:00' }
    ];
    
    // Update the doctor's availability
    doctor.availability = defaultAvailability;
    await doctor.save();
    
    console.log('Doctor availability updated successfully!');
    console.log('New availability:', doctor.availability);
    
  } catch (error) {
    console.error('Error updating doctor availability:', error);
  } finally {
    mongoose.connection.close();
  }
}

addDoctorAvailability();