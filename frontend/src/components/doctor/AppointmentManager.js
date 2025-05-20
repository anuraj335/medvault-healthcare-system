import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Container, Typography, Box, Button, Grid, Paper, Tab, Tabs,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControl, MenuItem, Select, InputLabel,
  CircularProgress, Alert, IconButton, Tooltip
} from '@mui/material';
import {
  Info as InfoIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { format, isAfter, parseISO } from 'date-fns';

const AppointmentManager = () => {
  // State for doctor ID
  const [doctorId, setDoctorId] = useState('');
  
  // State for appointments
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for tab selection
  const [tabValue, setTabValue] = useState(0);
  
  // State for appointment detail dialog
  const [detailDialog, setDetailDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  
  // State for edit dialog
  const [editDialog, setEditDialog] = useState(false);
  const [editForm, setEditForm] = useState({
    status: '',
    notes: ''
  });
  
  // State for date filter
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Fetch doctor ID and appointments on component mount
  useEffect(() => {
    fetchDoctorId();
  }, []);
  
  // Fetch doctor ID from user profile
  const fetchDoctorId = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/doctors/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDoctorId(response.data._id);
      fetchAppointments(response.data._id);
    } catch (err) {
      setError('Failed to fetch doctor profile. Please try again later.');
      setLoading(false);
    }
  };
  
  // Fetch appointments with tab filter
  useEffect(() => {
    if (doctorId) {
      fetchAppointments(doctorId);
    }
  }, [doctorId, tabValue, startDate, endDate]);
  
  // Fetch appointments from API
  const fetchAppointments = async (id) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Build query parameters
      let url = `/api/appointments/doctor/${id}?`;
      
      // Add status filter based on tab
      if (tabValue === 1) {
        url += 'status=scheduled&';
      } else if (tabValue === 2) {
        url += 'status=completed&';
      } else if (tabValue === 3) {
        url += 'status=cancelled&';
      }
      
      // Add date range filter
      if (startDate) {
        url += `startDate=${startDate}&`;
      }
      
      if (endDate) {
        url += `endDate=${endDate}&`;
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
  
  // Open edit dialog
  const handleOpenEdit = (appointment) => {
    setSelectedAppointment(appointment);
    setEditForm({
      status: appointment.status,
      notes: appointment.notes || ''
    });
    setEditDialog(true);
  };
  
  // Close edit dialog
  const handleCloseEdit = () => {
    setEditDialog(false);
  };
  
  // Handle edit form changes
  const handleEditFormChange = (event) => {
    const { name, value } = event.target;
    setEditForm({ ...editForm, [name]: value });
  };
  
  // Submit edit form
  const handleEditSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/appointments/${selectedAppointment._id}`, editForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Refresh appointments
      fetchAppointments(doctorId);
      handleCloseEdit();
    } catch (err) {
      setError('Failed to update appointment. Please try again.');
    }
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
        fetchAppointments(doctorId);
      } catch (err) {
        setError('Failed to cancel appointment. Please try again.');
      }
    }
  };
  
  // Handle appointment completion
  const handleCompleteAppointment = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/appointments/${id}`, { status: 'completed' }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Refresh appointments
      fetchAppointments(doctorId);
    } catch (err) {
      setError('Failed to mark appointment as completed. Please try again.');
    }
  };
  
  // Handle date filter changes
  const handleStartDateChange = (event) => {
    setStartDate(event.target.value);
  };
  
  const handleEndDateChange = (event) => {
    setEndDate(event.target.value);
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMMM d, yyyy');
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
  
  // Check if appointment can be marked as completed (only scheduled appointments)
  const canComplete = (appointment) => {
    return appointment.status === 'scheduled';
  };

  return (
    <Container>
      <Box my={4}>
        <Typography variant="h4" gutterBottom>
          Manage Appointments
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          View and manage your patient appointments.
        </Typography>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ mb: 3 }}>
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
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} sm={5}>
            <TextField
              label="Start Date"
              type="date"
              fullWidth
              value={startDate}
              onChange={handleStartDateChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={5}>
            <TextField
              label="End Date"
              type="date"
              fullWidth
              value={endDate}
              onChange={handleEndDateChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button 
              variant="outlined" 
              fullWidth
              onClick={() => {
                setStartDate('');
                setEndDate('');
              }}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : appointments.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1">
            No appointments found for the selected filters.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Patient</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {appointments.map((appointment) => (
                <TableRow key={appointment._id}>
                  <TableCell>{formatDate(appointment.date)}</TableCell>
                  <TableCell>{appointment.startTime} - {appointment.endTime}</TableCell>
                  <TableCell>{appointment.patientId.userId.name}</TableCell>
                  <TableCell>{appointment.reason}</TableCell>
                  <TableCell>
                    <Chip 
                      label={appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      color={getStatusColor(appointment.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex">
                      <Tooltip title="View Details">
                        <IconButton 
                          size="small" 
                          onClick={() => handleOpenDetails(appointment)}
                        >
                          <InfoIcon />
                        </IconButton>
                      </Tooltip>
                      
                      {canComplete(appointment) && (
                        <Tooltip title="Mark as Completed">
                          <IconButton 
                            size="small" 
                            color="success"
                            onClick={() => handleCompleteAppointment(appointment._id)}
                          >
                            <CheckIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      {canCancel(appointment) && (
                        <Tooltip title="Cancel Appointment">
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleCancelAppointment(appointment._id)}
                          >
                            <CloseIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      <Tooltip title="Edit Appointment">
                        <IconButton 
                          size="small"
                          onClick={() => handleOpenEdit(appointment)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {/* Appointment Detail Dialog */}
      <Dialog
        open={detailDialog}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
      >
        {selectedAppointment && (
          <>
            <DialogTitle>Appointment Details</DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
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
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Patient:</Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedAppointment.patientId.userId.name}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Contact:</Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedAppointment.patientId.contactNumber || selectedAppointment.patientId.userId.email}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Reason:</Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedAppointment.reason}
                  </Typography>
                </Grid>
                
                {selectedAppointment.conditionId && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2">Related Condition:</Typography>
                    <Paper variant="outlined" sx={{ p: 2, mt: 1, mb: 2 }}>
                      <Typography variant="body1">
                        {selectedAppointment.conditionId.condition}
                      </Typography>
                      <Chip 
                        label={selectedAppointment.conditionId.severity.charAt(0).toUpperCase() + selectedAppointment.conditionId.severity.slice(1)}
                        size="small"
                        sx={{ mt: 1 }}
                      />
                      {selectedAppointment.conditionId.currentSymptoms && selectedAppointment.conditionId.currentSymptoms.length > 0 && (
                        <Box mt={2}>
                          <Typography variant="body2">Symptoms:</Typography>
                          <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                            {selectedAppointment.conditionId.currentSymptoms.map((symptom, idx) => (
                              <Chip key={idx} label={symptom} size="small" />
                            ))}
                          </Box>
                        </Box>
                      )}
                    </Paper>
                  </Grid>
                )}
                
                {selectedAppointment.notes && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2">Notes:</Typography>
                    <Typography variant="body1" gutterBottom>
                      {selectedAppointment.notes}
                    </Typography>
                  </Grid>
                )}
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Status:</Typography>
                  <Chip 
                    label={selectedAppointment.status.charAt(0).toUpperCase() + selectedAppointment.status.slice(1)}
                    color={getStatusColor(selectedAppointment.status)}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDetails}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      
      {/* Edit Dialog */}
      <Dialog
        open={editDialog}
        onClose={handleCloseEdit}
        maxWidth="sm"
        fullWidth
      >
        {selectedAppointment && (
          <>
            <DialogTitle>Edit Appointment</DialogTitle>
            <DialogContent>
              <Box mt={2}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel id="status-label">Status</InputLabel>
                      <Select
                        labelId="status-label"
                        name="status"
                        value={editForm.status}
                        onChange={handleEditFormChange}
                        label="Status"
                      >
                        <MenuItem value="scheduled">Scheduled</MenuItem>
                        <MenuItem value="completed">Completed</MenuItem>
                        <MenuItem value="cancelled">Cancelled</MenuItem>
                        <MenuItem value="no-show">No-Show</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      name="notes"
                      label="Notes"
                      fullWidth
                      multiline
                      rows={3}
                      value={editForm.notes}
                      onChange={handleEditFormChange}
                    />
                  </Grid>
                </Grid>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseEdit}>Cancel</Button>
              <Button onClick={handleEditSubmit} variant="contained" color="primary">
                Save Changes
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default AppointmentManager; 