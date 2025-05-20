import React from 'react';
import { motion } from 'framer-motion';
import { Typography, Box, useTheme } from '@mui/material';
import { LocalHospital, Security } from '@mui/icons-material';

const Logo = ({ variant = 'full', onClick, sx = {}, color = 'white' }) => {
  const theme = useTheme();

  const iconMotion = {
    hover: {
      rotate: [0, -10, 10, -5, 0],
      transition: { duration: 0.5 }
    },
    tap: { scale: 0.95 }
  };

  // Colors from theme
  const primaryColor = color === 'white' ? 'white' : theme.palette.primary.main;
  const secondaryColor = color === 'white' ? 'white' : theme.palette.secondary.main;

  // Glow effect for white text
  const whiteTextStyles = color === 'white' ? {
    textShadow: '0 0 5px rgba(255, 255, 255, 0.4), 0 0 10px rgba(255, 255, 255, 0.2)',
    filter: 'drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.3))'
  } : {};

  return (
    <motion.div
      whileHover="hover"
      whileTap="tap"
      onClick={onClick}
      style={{ display: 'inline-flex', cursor: onClick ? 'pointer' : 'default' }}
    >
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center',
          ...sx
        }}
      >
        <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <motion.div variants={iconMotion}>
            <LocalHospital 
              sx={{ 
                fontSize: variant === 'small' ? 26 : 35,
                color: primaryColor,
                zIndex: 2,
                position: 'relative',
                ...(color === 'white' ? { filter: 'drop-shadow(0px 0px 3px rgba(0, 0, 0, 0.4))' } : {})
              }}
            />
          </motion.div>
          <motion.div 
            variants={iconMotion}
            style={{ 
              position: 'absolute', 
              left: variant === 'small' ? 8 : 12,
              opacity: 0.9
            }}
          >
            <Security 
              sx={{ 
                fontSize: variant === 'small' ? 26 : 35,
                color: secondaryColor,
                filter: color === 'white' ? 'drop-shadow(0px 0px 3px rgba(0, 0, 0, 0.4))' : 'none'
              }}
            />
          </motion.div>
        </Box>
        
        {variant === 'full' && (
          <motion.div
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Typography 
              variant={variant === 'small' ? 'h6' : 'h5'} 
              component="span"
              sx={{ 
                ml: 1.5, 
                fontWeight: 800,
                color: 'inherit',
                letterSpacing: -0.3,
                ...whiteTextStyles
              }}
            >
              <Box component="span" sx={{ color: primaryColor }}>Med</Box>
              <Box component="span" sx={{ color: secondaryColor }}>Vault</Box>
            </Typography>
          </motion.div>
        )}
      </Box>
    </motion.div>
  );
};

export default Logo; 