import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@mui/material';

// This component is a wrapper around MUI Button with framer-motion animations
const AnimatedButton = ({ children, disabled, ...props }) => {
  return (
    <motion.div
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      <Button disabled={disabled} {...props}>
        {children}
      </Button>
    </motion.div>
  );
};

export default AnimatedButton; 