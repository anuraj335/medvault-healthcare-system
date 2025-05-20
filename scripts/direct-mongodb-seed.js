// Use the MongoDB native driver directly instead of Mongoose
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../backend/.env') });

// Connection URL and Database Name
const url = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = 'healthcare-app';

console.log('Starting direct MongoDB seed using native driver');
console.log('MongoDB URL:', url);

// Create a new MongoClient
const client = new MongoClient(url, {
  connectTimeoutMS: 30000,
  socketTimeoutMS: 60000,
  directConnection: true
});

async function seedDatabase() {
  try {
    // Connect to the MongoDB server
    console.log('Connecting to MongoDB...');
    await client.connect();
    console.log('Connected to MongoDB server');

    // Get the database
    const db = client.db(dbName);
    
    // Clear existing collections
    console.log('Clearing existing collections...');
    try {
      await db.collection('users').drop();
      console.log('Dropped users collection');
    } catch (err) {
      console.log('Users collection may not exist, continuing...');
    }
    
    try {
      await db.collection('doctors').drop();
      console.log('Dropped doctors collection');
    } catch (err) {
      console.log('Doctors collection may not exist, continuing...');
    }
    
    try {
      await db.collection('patients').drop();
      console.log('Dropped patients collection');
    } catch (err) {
      console.log('Patients collection may not exist, continuing...');
    }

    // Create users
    console.log('Creating users...');
    const users = [
      {
        name: 'Dr. Alice Brown',
        email: 'alice.brown@hospital.com',
        password: await bcrypt.hash('password123', 10),
        role: 'doctor',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Dr. Bob Smith',
        email: 'bob.smith@clinic.com',
        password: await bcrypt.hash('password123', 10),
        role: 'doctor',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Jane Doe',
        email: 'jane.doe@gmail.com',
        password: await bcrypt.hash('password123', 10),
        role: 'patient',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'John Miller',
        email: 'john.miller@gmail.com',
        password: await bcrypt.hash('password123', 10),
        role: 'patient',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Emily Clark',
        email: 'emily.clark@gmail.com',
        password: await bcrypt.hash('password123', 10),
        role: 'patient',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    const usersResult = await db.collection('users').insertMany(users);
    console.log(`${usersResult.insertedCount} users inserted`);

    // Get the inserted user IDs
    const insertedUsers = await db.collection('users').find().toArray();
    console.log('Users created:', insertedUsers.map(u => u.name).join(', '));

    // Filter users by role
    const doctorUsers = insertedUsers.filter(user => user.role === 'doctor');
    const patientUsers = insertedUsers.filter(user => user.role === 'patient');

    // Create patients
    console.log('Creating patients...');
    const patients = patientUsers.map(user => ({
      userId: user._id,
      medicalHistory: [
        {
          date: '2023-01-10',
          diagnosis: 'General checkup',
          treatment: 'None required'
        }
      ],
      prescriptions: [
        {
          date: '2023-01-10',
          medication: 'Vitamins',
          dosage: 'As directed'
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    const patientsResult = await db.collection('patients').insertMany(patients);
    console.log(`${patientsResult.insertedCount} patients inserted`);

    // Get the inserted patient IDs
    const insertedPatients = await db.collection('patients').find().toArray();

    // Create doctors
    console.log('Creating doctors...');
    const doctors = doctorUsers.map((user, index) => ({
      userId: user._id,
      specialization: index === 0 ? 'Cardiology' : 'General Physician',
      patients: insertedPatients
        .filter((_, patientIndex) => patientIndex % doctorUsers.length === index)
        .map(patient => patient._id),
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    const doctorsResult = await db.collection('doctors').insertMany(doctors);
    console.log(`${doctorsResult.insertedCount} doctors inserted`);

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // Close the connection
    console.log('Closing MongoDB connection...');
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedDatabase()
  .then(() => {
    console.log('Seed process completed');
    process.exit(0);
  })
  .catch(err => {
    console.error('Seed process failed:', err);
    process.exit(1);
  }); 