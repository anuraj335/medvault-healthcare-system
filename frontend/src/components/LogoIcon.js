import React from 'react';
import { Box, SvgIcon } from '@mui/material';
import { LocalHospital, Security } from '@mui/icons-material';

// This component is only used for generating icons and favicon
// It's a simplified version of the Logo component without animations
const LogoIcon = ({ primaryColor = '#4285F4', secondaryColor = '#34A853', size = 128 }) => {
  return (
    <Box 
      sx={{ 
        position: 'relative',
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <LocalHospital 
          sx={{ 
            fontSize: size * 0.8,
            color: primaryColor,
            zIndex: 2,
            position: 'relative'
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: size * 0.15, // Slightly offset
            zIndex: 1
          }}
        >
          <Security 
            sx={{ 
              fontSize: size * 0.8,
              color: secondaryColor
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default LogoIcon; 