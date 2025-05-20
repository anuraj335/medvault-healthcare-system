const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { MongoClient } = require('mongodb');

// Import routes
const authRoutes = require('./routes/auth');
const doctorRoutes = require('./routes/doctor');
const patientRoutes = require('./routes/patient');
const appointmentRoutes = require('./routes/appointmentRoutes');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Middleware
app.use(express.json());
// Configure CORS to explicitly allow frontend requests
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// Connection URL and Database Name
const url = process.env.MONGODB_URI || 'mongodb://localhost:27017/healthcare-app';

// Connect to MongoDB using native driver first to ensure connection
console.log('Connecting to MongoDB...');
console.log('MongoDB URL:', url);

// Connect directly with mongoose with improved options
mongoose.connect(url, {
  serverSelectionTimeoutMS: 60000,
  socketTimeoutMS: 90000,
  connectTimeoutMS: 60000,
  serverApi: {
    version: '1',
    strict: false,
    deprecationErrors: false
  },
  maxPoolSize: 20,
  minPoolSize: 5,
  maxIdleTimeMS: 60000,
  family: 4  // Use IPv4
})
  .then(() => {
    console.log('Connected to MongoDB successfully');
    
    // Set Mongoose options after successful connection
    mongoose.set('bufferCommands', false); // Disable buffering to prevent timeout issues
    
    // Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/doctors', doctorRoutes);
    app.use('/api/patients', patientRoutes);
    app.use('/api/appointments', appointmentRoutes);
    
    // Root route
    app.get('/', (req, res) => {
      res.send('Healthcare API is running!');
    });
    
    // Start server
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Could not connect to MongoDB:', err);
    process.exit(1);
  }); 