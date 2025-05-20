const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../backend/.env') });

console.log("Starting simple seed...");
console.log("Connection string:", process.env.MONGODB_URI || 'mongodb://localhost:27017/healthcare-app');

// Try to connect with improved connection options
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/healthcare-app', {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000,
  directConnection: true,
  autoCreate: true,
  maxPoolSize: 10,
  minPoolSize: 1,
  maxIdleTimeMS: 30000
})
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ Could not connect to MongoDB:', err.message);
    process.exit(1);
  });

// Import just the User model
const User = require('../backend/models/User');

const simpleSeed = async () => {
  try {
    console.log("Attempting to delete existing users...");
    
    // Use a more direct approach with a timeout
    await User.collection.drop().catch(err => {
      // Ignore "ns not found" error which means the collection doesn't exist yet
      if (err.code !== 26) {
        console.warn("Warning when dropping collection:", err.message);
      } else {
        console.log("Collection didn't exist, continuing...");
      }
    });
    
    console.log("Successfully prepared for new users");
    
    console.log("Creating test user...");
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'doctor'
    });
    
    console.log("✅ User created successfully:", user.name);
    
    // Close the connection properly before exiting
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
    process.exit(0);
  } catch (error) {
    console.error('❌ Error in simple seed:', error.message);
    console.error(error.stack);
    
    // Try to close connection even on error
    try {
      await mongoose.connection.close();
      console.log("MongoDB connection closed");
    } catch (closeErr) {
      console.error("Error closing MongoDB connection:", closeErr.message);
    }
    process.exit(1);
  }
};

// Add a small delay before starting the seed operation
setTimeout(() => {
  console.log("Starting seed operation...");
  simpleSeed();
}, 2000); 