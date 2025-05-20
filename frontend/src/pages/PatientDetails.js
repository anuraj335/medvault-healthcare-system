import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  CircularProgress,
  Alert
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PatientConditionDetails from '../components/doctor/PatientConditionDetails';

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

const PatientDetails = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form state for adding medical history
  const [historyForm, setHistoryForm] = useState({
    date: new Date().toISOString().split('T')[0],
    diagnosis: '',
    treatment: ''
  });
  
  // Form state for adding prescription
  const [prescriptionForm, setPrescriptionForm] = useState({
    date: new Date().toISOString().split('T')[0],
    medication: '',
    dosage: ''
  });
  
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const fetchPatientDetails = async () => {
      try {
        setLoading(true);
        const data = await doctorService.getPatientDetails(patientId);
        setPatient(data);
        setLoading(false);
      } catch (error) {
        setError('Failed to load patient details');
        setLoading(false);
        console.error(error);
      }
    };

    fetchPatientDetails();
  }, [patientId]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleHistoryChange = (e) => {
    setHistoryForm({
      ...historyForm,
      [e.target.name]: e.target.value
    });
  };

  const handlePrescriptionChange = (e) => {
    setPrescriptionForm({
      ...prescriptionForm,
      [e.target.name]: e.target.value
    });
  };

  const handleAddHistory = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    
    if (!historyForm.date || !historyForm.diagnosis || !historyForm.treatment) {
      setFormError('Please fill in all fields');
      return;
    }

    try {
      setIsSubmitting(true);
      await doctorService.addMedicalHistory(patientId, historyForm);
      
      // Refresh patient data
      const updatedPatient = await doctorService.getPatientDetails(patientId);
      setPatient(updatedPatient);
      
      setFormSuccess('Medical history added successfully');
      setHistoryForm({
        ...historyForm,
        diagnosis: '',
        treatment: ''
      });
      setIsSubmitting(false);
    } catch (error) {
      setFormError(error.response?.data?.error || 'Failed to add medical history');
      setIsSubmitting(false);
    }
  };

  const handleAddPrescription = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    
    if (!prescriptionForm.date || !prescriptionForm.medication || !prescriptionForm.dosage) {
      setFormError('Please fill in all fields');
      return;
    }

    try {
      setIsSubmitting(true);
      await doctorService.addPrescription(patientId, prescriptionForm);
      
      // Refresh patient data
      const updatedPatient = await doctorService.getPatientDetails(patientId);
      setPatient(updatedPatient);
      
      setFormSuccess('Prescription added successfully');
      setPrescriptionForm({
        ...prescriptionForm,
        medication: '',
        dosage: ''
      });
      setIsSubmitting(false);
    } catch (error) {
      setFormError(error.response?.data?.error || 'Failed to add prescription');
      setIsSubmitting(false);
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
    <Container>
      <Button 
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/doctor/dashboard')}
        sx={{ mb: 3 }}
      >
        Back to Dashboard
      </Button>
      
      {patient && (
        <>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h4" gutterBottom>Patient Details</Typography>
            <Typography><strong>Name:</strong> {patient.userId?.name}</Typography>
            <Typography><strong>Email:</strong> {patient.userId?.email}</Typography>
            {patient.contactNumber && (
              <Typography><strong>Contact:</strong> {patient.contactNumber}</Typography>
            )}
            {patient.dateOfBirth && (
              <Typography><strong>Date of Birth:</strong> {new Date(patient.dateOfBirth).toLocaleDateString()}</Typography>
            )}
            {patient.gender && (
              <Typography><strong>Gender:</strong> {patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1)}</Typography>
            )}
          </Paper>
          
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={activeTab} onChange={handleTabChange} aria-label="patient details tabs">
              <Tab label="Medical History" />
              <Tab label="Prescriptions" />
              <Tab label="Health Conditions" />
            </Tabs>
          </Box>
          
          {formError && <Alert severity="error" sx={{ mt: 2 }}>{formError}</Alert>}
          {formSuccess && <Alert severity="success" sx={{ mt: 2 }}>{formSuccess}</Alert>}
          
          {/* Medical History Tab */}
          <TabPanel value={activeTab} index={0}>
            <Typography variant="h5" gutterBottom>Medical History</Typography>
            
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>Add New Medical Record</Typography>
              <Box component="form" onSubmit={handleAddHistory}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      type="date"
                      label="Date"
                      fullWidth
                      name="date"
                      value={historyForm.date}
                      onChange={handleHistoryChange}
                      InputLabelProps={{ shrink: true }}
                      required
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={8}>
                    <TextField
                      label="Diagnosis"
                      fullWidth
                      name="diagnosis"
                      value={historyForm.diagnosis}
                      onChange={handleHistoryChange}
                      required
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      label="Treatment"
                      fullWidth
                      multiline
                      rows={3}
                      name="treatment"
                      value={historyForm.treatment}
                      onChange={handleHistoryChange}
                      required
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Button 
                      type="submit" 
                      variant="contained" 
                      color="primary"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Adding...' : 'Add Medical Record'}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
            
            <Typography variant="h6" gutterBottom>History Records</Typography>
            
            {patient.medicalHistory?.length === 0 ? (
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography>No medical history records yet.</Typography>
              </Paper>
            ) : (
              <Grid container spacing={2}>
                {patient.medicalHistory?.map((record, index) => (
                  <Grid item xs={12} key={index}>
                    <Paper variant="outlined" sx={{ p: 3 }}>
                      <Typography><strong>Date:</strong> {record.date}</Typography>
                      <Typography variant="h6" gutterBottom>{record.diagnosis}</Typography>
                      <Typography><strong>Treatment:</strong> {record.treatment}</Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            )}
          </TabPanel>
          
          {/* Prescriptions Tab */}
          <TabPanel value={activeTab} index={1}>
            <Typography variant="h5" gutterBottom>Prescriptions</Typography>
            
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>Add New Prescription</Typography>
              <Box component="form" onSubmit={handleAddPrescription}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      type="date"
                      label="Date"
                      fullWidth
                      name="date"
                      value={prescriptionForm.date}
                      onChange={handlePrescriptionChange}
                      InputLabelProps={{ shrink: true }}
                      required
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Medication"
                      fullWidth
                      name="medication"
                      value={prescriptionForm.medication}
                      onChange={handlePrescriptionChange}
                      required
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Dosage"
                      fullWidth
                      name="dosage"
                      value={prescriptionForm.dosage}
                      onChange={handlePrescriptionChange}
                      required
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Button 
                      type="submit" 
                      variant="contained" 
                      color="primary"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Adding...' : 'Add Prescription'}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
            
            <Typography variant="h6" gutterBottom>Prescription Records</Typography>
            
            {patient.prescriptions?.length === 0 ? (
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography>No prescriptions yet.</Typography>
              </Paper>
            ) : (
              <Grid container spacing={2}>
                {patient.prescriptions?.map((prescription, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Paper variant="outlined" sx={{ p: 3 }}>
                      <Typography><strong>Date:</strong> {prescription.date}</Typography>
                      <Typography variant="h6" gutterBottom>{prescription.medication}</Typography>
                      <Typography><strong>Dosage:</strong> {prescription.dosage}</Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            )}
          </TabPanel>
          
          {/* Health Conditions Tab */}
          <TabPanel value={activeTab} index={2}>
            <PatientConditionDetails patientId={patientId} />
          </TabPanel>
        </>
      )}
    </Container>
  );
};

export default PatientDetails; 