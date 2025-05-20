import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Container, Typography, Box, Paper, Tab, Tabs, Grid,
  Card, CardContent, CardActions, Button, Chip, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress, Alert, IconButton
} from '@mui/material';
import { 
  Event as EventIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  Info as InfoIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { format, parseISO, isAfter } from 'date-fns';

const AppointmentHistory = () => {
  // State for patient ID
  const [patientId, setPatientId] = useState('');
  
  // State for appointments
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for tab selection
  const [tabValue, setTabValue] = useState(0);
  
  // State for appointment detail dialog
  const [detailDialog, setDetailDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  
  // Fetch patient ID and appointments on component mount
  useEffect(() => {
    fetchPatientId();
  }, []);
  
  // Fetch patient ID from user profile
  const fetchPatientId = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/patients/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPatientId(response.data._id);
      fetchAppointments(response.data._id);
    } catch (err) {
      setError('Failed to fetch patient profile. Please try again later.');
      setLoading(false);
    }
  };
  
  // Fetch appointments with tab filter
  useEffect(() => {
    if (patientId) {
      fetchAppointments(patientId);
    }
  }, [patientId, tabValue]);
  
  // Fetch appointments from API
  const fetchAppointments = async (id) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Build query parameters
      let url = `/api/appointments/patient/${id}?`;
      
      // Add status filter based on tab
      if (tabValue === 1) {
        url += 'status=scheduled&';
      } else if (tabValue === 2) {
        url += 'status=completed&';
      } else if (tabValue === 3) {
        url += 'status=cancelled&';
      }
      
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setAppointments(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch appointments. Please try again later.');
      setLoading(false);
    }
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Open appointment detail dialog
  const handleOpenDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setDetailDialog(true);
  };
  
  // Close appointment detail dialog
  const handleCloseDetails = () => {
    setDetailDialog(false);
  };
  
  // Handle appointment cancellation
  const handleCancelAppointment = async (id) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.patch(`/api/appointments/${id}/cancel`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Refresh appointments
        fetchAppointments(patientId);
      } catch (err) {
        setError('Failed to cancel appointment. Please try again.');
      }
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    return format(parseISO(dateString), 'MMMM d, yyyy');
  };
  
  // Get status chip color
  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'primary';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      case 'no-show': return 'warning';
      default: return 'default';
    }
  };
  
  // Check if appointment can be cancelled (only future appointments)
  const canCancel = (appointment) => {
    return appointment.status === 'scheduled' && 
           isAfter(parseISO(appointment.date), new Date());
  };
  
  // Render empty state
  const renderEmptyState = () => {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          No appointments found
        </Typography>
        <Typography variant="body1" color="textSecondary">
          {tabValue === 0 && "You don't have any appointments yet."}
          {tabValue === 1 && "You don't have any upcoming appointments."}
          {tabValue === 2 && "You don't have any completed appointments."}
          {tabValue === 3 && "You don't have any cancelled appointments."}
        </Typography>
        {tabValue !== 1 && (
          <Button 
            variant="contained" 
            color="primary" 
            sx={{ mt: 2 }}
            href="/schedule-appointment"
          >
            Schedule an Appointment
          </Button>
        )}
      </Paper>
    );
  };

  return (
    <Container>
      <Box my={4}>
        <Typography variant="h4" gutterBottom>
          My Appointments
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          View and manage your healthcare appointments.
        </Typography>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="All Appointments" />
          <Tab label="Upcoming" />
          <Tab label="Completed" />
          <Tab label="Cancelled" />
        </Tabs>
      </Paper>
      
      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : appointments.length === 0 ? (
        renderEmptyState()
      ) : (
        <Grid container spacing={3}>
          {appointments.map((appointment) => (
            <Grid item xs={12} md={6} key={appointment._id}>
              <Card variant="outlined">
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">
                      Appointment with Dr. {appointment.doctorId.userId.name.split(' ')[1]}
                    </Typography>
                    <Chip 
                      label={appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      color={getStatusColor(appointment.status)}
                      size="small"
                    />
                  </Box>
                  
                  <Box display="flex" alignItems="center" mb={1}>
                    <EventIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body1">
                      {formatDate(appointment.date)}
                    </Typography>
                  </Box>
                  
                  <Box display="flex" alignItems="center" mb={1}>
                    <TimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body1">
                      {appointment.startTime} - {appointment.endTime}
                    </Typography>
                  </Box>
                  
                  <Box display="flex" alignItems="center" mb={2}>
                    <PersonIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body1">
                      {appointment.doctorId.specialization}
                    </Typography>
                  </Box>
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Reason:
                  </Typography>
                  <Typography variant="body1" paragraph sx={{ mb: 0 }}>
                    {appointment.reason.length > 100 
                      ? `${appointment.reason.substring(0, 100)}...` 
                      : appointment.reason
                    }
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    startIcon={<InfoIcon />}
                    onClick={() => handleOpenDetails(appointment)}
                  >
                    View Details
                  </Button>
                  
                  {canCancel(appointment) && (
                    <Button 
                      size="small" 
                      color="error" 
                      startIcon={<CancelIcon />}
                      onClick={() => handleCancelAppointment(appointment._id)}
                    >
                      Cancel
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Appointment Detail Dialog */}
      <Dialog
        open={detailDialog}
        onClose={handleCloseDetails}
        maxWidth="sm"
        fullWidth
      >
        {selectedAppointment && (
          <>
            <DialogTitle>
              Appointment Details
              <Chip 
                label={selectedAppointment.status.charAt(0).toUpperCase() + selectedAppointment.status.slice(1)}
                color={getStatusColor(selectedAppointment.status)}
                size="small"
                sx={{ ml: 2 }}
              />
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Doctor:</Typography>
                  <Typography variant="body1" gutterBottom>
                    Dr. {selectedAppointment.doctorId.userId.name}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Specialization:</Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedAppointment.doctorId.specialization}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Hospital/Clinic:</Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedAppointment.doctorId.hospital?.name || 'Not specified'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Date:</Typography>
                  <Typography variant="body1" gutterBottom>
                    {formatDate(selectedAppointment.date)}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Time:</Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedAppointment.startTime} - {selectedAppointment.endTime}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Reason for Visit:</Typography>
                  <Typography variant="body1" paragraph>
                    {selectedAppointment.reason}
                  </Typography>
                </Grid>
                
                {selectedAppointment.conditionId && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2">Related Condition:</Typography>
                    <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
                      <Typography variant="body1">
                        {selectedAppointment.conditionId.condition}
                      </Typography>
                      {selectedAppointment.conditionId.severity && (
                        <Chip 
                          label={selectedAppointment.conditionId.severity.charAt(0).toUpperCase() + selectedAppointment.conditionId.severity.slice(1)}
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      )}
                    </Paper>
                  </Grid>
                )}
                
                {selectedAppointment.notes && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2">Notes:</Typography>
                    <Typography variant="body1">
                      {selectedAppointment.notes}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              {canCancel(selectedAppointment) && (
                <Button 
                  color="error" 
                  onClick={() => {
                    handleCancelAppointment(selectedAppointment._id);
                    handleCloseDetails();
                  }}
                >
                  Cancel Appointment
                </Button>
              )}
              <Button onClick={handleCloseDetails}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default AppointmentHistory; 