const mongoose = require('mongoose');

// Hard-code the connection string for testing
const MONGODB_URI = "mongodb+srv://omkumar20161718:K3Em54URHDrshO4k@cluster0.oblcbgu.mongodb.net/?retryWrites=true&w=majority";
// Replace with your actual MongoDB Atlas connection string

console.log('Using connection string:', MONGODB_URI);

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  connectTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 30000,
};

mongoose.connect(MONGODB_URI, options)
  .then(() => {
    console.log('Connected to MongoDB successfully!');
    // Try a simple operation
    return mongoose.connection.db.admin().ping();
  })
  .then(() => {
    console.log('Database ping successful!');
    process.exit(0);
  })
  .catch(error => {
    console.error('Database connection error details:', error);
    process.exit(1);
  });