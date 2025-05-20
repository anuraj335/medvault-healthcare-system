import React from 'react';
import { motion } from 'framer-motion';

// FadeIn component that can be used to wrap any element
// and provide a customizable fade-in animation
const FadeIn = ({ 
  children, 
  duration = 0.5, 
  delay = 0, 
  direction = null,
  distance = 20,
  ...props 
}) => {
  // Calculate initial animation properties based on direction
  const getInitialProps = () => {
    const initial = { opacity: 0 };
    
    if (direction === 'up') {
      initial.y = distance;
    } else if (direction === 'down') {
      initial.y = -distance;
    } else if (direction === 'left') {
      initial.x = distance;
    } else if (direction === 'right') {
      initial.x = -distance;
    }
    
    return initial;
  };
  
  // Calculate animate properties (final state)
  const getAnimateProps = () => {
    const animate = { opacity: 1 };
    
    if (direction === 'up' || direction === 'down') {
      animate.y = 0;
    } else if (direction === 'left' || direction === 'right') {
      animate.x = 0;
    }
    
    return animate;
  };

  return (
    <motion.div
      initial={getInitialProps()}
      animate={getAnimateProps()}
      transition={{
        duration: duration,
        delay: delay,
        ease: "easeOut"
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default FadeIn; 