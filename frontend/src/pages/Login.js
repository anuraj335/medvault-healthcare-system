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
  InputAdornment,
  IconButton,
  Alert,
  Link,
  CircularProgress,
  useTheme
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  MedicalServices as MedicalIcon
} from '@mui/icons-material';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login } = useAuth();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    // Validate form data
    if (!formData.email || !formData.password) {
      setFormError('Please fill in all fields');
      return;
    }

    try {
      setIsLoading(true);
      const userData = await login(formData);
      
      // Redirect based on user role
      if (userData.role === 'doctor') {
        navigate('/doctor/dashboard');
      } else {
        navigate('/patient/dashboard');
      }
    } catch (error) {
      setFormError(error.response?.data?.error || 'Invalid email or password');
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
        minHeight: 'calc(100vh - 150px)'
      }}
    >
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <Card 
          sx={{ 
            maxWidth: 450, 
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
                Welcome Back
              </Typography>
              <Typography variant="body2" mt={1}>
                Sign in to access your account
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
              <motion.div variants={itemVariants}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  name="email"
                  variant="outlined"
                  margin="normal"
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
              
              <motion.div variants={itemVariants}>
                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  variant="outlined"
                  margin="normal"
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
                  ) : 'Sign In'}
                </Button>
              </motion.div>
            </form>
            
            <motion.div 
              variants={itemVariants}
              style={{ textAlign: 'center' }}
            >
              <Typography variant="body2" color="textSecondary">
                Don't have an account?{' '}
                <Link 
                  component={RouterLink} 
                  to="/register" 
                  color="primary"
                  sx={{ 
                    fontWeight: 500,
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }}
                >
                  Sign Up
                </Link>
              </Typography>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
};

export default Login; 