// Direct MongoDB connection test without using Mongoose
const { MongoClient } = require('mongodb');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../backend/.env') });

// Connection URL and Database Name
const url = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = 'healthcare-app';

console.log('Testing direct MongoDB connection');
console.log('MongoDB URL:', url);

// Create a new MongoClient
const client = new MongoClient(url, {
  connectTimeoutMS: 5000,
  socketTimeoutMS: 10000,
  directConnection: true
});

async function testConnection() {
  try {
    // Connect to the MongoDB server
    console.log('Attempting to connect to MongoDB...');
    await client.connect();
    console.log('✅ Successfully connected to MongoDB server');
    
    // Check if we can access the database
    const db = client.db(dbName);
    const adminDb = client.db('admin');
    
    // Get server status
    const status = await adminDb.command({ serverStatus: 1 });
    console.log('✅ MongoDB server is running properly');
    console.log(`MongoDB version: ${status.version}`);
    console.log(`Connections: ${status.connections.current} current / ${status.connections.available} available`);
    
    // Try to list collections
    const collections = await db.listCollections().toArray();
    console.log(`✅ Collections in database: ${collections.length}`);
    if (collections.length > 0) {
      console.log('Collection names: ' + collections.map(c => c.name).join(', '));
    } else {
      console.log('Database exists but has no collections yet');
    }
    
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    if (error.name === 'MongoServerSelectionError') {
      console.error('This usually means MongoDB server is not running or not accessible.');
      console.log('\nPossible solutions:');
      console.log('1. Make sure MongoDB server is installed and running');
      console.log('2. Check firewall settings to ensure the port is accessible');
      console.log('3. Verify connection string in .env file is correct');
      console.log('4. If using MongoDB Atlas, ensure your IP is whitelisted');
    }
    return false;
  } finally {
    // Close the connection
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the test
testConnection()
  .then(success => {
    console.log(success ? 'Connection test passed.' : 'Connection test failed.');
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
  }); 