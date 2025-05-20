const express = require('express');
const router = express.Router();
const { register, login, getUserProfile } = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

// Register route
router.post('/register', register);

// Login route
router.post('/login', login);

// Get user profile route (protected)
router.get('/profile', verifyToken, getUserProfile);

module.exports = router; 