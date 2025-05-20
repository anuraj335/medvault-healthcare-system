import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import Logo from './Logo';

const SplashScreen = () => {
  // Pulsing animation for the logo
  const pulseAnimation = {
    scale: [1, 1.05, 1],
    opacity: [0.9, 1, 0.9],
    transition: {
      duration: 2,
      ease: "easeInOut",
      repeat: Infinity,
    }
  };
  
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={pulseAnimation}
        transition={{ duration: 0.5 }}
      >
        <Logo sx={{ transform: 'scale(1.5)', mb: 4 }} color="theme" />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <CircularProgress
          size={40}
          thickness={4}
          sx={{ mt: 3 }}
        />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{ 
            mt: 2, 
            fontWeight: 500,
            letterSpacing: 1,
            textTransform: 'uppercase',
            fontSize: '0.875rem'
          }}
        >
          Loading your secure healthcare data
        </Typography>
      </motion.div>
    </Box>
  );
};

export default SplashScreen; 