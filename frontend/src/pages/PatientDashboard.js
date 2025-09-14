import React, { useState, useEffect } from 'react';
import patientService from '../services/patientService';
import { Box, Tabs, Tab, Typography, CircularProgress, Alert } from '@mui/material';
import AppointmentHistory from '../components/patient/AppointmentHistory';
import AppointmentScheduler from '../components/patient/AppointmentScheduler';
import ConditionDetailsManager from '../components/patient/ConditionDetailsManager';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`patient-tabpanel-${index}`}
      aria-labelledby={`patient-tab-${index}`}
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

const PatientDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        console.log('PatientDashboard: Starting to fetch data...');
        
        // Fetch all patient data in parallel with better error handling
        const results = await Promise.allSettled([
          patientService.getProfile(),
          patientService.getDoctors(),
          patientService.getMedicalHistory(),
          patientService.getPrescriptions()
        ]);
        
        const [profileResult, doctorsResult, historyResult, prescriptionsResult] = results;
        
        // Handle each result individually
        if (profileResult.status === 'fulfilled') {
          setProfile(profileResult.value);
          console.log('PatientDashboard: Profile loaded successfully');
        } else {
          console.error('PatientDashboard: Failed to load profile:', profileResult.reason);
        }
        
        if (doctorsResult.status === 'fulfilled') {
          setDoctors(doctorsResult.value);
          console.log('PatientDashboard: Doctors loaded successfully');
        } else {
          console.error('PatientDashboard: Failed to load doctors:', doctorsResult.reason);
        }
        
        if (historyResult.status === 'fulfilled') {
          setMedicalHistory(historyResult.value);
          console.log('PatientDashboard: Medical history loaded successfully');
        } else {
          console.error('PatientDashboard: Failed to load medical history:', historyResult.reason);
        }
        
        if (prescriptionsResult.status === 'fulfilled') {
          setPrescriptions(prescriptionsResult.value);
          console.log('PatientDashboard: Prescriptions loaded successfully');
        } else {
          console.error('PatientDashboard: Failed to load prescriptions:', prescriptionsResult.reason);
        }
        
        // Check if any critical data failed to load
        const failedRequests = results.filter(result => result.status === 'rejected');
        if (failedRequests.length > 0) {
          const errorMessages = failedRequests.map(result => result.reason?.message || result.reason?.toString()).join(', ');
          setError(`Failed to load some dashboard data: ${errorMessages}`);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('PatientDashboard: Unexpected error:', error);
        setError(`Failed to load dashboard data: ${error.message}`);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
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
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="patient dashboard tabs">
          <Tab label="Dashboard" />
          <Tab label="Health Conditions" />
          <Tab label="Appointments" />
          <Tab label="Schedule Appointment" />
        </Tabs>
      </Box>
      
      {/* Dashboard Tab */}
      <TabPanel value={activeTab} index={0}>
        <Typography variant="h4" gutterBottom>
          Patient Dashboard
        </Typography>
        
        {profile && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6">My Profile</Typography>
            <Typography><strong>Name:</strong> {profile.userId?.name}</Typography>
            <Typography><strong>Email:</strong> {profile.userId?.email}</Typography>
            {profile.contactNumber && (
              <Typography><strong>Contact:</strong> {profile.contactNumber}</Typography>
            )}
          </Box>
        )}
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6">My Doctors</Typography>
          
          {doctors.length === 0 ? (
            <Typography>You have no assigned doctors yet.</Typography>
          ) : (
            <Box>
              {doctors.map(doctor => (
                <Box 
                  key={doctor._id} 
                  sx={{ 
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    p: 2,
                    mb: 2
                  }}
                >
                  <Typography variant="subtitle1">{doctor.userId?.name}</Typography>
                  <Typography><strong>Specialization:</strong> {doctor.specialization}</Typography>
                  <Typography><strong>Email:</strong> {doctor.userId?.email}</Typography>
                </Box>
              ))}
            </Box>
          )}
        </Box>
        
        <Box>
          <Typography variant="h6" gutterBottom>
            Medical History
          </Typography>
          
          {medicalHistory.length === 0 ? (
            <Typography>No medical history records yet.</Typography>
          ) : (
            <Box>
              {medicalHistory.map((record, index) => (
                <Box 
                  key={index} 
                  sx={{ 
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    p: 2,
                    mb: 2
                  }}
                >
                  <Typography><strong>Date:</strong> {record.date}</Typography>
                  <Typography><strong>Diagnosis:</strong> {record.diagnosis}</Typography>
                  <Typography><strong>Treatment:</strong> {record.treatment}</Typography>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </TabPanel>
      
      {/* Health Conditions Tab */}
      <TabPanel value={activeTab} index={1}>
        <ConditionDetailsManager />
      </TabPanel>
      
      {/* Appointments Tab */}
      <TabPanel value={activeTab} index={2}>
        <AppointmentHistory />
      </TabPanel>
      
      {/* Schedule Appointment Tab */}
      <TabPanel value={activeTab} index={3}>
        <AppointmentScheduler />
      </TabPanel>
    </Box>
  );
};

export default PatientDashboard; 