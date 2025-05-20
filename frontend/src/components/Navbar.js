import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  Link,
  Container,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Divider,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Person as PersonIcon,
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import Logo from './Logo';
import { motion } from 'framer-motion';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuAnchorEl, setMobileMenuAnchorEl] = useState(null);
  
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenu = (event) => {
    setMobileMenuAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setMobileMenuAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/login');
  };

  const handleNavigation = (path) => {
    navigate(path);
    handleClose();
  };
  
  // Get first letter of name for avatar
  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  return (
    <AppBar position="sticky" color="primary" elevation={1}>
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
          {/* Logo */}
          <Box component={RouterLink} to="/" sx={{ textDecoration: 'none', color: 'white' }}>
            <Logo variant={isMobile ? 'small' : 'full'} color="white" />
          </Box>

          {/* Desktop Navigation */}
          {!isMobile ? (
            <Box display="flex" alignItems="center">
              {isAuthenticated ? (
                <>
                  <Button
                    color="inherit"
                    component={RouterLink}
                    to={user.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard'}
                    startIcon={<DashboardIcon />}
                    sx={{ mr: 2 }}
                  >
                    Dashboard
                  </Button>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <motion.div whileHover={{ scale: 1.05 }}>
                      <Button
                        color="inherit"
                        onClick={handleMenu}
                        startIcon={
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              bgcolor: 'secondary.main',
                              fontSize: '0.9rem'
                            }}
                          >
                            {getInitial(user.name)}
                          </Avatar>
                        }
                      >
                        {user.name}
                      </Button>
                    </motion.div>
                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl)}
                      onClose={handleClose}
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                      }}
                      transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                      }}
                    >
                      <MenuItem disabled>
                        <Typography variant="body2" color="textSecondary">
                          Signed in as {user.role}
                        </Typography>
                      </MenuItem>
                      <Divider />
                      <MenuItem 
                        onClick={() => handleNavigation(user.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard')}
                      >
                        <DashboardIcon fontSize="small" sx={{ mr: 1 }} />
                        Dashboard
                      </MenuItem>
                      <MenuItem onClick={handleLogout}>
                        <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
                        Logout
                      </MenuItem>
                    </Menu>
                  </Box>
                </>
              ) : (
                <>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      color="inherit"
                      component={RouterLink}
                      to="/login"
                      sx={{ mr: 1 }}
                    >
                      Login
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="outlined"
                      color="inherit"
                      component={RouterLink}
                      to="/register"
                      sx={{ border: '1px solid white' }}
                    >
                      Register
                    </Button>
                  </motion.div>
                </>
              )}
            </Box>
          ) : (
            // Mobile Navigation
            <Box>
              <IconButton
                color="inherit"
                aria-label="menu"
                onClick={handleMobileMenu}
                edge="end"
              >
                <MenuIcon />
              </IconButton>
              <Menu
                anchorEl={mobileMenuAnchorEl}
                open={Boolean(mobileMenuAnchorEl)}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                {isAuthenticated ? (
                  <>
                    <MenuItem disabled>
                      <Typography variant="body2" color="textSecondary">
                        Hi, {user.name}
                      </Typography>
                    </MenuItem>
                    <Divider />
                    <MenuItem 
                      onClick={() => handleNavigation(user.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard')}
                    >
                      <DashboardIcon fontSize="small" sx={{ mr: 1 }} />
                      Dashboard
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>
                      <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
                      Logout
                    </MenuItem>
                  </>
                ) : (
                  <>
                    <MenuItem onClick={() => handleNavigation('/login')}>
                      Login
                    </MenuItem>
                    <MenuItem onClick={() => handleNavigation('/register')}>
                      Register
                    </MenuItem>
                  </>
                )}
              </Menu>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar; 