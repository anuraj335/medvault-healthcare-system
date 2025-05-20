const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../backend/.env') });

console.log("Testing MongoDB connection...");
console.log("Connection string:", process.env.MONGODB_URI || 'mongodb://localhost:27017/healthcare-app');

// Try to connect with increased timeout
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/healthcare-app', {
  serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
  directConnection: true
})
  .then(() => {
    console.log('✅ Successfully connected to MongoDB!');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Could not connect to MongoDB:', err.message);
    console.log('\nPossible solutions:');
    console.log('1. Make sure MongoDB server is running');
    console.log('2. Check if the connection string is correct');
    console.log('3. If using MongoDB Atlas, ensure your IP address is whitelisted');
    console.log('4. Verify network connectivity to the MongoDB server');
    process.exit(1);
  }); 