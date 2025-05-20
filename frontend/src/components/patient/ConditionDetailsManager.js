import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Box, Button, Grid, Paper, 
  TextField, FormControl, InputLabel, Select, MenuItem, 
  Chip, Card, CardContent, CardActions, Dialog, 
  DialogTitle, DialogContent, DialogActions, 
  CircularProgress, Alert, IconButton, FormHelperText,
  Collapse, InputAdornment
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  WarningAmber as WarningIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import patientService from '../../services/patientService';

const severityColors = {
  mild: 'success',
  moderate: 'warning',
  severe: 'error'
};

// Utility function to extract error message from API error
const getErrorMessage = (error) => {
  console.error('API Error:', error);
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.error('Error response data:', error.response.data);
    console.error('Error response status:', error.response.status);
    return error.response.data?.error || `Server error (${error.response.status})`;
  } else if (error.request) {
    // The request was made but no response was received
    console.error('Error request:', error.request);
    return 'No response from server. Please check your connection.';
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error('Error message:', error.message);
    return error.message;
  }
};

const ExistingConditionsSearch = ({ conditions, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  
  const handleSearch = (term) => {
    setSearchTerm(term);
    
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }
    
    const results = conditions.filter(condition => 
      condition.condition.toLowerCase().includes(term.toLowerCase())
    );
    
    setSearchResults(results);
  };
  
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle2" gutterBottom>
        Search existing conditions:
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <TextField
          size="small"
          placeholder="Type to search..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ flex: 1 }}
        />
      </Box>
      
      {searchResults.length > 0 && (
        <Box sx={{ mt: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Found {searchResults.length} matching condition(s):
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
            {searchResults.map(condition => (
              <Chip 
                key={condition._id}
                label={condition.condition}
                size="small"
                color="primary"
                variant="outlined"
                onClick={() => onSelect(condition)}
              />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

const ConditionDetailsManager = () => {
  // State for condition details
  const [conditions, setConditions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showError, setShowError] = useState(false);
  
  // State for add/edit dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCondition, setSelectedCondition] = useState(null);
  
  // State for form data
  const [formData, setFormData] = useState({
    condition: '',
    diagnosedDate: '',
    severity: 'mild',
    currentSymptoms: '',
    medications: '',
    notes: ''
  });
  
  // State for form validation
  const [formErrors, setFormErrors] = useState({});
  
  // State for delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [conditionToDelete, setConditionToDelete] = useState(null);
  
  // Fetch condition details on component mount
  useEffect(() => {
    fetchConditionDetails();
  }, []);

  // Handle error display
  useEffect(() => {
    if (error) {
      setShowError(true);
    }
  }, [error]);
  
  // Fetch condition details from API
  const fetchConditionDetails = async () => {
    setLoading(true);
    try {
      const data = await patientService.getConditionDetails();
      setConditions(data);
      setLoading(false);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(`Failed to fetch health condition details: ${errorMessage}`);
      setLoading(false);
    }
  };
  
  // Open add dialog
  const handleOpenAddDialog = () => {
    setFormData({
      condition: '',
      diagnosedDate: '',
      severity: 'mild',
      currentSymptoms: '',
      medications: '',
      notes: ''
    });
    setFormErrors({});
    setIsEditing(false);
    setDialogOpen(true);
  };
  
  // Open edit dialog
  const handleOpenEditDialog = (condition) => {
    setSelectedCondition(condition);
    setFormData({
      condition: condition.condition,
      diagnosedDate: condition.diagnosedDate || '',
      severity: condition.severity || 'mild',
      currentSymptoms: condition.currentSymptoms ? condition.currentSymptoms.join(', ') : '',
      medications: condition.medications ? condition.medications.join(', ') : '',
      notes: condition.notes || ''
    });
    setFormErrors({});
    setIsEditing(true);
    setDialogOpen(true);
  };
  
  // Close dialog
  const handleCloseDialog = () => {
    setDialogOpen(false);
  };
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
  };
  
  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!formData.condition.trim()) {
      errors.condition = 'Condition name is required';
      return errors;
    }
    
    // Check for duplicate condition name when adding new condition
    if (!isEditing) {
      const conditionName = formData.condition.trim().toLowerCase();
      const existingCondition = conditions.find(
        c => c.condition.toLowerCase() === conditionName
      );
      
      if (existingCondition) {
        errors.condition = 'This condition already exists. Please use edit instead or choose a different name.';
        
        // Option to switch to edit mode for the existing condition
        setSelectedCondition(existingCondition);
      }
    }
    
    return errors;
  };
  
  // Function to find and edit existing condition
  const findAndEditCondition = (conditionName) => {
    const existingCondition = conditions.find(
      c => c.condition.toLowerCase() === conditionName.toLowerCase()
    );
    
    if (existingCondition) {
      handleOpenEditDialog(existingCondition);
      return true;
    }
    
    return false;
  };

  // Handle condition name change with validation
  const handleConditionNameChange = (e) => {
    const { value } = e.target;
    setFormData({ ...formData, condition: value });
    
    // Clear error when typing
    if (formErrors.condition) {
      setFormErrors({ ...formErrors, condition: '' });
    }
    
    // Check for duplicates as user types
    if (!isEditing && value.trim()) {
      const conditionName = value.trim().toLowerCase();
      const existingCondition = conditions.find(
        c => c.condition.toLowerCase() === conditionName
      );
      
      if (existingCondition) {
        setFormErrors({ 
          ...formErrors, 
          condition: 'This condition already exists. Use edit instead.' 
        });
      }
    }
  };
  
  // Check and submit
  const checkAndSubmit = async () => {
    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      
      // If we found a duplicate condition, show a better error message
      if (errors.condition && errors.condition.includes('already exists')) {
        setError('A condition with this name already exists. Please use the Edit button to modify it instead.');
        return;
      }
      
      return;
    }
    
    // For non-editing mode, do an additional check for existing conditions
    if (!isEditing) {
      const conditionName = formData.condition.trim().toLowerCase();
      const exists = conditions.some(c => c.condition.toLowerCase() === conditionName);
      
      if (exists) {
        setFormErrors({
          ...formErrors,
          condition: 'This condition already exists. Please use edit instead.'
        });
        
        // Find and select the existing condition
        const existingCondition = conditions.find(c => c.condition.toLowerCase() === conditionName);
        if (existingCondition) {
          setSelectedCondition(existingCondition);
        }
        
        return;
      }
    }
    
    // Now proceed with the actual submission
    try {
      // Process form data
      const processedData = {
        ...formData,
        currentSymptoms: formData.currentSymptoms ? formData.currentSymptoms.split(',').map(s => s.trim()) : [],
        medications: formData.medications ? formData.medications.split(',').map(m => m.trim()) : []
      };
      
      console.log('Submitting condition data:', processedData);
      
      if (isEditing) {
        // Update existing condition
        console.log('Updating condition with ID:', selectedCondition._id);
        await patientService.updateConditionDetail(selectedCondition._id, processedData);
      } else {
        // Add new condition
        console.log('Adding new condition');
        await patientService.addConditionDetail(processedData);
      }
      
      // Refresh data and close dialog
      fetchConditionDetails();
      handleCloseDialog();
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(`Failed to save condition details: ${errorMessage}`);
    }
  };
  
  // Open delete confirmation dialog
  const handleOpenDeleteDialog = (condition) => {
    setConditionToDelete(condition);
    setDeleteDialogOpen(true);
  };
  
  // Close delete confirmation dialog
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };
  
  // Delete condition
  const handleDeleteCondition = async () => {
    try {
      await patientService.deleteConditionDetail(conditionToDelete._id);
      
      // Refresh data and close dialog
      fetchConditionDetails();
      handleCloseDeleteDialog();
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(`Failed to delete condition: ${errorMessage}`);
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString();
  };

  // Close error alert
  const handleCloseError = () => {
    setShowError(false);
    setError('');
  };

  return (
    <Container>
      <Box my={4}>
        <Typography variant="h4" gutterBottom>
          My Health Conditions
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          Manage your health condition details to share with your doctors.
        </Typography>
      </Box>
      
      <Collapse in={showError}>
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3 }}
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={handleCloseError}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }
          >
            {error}
          </Alert>
        )}
      </Collapse>
      
      <Box mb={4}>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleOpenAddDialog}
        >
          Add New Health Condition
        </Button>
      </Box>
      
      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : conditions.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No health conditions added yet
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            Add details about your health conditions to help your doctors provide better care.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={handleOpenAddDialog}
          >
            Add Condition Details
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {conditions.map((condition) => (
            <Grid item xs={12} md={6} key={condition._id}>
              <Card variant="outlined">
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">
                      {condition.condition}
                    </Typography>
                    <Chip 
                      label={condition.severity?.charAt(0).toUpperCase() + condition.severity?.slice(1) || 'Mild'}
                      color={severityColors[condition.severity] || 'default'}
                      size="small"
                      icon={condition.severity === 'severe' ? <WarningIcon /> : undefined}
                    />
                  </Box>
                  
                  {condition.diagnosedDate && (
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Diagnosed: {formatDate(condition.diagnosedDate)}
                    </Typography>
                  )}
                  
                  {condition.currentSymptoms && condition.currentSymptoms.length > 0 && (
                    <Box mt={2}>
                      <Typography variant="subtitle2" gutterBottom>
                        Current Symptoms:
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={1}>
                        {condition.currentSymptoms.map((symptom, index) => (
                          <Chip key={index} label={symptom} size="small" />
                        ))}
                      </Box>
                    </Box>
                  )}
                  
                  {condition.medications && condition.medications.length > 0 && (
                    <Box mt={2}>
                      <Typography variant="subtitle2" gutterBottom>
                        Medications:
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={1}>
                        {condition.medications.map((medication, index) => (
                          <Chip key={index} label={medication} size="small" color="info" />
                        ))}
                      </Box>
                    </Box>
                  )}
                  
                  {condition.notes && (
                    <Box mt={2}>
                      <Typography variant="subtitle2" gutterBottom>
                        Notes:
                      </Typography>
                      <Typography variant="body2">
                        {condition.notes}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    startIcon={<EditIcon />}
                    onClick={() => handleOpenEditDialog(condition)}
                  >
                    Edit
                  </Button>
                  <Button 
                    size="small" 
                    color="error" 
                    startIcon={<DeleteIcon />}
                    onClick={() => handleOpenDeleteDialog(condition)}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Add/Edit Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {isEditing ? 'Edit Health Condition Details' : 'Add New Health Condition'}
        </DialogTitle>
        <DialogContent>
          {!isEditing && (
            <ExistingConditionsSearch 
              conditions={conditions} 
              onSelect={handleOpenEditDialog}
            />
          )}
          
          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid item xs={12}>
              <TextField
                name="condition"
                label="Condition Name"
                fullWidth
                value={formData.condition}
                onChange={handleConditionNameChange}
                error={!!formErrors.condition}
                helperText={formErrors.condition}
                required
              />
              {!isEditing && formErrors.condition && selectedCondition && (
                <Box sx={{ mt: 1 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    color="secondary"
                    onClick={() => handleOpenEditDialog(selectedCondition)}
                  >
                    Switch to Edit Mode
                  </Button>
                </Box>
              )}
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="diagnosedDate"
                label="Date of Diagnosis"
                type="date"
                fullWidth
                value={formData.diagnosedDate}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="severity-label">Severity</InputLabel>
                <Select
                  labelId="severity-label"
                  name="severity"
                  value={formData.severity}
                  onChange={handleInputChange}
                  label="Severity"
                >
                  <MenuItem value="mild">Mild</MenuItem>
                  <MenuItem value="moderate">Moderate</MenuItem>
                  <MenuItem value="severe">Severe</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="currentSymptoms"
                label="Current Symptoms"
                fullWidth
                multiline
                rows={2}
                value={formData.currentSymptoms}
                onChange={handleInputChange}
                placeholder="Enter symptoms separated by commas"
                helperText="Enter symptoms separated by commas (e.g., headache, fatigue, nausea)"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="medications"
                label="Current Medications"
                fullWidth
                multiline
                rows={2}
                value={formData.medications}
                onChange={handleInputChange}
                placeholder="Enter medications separated by commas"
                helperText="Enter medications separated by commas (e.g., Ibuprofen, Metformin)"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="notes"
                label="Additional Notes"
                fullWidth
                multiline
                rows={3}
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Any additional information about your condition"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={checkAndSubmit} variant="contained" color="primary">
            {isEditing ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the condition: {conditionToDelete?.condition}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteCondition} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ConditionDetailsManager; 