const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const mongoose = require('mongoose');

// Helper function to check if time slot is available
const isTimeSlotAvailable = async (doctorId, date, startTime, endTime, excludeAppointmentId = null) => {
  const appointmentDate = new Date(date);
  const startOfDay = new Date(appointmentDate.setHours(0, 0, 0, 0));
  const endOfDay = new Date(appointmentDate.setHours(23, 59, 59, 999));
  
  const query = {
    doctorId,
    date: { $gte: startOfDay, $lte: endOfDay },
    status: { $ne: 'cancelled' }
  };
  
  if (excludeAppointmentId) {
    query._id = { $ne: excludeAppointmentId };
  }
  
  const doctorAppointments = await Appointment.find(query);
  
  // Convert start and end time strings to comparable numbers (e.g., "09:30" -> 930)
  const requestedStart = parseInt(startTime.replace(':', ''));
  const requestedEnd = parseInt(endTime.replace(':', ''));
  
  for (const appointment of doctorAppointments) {
    const existingStart = parseInt(appointment.startTime.replace(':', ''));
    const existingEnd = parseInt(appointment.endTime.replace(':', ''));
    
    // Check for overlap
    if ((requestedStart >= existingStart && requestedStart < existingEnd) || 
        (requestedEnd > existingStart && requestedEnd <= existingEnd) ||
        (requestedStart <= existingStart && requestedEnd >= existingEnd)) {
      return false;
    }
  }
  
  return true;
};

// Helper function to check if doctor is available on the day
const isDoctorAvailableOnDay = async (doctorId, date) => {
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) return false;
  
  const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'lowercase' });
  return doctor.availability.some(slot => slot.day === dayOfWeek);
};

// Get all appointments for doctor
exports.getDoctorAppointments = async (req, res) => {
  try {
    const doctorId = req.params.doctorId;
    
    // Check if doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    
    // Get query parameters for filtering
    const { status, startDate, endDate } = req.query;
    
    // Build filter object
    const filter = { doctorId };
    
    if (status) {
      filter.status = status;
    }
    
    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else if (startDate) {
      filter.date = { $gte: new Date(startDate) };
    } else if (endDate) {
      filter.date = { $lte: new Date(endDate) };
    }
    
    // Find appointments and populate patient data
    const appointments = await Appointment.find(filter)
      .populate({
        path: 'patientId',
        select: 'userId',
        populate: {
          path: 'userId',
          select: 'name email'
        }
      })
      .populate({
        path: 'conditionId'
      })
      .sort({ date: 1, startTime: 1 });
    
    res.status(200).json(appointments);
  } catch (error) {
    console.error('Error in getDoctorAppointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
};

// Get all appointments for patient
exports.getPatientAppointments = async (req, res) => {
  try {
    const patientId = req.params.patientId;
    
    // Check if patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    // Get query parameters for filtering
    const { status, startDate, endDate } = req.query;
    
    // Build filter object
    const filter = { patientId };
    
    if (status) {
      filter.status = status;
    }
    
    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else if (startDate) {
      filter.date = { $gte: new Date(startDate) };
    } else if (endDate) {
      filter.date = { $lte: new Date(endDate) };
    }
    
    // Find appointments and populate doctor data
    const appointments = await Appointment.find(filter)
      .populate({
        path: 'doctorId',
        select: 'userId specialization hospital',
        populate: {
          path: 'userId',
          select: 'name email'
        }
      })
      .populate({
        path: 'conditionId'
      })
      .sort({ date: 1, startTime: 1 });
    
    res.status(200).json(appointments);
  } catch (error) {
    console.error('Error in getPatientAppointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
};

// Create a new appointment
exports.createAppointment = async (req, res) => {
  try {
    const { doctorId, patientId, date, startTime, endTime, reason, notes, conditionId } = req.body;
    
    // Validate required fields
    if (!doctorId || !patientId || !date || !startTime || !endTime || !reason) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Check if doctor and patient exist
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    // Check if doctor is available on that day
    const isAvailable = await isDoctorAvailableOnDay(doctorId, date);
    if (!isAvailable) {
      return res.status(400).json({ error: 'Doctor is not available on this day' });
    }
    
    // Check if time slot is available
    const timeSlotAvailable = await isTimeSlotAvailable(doctorId, date, startTime, endTime);
    if (!timeSlotAvailable) {
      return res.status(400).json({ error: 'Time slot is not available' });
    }
    
    // Create new appointment
    const appointment = new Appointment({
      doctorId,
      patientId,
      date,
      startTime,
      endTime,
      reason,
      notes,
      conditionId: conditionId || null
    });
    
    await appointment.save();
    
    res.status(201).json({
      message: 'Appointment created successfully',
      appointment
    });
  } catch (error) {
    console.error('Error in createAppointment:', error);
    res.status(500).json({ error: 'Failed to create appointment' });
  }
};

// Update an existing appointment
exports.updateAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const updates = req.body;
    
    // Check if appointment exists
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    // If updating time or date, check availability
    if ((updates.date && updates.date !== appointment.date.toISOString().split('T')[0]) ||
        (updates.startTime && updates.startTime !== appointment.startTime) ||
        (updates.endTime && updates.endTime !== appointment.endTime)) {
      
      const dateToCheck = updates.date || appointment.date.toISOString().split('T')[0];
      const startTimeToCheck = updates.startTime || appointment.startTime;
      const endTimeToCheck = updates.endTime || appointment.endTime;
      
      // Check if doctor is available on that day if date changes
      if (updates.date) {
        const isAvailable = await isDoctorAvailableOnDay(appointment.doctorId, dateToCheck);
        if (!isAvailable) {
          return res.status(400).json({ error: 'Doctor is not available on this day' });
        }
      }
      
      // Check if time slot is available
      const timeSlotAvailable = await isTimeSlotAvailable(
        appointment.doctorId, 
        dateToCheck, 
        startTimeToCheck, 
        endTimeToCheck, 
        appointmentId
      );
      
      if (!timeSlotAvailable) {
        return res.status(400).json({ error: 'Time slot is not available' });
      }
    }
    
    // Update appointment
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { $set: updates },
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      message: 'Appointment updated successfully',
      appointment: updatedAppointment
    });
  } catch (error) {
    console.error('Error in updateAppointment:', error);
    res.status(500).json({ error: 'Failed to update appointment' });
  }
};

