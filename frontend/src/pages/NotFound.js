import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Box, Typography, Button, Paper } from '@mui/material';
import { SentimentVeryDissatisfied as SadIcon } from '@mui/icons-material';
import Logo from '../components/Logo';

const NotFound = () => {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        when: "beforeChildren",
        staggerChildren: 0.2
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
        minHeight: 'calc(100vh - 200px)'
      }}
    >
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <Paper 
          elevation={3}
          sx={{ 
            textAlign: 'center', 
            p: 5, 
            borderRadius: 3,
            maxWidth: 450,
            mx: 'auto'
          }}
        >
          <motion.div variants={itemVariants}>
            <Box sx={{ mb: 2 }}>
              <Logo sx={{ justifyContent: 'center' }} color="theme" />
            </Box>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <SadIcon sx={{ fontSize: 80, color: 'text.secondary', my: 2 }} />
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Typography variant="h1" component="h1" color="error" sx={{ fontWeight: 700 }}>
              404
            </Typography>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Typography variant="h4" component="h2" sx={{ mb: 2 }}>
              Page Not Found
            </Typography>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              The page you are looking for does not exist or has been moved.
            </Typography>
          </motion.div>
          
          <motion.div 
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              component={RouterLink} 
              to="/" 
              variant="contained" 
              color="primary"
              size="large"
              sx={{ px: 4, py: 1 }}
            >
              Return to Home
            </Button>
          </motion.div>
        </Paper>
      </motion.div>
    </Box>
  );
};

export default NotFound; 