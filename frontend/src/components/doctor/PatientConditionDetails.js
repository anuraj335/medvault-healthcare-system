import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, Typography, Paper, Grid, Chip, 
  Accordion, AccordionSummary, AccordionDetails,
  Card, CardContent, Divider, CircularProgress, Alert
} from '@mui/material';
import { 
  ExpandMore as ExpandMoreIcon,
  WarningAmber as WarningIcon,
  Medication as MedicationIcon,
  Sick as SickIcon
} from '@mui/icons-material';

const severityColors = {
  mild: 'success',
  moderate: 'warning',
  severe: 'error'
};

const PatientConditionDetails = ({ patientId }) => {
  const [conditions, setConditions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchConditionDetails = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        const response = await axios.get(`/api/doctors/patients/${patientId}/condition-details`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setConditions(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load patient condition details.');
        setLoading(false);
        console.error(err);
      }
    };

    if (patientId) {
      fetchConditionDetails();
    }
  }, [patientId]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" my={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (conditions.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography>This patient has not added any condition details yet.</Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Patient Health Conditions
      </Typography>
      
      {conditions.map((condition) => (
        <Accordion key={condition._id} sx={{ mb: 2 }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`condition-${condition._id}-content`}
            id={`condition-${condition._id}-header`}
          >
            <Box display="flex" alignItems="center" width="100%" justifyContent="space-between">
              <Typography variant="subtitle1">{condition.condition}</Typography>
              <Chip 
                label={condition.severity?.charAt(0).toUpperCase() + condition.severity?.slice(1) || 'Mild'}
                color={severityColors[condition.severity] || 'default'}
                size="small"
                icon={condition.severity === 'severe' ? <WarningIcon /> : undefined}
                sx={{ ml: 2 }}
              />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    {condition.diagnosedDate && (
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        <strong>Diagnosed:</strong> {formatDate(condition.diagnosedDate)}
                      </Typography>
                    )}
                    
                    <Divider sx={{ my: 2 }} />
                    
                    {condition.currentSymptoms && condition.currentSymptoms.length > 0 ? (
                      <Box mb={2}>
                        <Box display="flex" alignItems="center" mb={1}>
                          <SickIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                          <Typography variant="subtitle2">Current Symptoms:</Typography>
                        </Box>
                        <Box display="flex" flexWrap="wrap" gap={1}>
                          {condition.currentSymptoms.map((symptom, index) => (
                            <Chip key={index} label={symptom} size="small" />
                          ))}
                        </Box>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        No symptoms specified
                      </Typography>
                    )}
                    
                    {condition.medications && condition.medications.length > 0 && (
                      <Box mb={2}>
                        <Box display="flex" alignItems="center" mb={1}>
                          <MedicationIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                          <Typography variant="subtitle2">Current Medications:</Typography>
                        </Box>
                        <Box display="flex" flexWrap="wrap" gap={1}>
                          {condition.medications.map((medication, index) => (
                            <Chip key={index} label={medication} size="small" color="info" />
                          ))}
                        </Box>
                      </Box>
                    )}
                    
                    {condition.notes && (
                      <Box mt={2}>
                        <Typography variant="subtitle2" gutterBottom>Notes:</Typography>
                        <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f9f9f9' }}>
                          <Typography variant="body2">
                            {condition.notes}
                          </Typography>
                        </Paper>
                      </Box>
                    )}
                    
                    <Box mt={2}>
                      <Typography variant="caption" color="textSecondary">
                        Last updated: {new Date(condition.lastUpdated).toLocaleString()}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default PatientConditionDetails; 