import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Paper,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonIcon from '@mui/icons-material/Person';
import ClearIcon from '@mui/icons-material/Clear';
import doctorService from '../../services/doctorService';

const PatientSearchAndAssign = ({ onSuccess }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [assignError, setAssignError] = useState('');
  const [assignSuccess, setAssignSuccess] = useState('');

  const handleSearch = async (e) => {
    e?.preventDefault();
    
    if (!searchQuery.trim()) {
      setSearchError('Please enter a search term');
      return;
    }

    try {
      setSearchError('');
      setIsSearching(true);
      const results = await doctorService.searchPatients(searchQuery);
      setSearchResults(results);
      if (results.length === 0) {
        setSearchError('No patients found matching your search');
      }
      setIsSearching(false);
    } catch (error) {
      setSearchError(error.response?.data?.error || 'Error searching for patients');
      setIsSearching(false);
    }
  };

  const handleAssignPatient = async (patientId) => {
    try {
      setAssignError('');
      setAssignSuccess('');
      setIsAssigning(true);
      
      await doctorService.assignPatient(patientId);
      
      setAssignSuccess('Patient assigned successfully');
      setSearchResults([]);
      setSearchQuery('');
      setIsAssigning(false);
      
      // Notify parent component to refresh patient list
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      setAssignError(error.response?.data?.error || 'Failed to assign patient');
      setIsAssigning(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSearchError('');
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>Assign New Patient</Typography>
      
      {assignError && <Alert severity="error" sx={{ mb: 2 }}>{assignError}</Alert>}
      {assignSuccess && <Alert severity="success" sx={{ mb: 2 }}>{assignSuccess}</Alert>}
      {searchError && <Alert severity="error" sx={{ mb: 2 }}>{searchError}</Alert>}
      
      <Box component="form" onSubmit={handleSearch} sx={{ mb: 3 }}>
        <TextField
          label="Search Patients"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name or email"
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton onClick={clearSearch} edge="end">
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
        
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            type="submit" 
            variant="contained"
            color="primary"
            disabled={isSearching || !searchQuery.trim()}
            startIcon={isSearching ? <CircularProgress size={20} /> : <SearchIcon />}
          >
            {isSearching ? 'Searching...' : 'Search'}
          </Button>
        </Box>
      </Box>
      
      {searchResults.length > 0 && (
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Search Results ({searchResults.length})
          </Typography>
          
          <List>
            {searchResults.map((patient) => (
              <React.Fragment key={patient._id}>
                <ListItem 
                  secondaryAction={
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<PersonAddIcon />}
                      onClick={() => handleAssignPatient(patient._id)}
                      disabled={isAssigning}
                    >
                      {isAssigning ? 'Assigning...' : 'Assign'}
                    </Button>
                  }
                >
                  <ListItemAvatar>
                    <Avatar>
                      <PersonIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={patient.userId?.name}
                    secondary={patient.userId?.email}
                  />
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        </Box>
      )}
    </Paper>
  );
};

export default PatientSearchAndAssign; 