import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import doctorService from '../services/doctorService';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Paper,
  TextField,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardActions,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import AppointmentManager from '../components/doctor/AppointmentManager';
import PatientSearchAndAssign from '../components/doctor/PatientSearchAndAssign';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`doctor-tabpanel-${index}`}
      aria-labelledby={`doctor-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const DoctorDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch doctor profile and patients in parallel
        const [profileData, patientsData] = await Promise.all([
          doctorService.getProfile(),
          doctorService.getPatients()
        ]);
        
        setProfile(profileData);
        setPatients(patientsData);
        setLoading(false);
      } catch (error) {
        setError('Failed to load dashboard data');
        setLoading(false);
        console.error(error);
      }
    };

    fetchData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handlePatientAssignSuccess = async () => {
    // Refresh patient list after successful assignment
    try {
      const updatedPatients = await doctorService.getPatients();
      setPatients(updatedPatients);
    } catch (error) {
      console.error('Failed to refresh patients list', error);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="doctor dashboard tabs">
          <Tab label="Dashboard" />
          <Tab label="Appointments" />
        </Tabs>
      </Box>
      
      {/* Dashboard Tab */}
      <TabPanel value={activeTab} index={0}>
        <Typography variant="h4" gutterBottom>
          Doctor Dashboard
        </Typography>
        
        {profile && (
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>My Profile</Typography>
            <Typography><strong>Name:</strong> {profile.userId?.name}</Typography>
            <Typography><strong>Specialization:</strong> {profile.specialization}</Typography>
            <Typography><strong>Total Patients:</strong> {profile.patients?.length || 0}</Typography>
          </Paper>
        )}
        
        <PatientSearchAndAssign onSuccess={handlePatientAssignSuccess} />
        
        <Typography variant="h6" gutterBottom>My Patients</Typography>
        
        {patients.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography>You have no patients assigned yet.</Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {patients.map(patient => (
              <Grid item xs={12} md={6} key={patient._id}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>{patient.userId?.name}</Typography>
                    <Typography><strong>Email:</strong> {patient.userId?.email}</Typography>
                    
                    <Box display="flex" flexWrap="wrap" gap={1} my={1}>
                      <Chip 
                        label={`${patient.medicalHistory?.length || 0} Medical Records`} 
                        color="primary" 
                        size="small" 
                      />
                      <Chip 
                        label={`${patient.prescriptions?.length || 0} Prescriptions`} 
                        color="secondary" 
                        size="small" 
                      />
                      <Chip 
                        label={`${patient.conditionDetails?.length || 0} Health Conditions`} 
                        color="info" 
                        size="small" 
                      />
                    </Box>
                    
                    {patient.chronicConditions && patient.chronicConditions.length > 0 && (
                      <Box mt={2}>
                        <Typography variant="subtitle2" gutterBottom>Chronic Conditions:</Typography>
                        <Box display="flex" flexWrap="wrap" gap={1}>
                          {patient.chronicConditions.map((condition, index) => (
                            <Chip key={index} label={condition} size="small" />
                          ))}
                        </Box>
                      </Box>
                    )}
                  </CardContent>
                  <CardActions>
                    <Button 
                      component={Link} 
                      to={`/doctor/patients/${patient._id}`}
                      variant="contained" 
                      color="primary" 
                      size="small"
                    >
                      View Details
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>
      
      {/* Appointments Tab */}
      <TabPanel value={activeTab} index={1}>
        <AppointmentManager />
      </TabPanel>
    </Box>
  );
};

export default DoctorDashboard; 