// Cancel an appointment
exports.cancelAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    
    // Check if appointment exists
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    // Update status to cancelled
    appointment.status = 'cancelled';
    await appointment.save();
    
    res.status(200).json({
      message: 'Appointment cancelled successfully',
      appointment
    });
  } catch (error) {
    console.error('Error in cancelAppointment:', error);
    res.status(500).json({ error: 'Failed to cancel appointment' });
  }
};

// Get appointment details
exports.getAppointmentDetails = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    
    // Find appointment with detailed information
    const appointment = await Appointment.findById(appointmentId)
      .populate({
        path: 'doctorId',
        select: 'userId specialization hospital',
        populate: {
          path: 'userId',
          select: 'name email'
        }
      })
      .populate({
        path: 'patientId',
        select: 'userId dateOfBirth gender contactNumber',
        populate: {
          path: 'userId',
          select: 'name email'
        }
      })
      .populate({
        path: 'conditionId'
      });
    
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    res.status(200).json(appointment);
  } catch (error) {
    console.error('Error in getAppointmentDetails:', error);
    res.status(500).json({ error: 'Failed to fetch appointment details' });
  }
};

// Get doctor's available time slots for a specific day
exports.getDoctorAvailableSlots = async (req, res) => {
  try {
    const doctorId = req.params.doctorId;
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }
    
    // Check if doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    
    // Check if doctor works on this day
    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'lowercase' });
    const availabilityForDay = doctor.availability.find(slot => slot.day === dayOfWeek);
    
    if (!availabilityForDay) {
      return res.status(200).json({ available: false, message: 'Doctor does not work on this day', slots: [] });
    }
    
    // Get all appointments for this doctor on this day
    const appointmentDate = new Date(date);
    const startOfDay = new Date(appointmentDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(appointmentDate.setHours(23, 59, 59, 999));
    
    const existingAppointments = await Appointment.find({
      doctorId,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: 'cancelled' }
    });
    
    // Generate time slots (assuming 30-minute intervals)
    const slots = [];
    const intervalMinutes = 30;
    
    // Parse doctor's working hours
    const [startHour, startMinute] = availabilityForDay.startTime.split(':').map(Number);
    const [endHour, endMinute] = availabilityForDay.endTime.split(':').map(Number);
    
    let currentSlotStart = new Date(date);
    currentSlotStart.setHours(startHour, startMinute, 0, 0);
    
    const dayEnd = new Date(date);
    dayEnd.setHours(endHour, endMinute, 0, 0);
    
    while (currentSlotStart < dayEnd) {
      const slotStart = currentSlotStart.toTimeString().slice(0, 5);
      
      // Calculate slot end time
      const slotEndTime = new Date(currentSlotStart.getTime() + intervalMinutes * 60000);
      const slotEnd = slotEndTime.toTimeString().slice(0, 5);
      
      // Check if this slot overlaps with any existing appointment
      const isAvailable = await isTimeSlotAvailable(doctorId, date, slotStart, slotEnd);
      
      if (isAvailable) {
        slots.push({
          startTime: slotStart,
          endTime: slotEnd
        });
      }
      
      // Move to next slot
      currentSlotStart = slotEndTime;
    }
    
    res.status(200).json({
      available: true,
      workingHours: {
        start: availabilityForDay.startTime,
        end: availabilityForDay.endTime
      },
      slots
    });
  } catch (error) {
    console.error('Error in getDoctorAvailableSlots:', error);
    res.status(500).json({ error: 'Failed to fetch available time slots' });
  }
}; 