import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  InputAdornment,
  IconButton,
  Grid,
  Link,
  CircularProgress,
  FormHelperText,
  useTheme
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  MedicalServices as MedicalIcon,
  WorkOutline as WorkOutlineIcon
} from '@mui/icons-material';
import AnimatedButton from '../components/AnimatedButton';
import FadeIn from '../components/FadeIn';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'patient',
    specialization: ''
  });
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    // Validate form data
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setFormError('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    if (formData.role === 'doctor' && !formData.specialization) {
      setFormError('Specialization is required for doctors');
      return;
    }

    try {
      setIsLoading(true);
      // Remove confirmPassword before sending to server
      const { confirmPassword, ...userData } = formData;
      const response = await register(userData);
      
      // Redirect based on user role
      if (response.role === 'doctor') {
        navigate('/doctor/dashboard');
      } else {
        navigate('/patient/dashboard');
      }
    } catch (error) {
      setFormError(error.response?.data?.error || 'Registration failed');
      setIsLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'calc(100vh - 150px)',
        py: 4
      }}
    >
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        style={{ width: '100%', maxWidth: '600px' }}
      >
        <Card 
          sx={{ 
            width: '100%',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
            borderRadius: 2,
            overflow: 'hidden'
          }}
        >
          <Box 
            sx={{ 
              bgcolor: 'primary.main', 
              p: 3, 
              textAlign: 'center',
              color: 'white'
            }}
          >
            <motion.div variants={itemVariants}>
              <Box display="flex" justifyContent="center" mb={1}>
                <MedicalIcon fontSize="large" />
              </Box>
              <Typography variant="h4" fontWeight="500">
                Create Account
              </Typography>
              <Typography variant="body2" mt={1}>
                Join our healthcare platform
              </Typography>
            </motion.div>
          </Box>
          
          <CardContent sx={{ p: 3 }}>
            {formError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
              >
                <Alert severity="error" sx={{ mb: 2 }}>
                  {formError}
                </Alert>
              </motion.div>
            )}
            
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <motion.div variants={itemVariants}>
                    <TextField
                      fullWidth
                      label="Name"
                      type="text"
                      name="name"
                      variant="outlined"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </motion.div>
                </Grid>
                
                <Grid item xs={12}>
                  <motion.div variants={itemVariants}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      name="email"
                      variant="outlined"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </motion.div>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <motion.div variants={itemVariants}>
                    <TextField
                      fullWidth
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      variant="outlined"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon color="action" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={handleTogglePassword}
                              edge="end"
                            >
                              {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </motion.div>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <motion.div variants={itemVariants}>
                    <TextField
                      fullWidth
                      label="Confirm Password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      variant="outlined"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon color="action" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle confirm password visibility"
                              onClick={handleToggleConfirmPassword}
                              edge="end"
                            >
                              {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </motion.div>
                </Grid>
                
                <Grid item xs={12}>
                  <motion.div variants={itemVariants}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel id="role-label">Role</InputLabel>
                      <Select
                        labelId="role-label"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        label="Role"
                        startAdornment={
                          <InputAdornment position="start">
                            <MedicalIcon color="action" />
                          </InputAdornment>
                        }
                      >
                        <MenuItem value="patient">Patient</MenuItem>
                        <MenuItem value="doctor">Doctor</MenuItem>
                      </Select>
                    </FormControl>
                  </motion.div>
                </Grid>
                
                {formData.role === 'doctor' && (
                  <Grid item xs={12}>
                    <FadeIn direction="up">
                      <TextField
                        fullWidth
                        label="Specialization"
                        type="text"
                        name="specialization"
                        variant="outlined"
                        value={formData.specialization}
                        onChange={handleChange}
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <WorkOutlineIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </FadeIn>
                  </Grid>
                )}
              </Grid>
              
              <motion.div 
                variants={itemVariants}
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
              >
                <Button 
                  type="submit" 
                  fullWidth 
                  variant="contained" 
                  size="large"
                  disabled={isLoading}
                  sx={{ 
                    mt: 3, 
                    mb: 2,
                    py: 1.2,
                    position: 'relative'
                  }}
                >
                  {isLoading ? (
                    <CircularProgress 
                      size={24} 
                      sx={{ 
                        color: theme.palette.primary.light
                      }} 
                    />
                  ) : 'Create Account'}
                </Button>
              </motion.div>
              
              <motion.div 
                variants={itemVariants}
                style={{ textAlign: 'center' }}
              >
                <Typography variant="body2" color="textSecondary">
                  Already have an account?{' '}
                  <Link 
                    component={RouterLink} 
                    to="/login" 
                    color="primary"
                    sx={{ 
                      fontWeight: 500,
                      textDecoration: 'none',
                      '&:hover': {
                        textDecoration: 'underline'
                      }
                    }}
                  >
                    Sign In
                  </Link>
                </Typography>
              </motion.div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
};

export default Register; 