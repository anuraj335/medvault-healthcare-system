const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify token middleware
const verifyToken = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user to request object
    const user = await User.findById(decoded._id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};

// Check if user is a doctor
const doctorOnly = (req, res, next) => {
  if (req.user && req.user.role === 'doctor') {
    next();
  } else {
    res.status(403).json({ error: 'Access denied. Doctors only.' });
  }
};

// Check if user is a patient
const patientOnly = (req, res, next) => {
  if (req.user && req.user.role === 'patient') {
    next();
  } else {
    res.status(403).json({ error: 'Access denied. Patients only.' });
  }
};

module.exports = { verifyToken, doctorOnly, patientOnly }; 