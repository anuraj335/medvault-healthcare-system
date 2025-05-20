import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Container, Typography, Box, Button, TextField, Grid, Paper,
  FormControl, InputLabel, Select, MenuItem, FormHelperText,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  Alert, CircularProgress, Card, CardContent, Chip
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { format } from 'date-fns';

const AppointmentScheduler = () => {
  // State for doctor list
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // State for form data
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');
  
  // State for time slots
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [doctorAvailable, setDoctorAvailable] = useState(true);
  
  // State for patient's conditions
  const [conditions, setConditions] = useState([]);
  
  // State for submission
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // State for validation
  const [formErrors, setFormErrors] = useState({});
  
  // Fetch doctor list on component mount
  useEffect(() => {
    fetchDoctors();
    fetchPatientConditions();
  }, []);
  
  // Fetch list of doctors
  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/patients/doctors', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDoctors(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch doctors. Please try again later.');
      setLoading(false);
    }
  };
  
  // Fetch patient's conditions
  const fetchPatientConditions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/patients/condition-details', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConditions(response.data);
    } catch (err) {
      console.error('Failed to fetch conditions:', err);
    }
  };
  
  // Fetch available time slots when doctor and date are selected
  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      fetchAvailableSlots();
    } else {
      setAvailableSlots([]);
    }
  }, [selectedDoctor, selectedDate]);
  
  // Fetch available time slots for the selected doctor and date
  const fetchAvailableSlots = async () => {
    setSlotsLoading(true);
    setDoctorAvailable(true);
    try {
      const token = localStorage.getItem('token');
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      
      const response = await axios.get(
        `/api/appointments/doctor/${selectedDoctor}/available-slots?date=${formattedDate}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.available) {
        setAvailableSlots(response.data.slots);
      } else {
        setDoctorAvailable(false);
        setAvailableSlots([]);
      }
      
      setSlotsLoading(false);
    } catch (err) {
      setError('Failed to fetch available time slots.');
      setSlotsLoading(false);
    }
  };
  
  // Handle doctor selection
  const handleDoctorChange = (event) => {
    setSelectedDoctor(event.target.value);
    setSelectedTimeSlot('');
    setFormErrors({ ...formErrors, doctor: '' });
  };
  
  // Handle date selection
  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedTimeSlot('');
    setFormErrors({ ...formErrors, date: '' });
  };
  
  // Handle time slot selection
  const handleTimeSlotChange = (event) => {
    setSelectedTimeSlot(event.target.value);
    setFormErrors({ ...formErrors, timeSlot: '' });
  };
  
  // Handle condition selection
  const handleConditionChange = (event) => {
    setSelectedCondition(event.target.value);
  };
  
  // Handle reason input
  const handleReasonChange = (event) => {
    setReason(event.target.value);
    setFormErrors({ ...formErrors, reason: '' });
  };
  
  // Handle notes input
  const handleNotesChange = (event) => {
    setNotes(event.target.value);
  };
  
  // Validate form before submission
  const validateForm = () => {
    const errors = {};
    
    if (!selectedDoctor) {
      errors.doctor = 'Please select a doctor';
    }
    
    if (!selectedDate) {
      errors.date = 'Please select a date';
    }
    
    if (!selectedTimeSlot) {
      errors.timeSlot = 'Please select a time slot';
    }
    
    if (!reason.trim()) {
      errors.reason = 'Please provide a reason for the appointment';
    }
    
    return errors;
  };
  
  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const [startTime, endTime] = selectedTimeSlot.split(' - ');
      
      // Get patient ID from token
      const userResponse = await axios.get('/api/patients/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const patientId = userResponse.data._id;
      
      // Create appointment
      await axios.post('/api/appointments', {
        doctorId: selectedDoctor,
        patientId,
        date: format(selectedDate, 'yyyy-MM-dd'),
        startTime,
        endTime,
        reason,
        notes,
        conditionId: selectedCondition || undefined
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Reset form and show success message
      setSuccess(true);
      setSelectedDoctor('');
      setSelectedDate(null);
      setSelectedTimeSlot('');
      setReason('');
      setNotes('');
      setSelectedCondition('');
      setFormErrors({});
      
      setSubmitting(false);
    } catch (err) {
      setError('Failed to schedule appointment. Please try again.');
      setSubmitting(false);
    }
  };
  
  // Close success dialog
  const handleCloseSuccessDialog = () => {
    setSuccess(false);
  };
  
  // Get doctor name by ID
  const getDoctorName = (id) => {
    const doctor = doctors.find(doc => doc._id === id);
    return doctor ? doctor.userId.name : '';
  };
  
  // Render time slot options
  const renderTimeSlotOptions = () => {
    if (!selectedDoctor || !selectedDate) {
      return (
        <MenuItem disabled>
          Please select a doctor and date first
        </MenuItem>
      );
    }
    
    if (slotsLoading) {
      return (
        <MenuItem disabled>
          Loading available time slots...
        </MenuItem>
      );
    }
    
    if (!doctorAvailable) {
      return (
        <MenuItem disabled>
          Doctor is not available on this day
        </MenuItem>
      );
    }
    
    if (availableSlots.length === 0) {
      return (
        <MenuItem disabled>
          No available time slots for this day
        </MenuItem>
      );
    }
    
    return availableSlots.map((slot, index) => (
      <MenuItem key={index} value={`${slot.startTime} - ${slot.endTime}`}>
        {slot.startTime} - {slot.endTime}
      </MenuItem>
    ));
  };

  return (
    <Container>
      <Box my={4}>
        <Typography variant="h4" gutterBottom>
          Schedule an Appointment
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          Book an appointment with your healthcare provider.
        </Typography>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {loading ? (
        <CircularProgress />
      ) : (
        <Paper sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth error={!!formErrors.doctor}>
                  <InputLabel id="doctor-select-label">Select a Doctor</InputLabel>
                  <Select
                    labelId="doctor-select-label"
                    value={selectedDoctor}
                    onChange={handleDoctorChange}
                    label="Select a Doctor"
                  >
                    {doctors.map(doctor => (
                      <MenuItem key={doctor._id} value={doctor._id}>
                        {doctor.userId.name} - {doctor.specialization}
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.doctor && (
                    <FormHelperText>{formErrors.doctor}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Appointment Date"
                    value={selectedDate}
                    onChange={handleDateChange}
                    minDate={new Date()}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        fullWidth 
                        error={!!formErrors.date}
                        helperText={formErrors.date || ''}
                      />
                    )}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!formErrors.timeSlot}>
                  <InputLabel id="time-slot-label">Select Time Slot</InputLabel>
                  <Select
                    labelId="time-slot-label"
                    value={selectedTimeSlot}
                    onChange={handleTimeSlotChange}
                    label="Select Time Slot"
                    disabled={!selectedDoctor || !selectedDate || slotsLoading}
                  >
                    {renderTimeSlotOptions()}
                  </Select>
                  {formErrors.timeSlot && (
                    <FormHelperText>{formErrors.timeSlot}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label="Reason for Appointment"
                  fullWidth
                  multiline
                  rows={2}
                  value={reason}
                  onChange={handleReasonChange}
                  error={!!formErrors.reason}
                  helperText={formErrors.reason || ''}
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="condition-label">Related Health Condition (Optional)</InputLabel>
                  <Select
                    labelId="condition-label"
                    value={selectedCondition}
                    onChange={handleConditionChange}
                    label="Related Health Condition (Optional)"
                  >
                    <MenuItem value="">None</MenuItem>
                    {conditions.map(condition => (
                      <MenuItem key={condition._id} value={condition._id}>
                        {condition.condition} - {condition.severity}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>
                    Linking your appointment to a specific condition helps your doctor prepare better
                  </FormHelperText>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label="Additional Notes (Optional)"
                  fullWidth
                  multiline
                  rows={3}
                  value={notes}
                  onChange={handleNotesChange}
                  placeholder="Any additional information you want to share with the doctor"
                />
              </Grid>
              
              <Grid item xs={12}>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary" 
                  size="large" 
                  fullWidth
                  disabled={submitting}
                >
                  {submitting ? 'Scheduling...' : 'Schedule Appointment'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      )}
      
      {/* Success Dialog */}
      <Dialog
        open={success}
        onClose={handleCloseSuccessDialog}
      >
        <DialogTitle>Appointment Scheduled</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Your appointment has been successfully scheduled. You will receive a confirmation soon.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSuccessDialog} color="primary" autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AppointmentScheduler; 