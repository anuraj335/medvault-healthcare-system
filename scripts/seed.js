// Replace Mongoose with direct MongoDB driver
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../backend/.env') });

const url = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = 'healthcare-app';

console.log('Starting database seed with native MongoDB driver...');
console.log('MongoDB URL:', url);

// Create a MongoDB client
const client = new MongoClient(url, {
  connectTimeoutMS: 30000,
  socketTimeoutMS: 60000
});

async function seedDatabase() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await client.connect();
    console.log('Connected to MongoDB server');

    // Reference the database
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

    // Create doctor users
    console.log('Creating doctor users...');
    const doctorUsers = [
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
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@hospital.com',
        password: await bcrypt.hash('password123', 10),
        role: 'doctor',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Dr. Michael Williams',
        email: 'michael.williams@clinic.com',
        password: await bcrypt.hash('password123', 10),
        role: 'doctor',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Dr. Emily Davis',
        email: 'emily.davis@hospital.com',
        password: await bcrypt.hash('password123', 10),
        role: 'doctor',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    const doctorResult = await db.collection('users').insertMany(doctorUsers);
    console.log(`${doctorResult.insertedCount} doctor users created successfully`);

    // Create patient users - 25 patients (5 per doctor on average)
    console.log('Creating patient users...');
    const patientNames = [
      'Jane Doe', 'John Miller', 'Emily Clark', 'Robert Johnson', 'Lisa Anderson',
      'Thomas Wilson', 'Jessica Martinez', 'Daniel Taylor', 'Sophia Lee', 'David Brown',
      'Olivia White', 'James Garcia', 'Emma Rodriguez', 'Michael Thompson', 'Sarah Martin',
      'Christopher Lopez', 'Amanda Harris', 'Matthew Wright', 'Jennifer Lewis', 'Andrew Green',
      'Nicole Turner', 'Kevin Walker', 'Ashley Parker', 'Brian Hall', 'Patricia Young'
    ];

    const patientEmails = [
      'jane.doe@gmail.com', 'john.miller@gmail.com', 'emily.clark@gmail.com', 'robert.johnson@yahoo.com', 'lisa.anderson@hotmail.com',
      'thomas.wilson@gmail.com', 'jessica.martinez@outlook.com', 'daniel.taylor@gmail.com', 'sophia.lee@yahoo.com', 'david.brown@gmail.com',
      'olivia.white@outlook.com', 'james.garcia@gmail.com', 'emma.rodriguez@hotmail.com', 'michael.thompson@gmail.com', 'sarah.martin@yahoo.com',
      'chris.lopez@gmail.com', 'amanda.harris@hotmail.com', 'matt.wright@gmail.com', 'jennifer.lewis@gmail.com', 'andrew.green@outlook.com',
      'nicole.turner@yahoo.com', 'kevin.walker@gmail.com', 'ashley.parker@hotmail.com', 'brian.hall@gmail.com', 'patricia.young@outlook.com'
    ];

    const patientUsers = [];
    for (let i = 0; i < patientNames.length; i++) {
      patientUsers.push({
        name: patientNames[i],
        email: patientEmails[i],
        password: await bcrypt.hash('password123', 10),
        role: 'patient',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    const patientResult = await db.collection('users').insertMany(patientUsers);
    console.log(`${patientResult.insertedCount} patient users created successfully`);

    // Get the inserted users
    const insertedUsers = await db.collection('users').find().toArray();
    
    // Split users by role
    const insertedDoctorUsers = insertedUsers.filter(user => user.role === 'doctor');
    const insertedPatientUsers = insertedUsers.filter(user => user.role === 'patient');

    // Generate common medical conditions and allergies
    const commonConditions = [
      'Hypertension', 'Diabetes Type 2', 'Asthma', 'Obesity', 'Depression',
      'Anxiety', 'Arthritis', 'Heart Disease', 'Osteoporosis', 'COPD',
      'Alzheimer\'s Disease', 'Migraine', 'Insomnia', 'Hypothyroidism', 'Psoriasis'
    ];

    const commonAllergies = [
      'Penicillin', 'Peanuts', 'Shellfish', 'Dairy', 'Pollen',
      'Dust Mites', 'Mold', 'Latex', 'Wheat', 'Soy',
      'Eggs', 'Tree Nuts', 'Insect Stings', 'Sulfa Drugs', 'NSAIDs'
    ];

    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const genders = ['male', 'female'];

    // Create patients with enhanced data
    console.log('Creating patients...');
    const patients = insertedPatientUsers.map((user, index) => {
      // Generate a random birth date between 18 and 85 years ago
      const dob = new Date();
      dob.setFullYear(dob.getFullYear() - Math.floor(Math.random() * 67 + 18));
      
      // Generate 1-3 random chronic conditions
      const numConditions = Math.floor(Math.random() * 3) + 1;
      const conditions = [];
      for (let i = 0; i < numConditions; i++) {
        const condition = commonConditions[Math.floor(Math.random() * commonConditions.length)];
        if (!conditions.includes(condition)) {
          conditions.push(condition);
        }
      }
      
      // Generate 0-2 random allergies
      const numAllergies = Math.floor(Math.random() * 3);
      const allergies = [];
      for (let i = 0; i < numAllergies; i++) {
        const allergy = commonAllergies[Math.floor(Math.random() * commonAllergies.length)];
        if (!allergies.includes(allergy)) {
          allergies.push(allergy);
        }
      }
      
      // Generate medical history entries based on chronic conditions
      const medicalHistory = [];
      
      // Add a general checkup for everyone
      medicalHistory.push({
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Random date in last 30 days
        diagnosis: 'General checkup',
        treatment: 'None required',
        notes: 'Patient is in good health'
      });
      
      // Add condition-specific entries
      conditions.forEach(condition => {
        const diagnosisDate = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // Random date in last year
        
        let treatment, notes;
        switch(condition) {
          case 'Hypertension':
            treatment = 'Prescribed Lisinopril, recommended diet changes';
            notes = 'Blood pressure: 150/90, needs follow-up in 3 months';
            break;
          case 'Diabetes Type 2':
            treatment = 'Prescribed Metformin, dietary changes, regular exercise';
            notes = 'HbA1c: 7.2%, needs to monitor blood sugar levels';
            break;
          case 'Asthma':
            treatment = 'Prescribed albuterol inhaler';
            notes = 'Mild asthma, triggers include exercise and cold air';
            break;
          default:
            treatment = 'Lifestyle modifications and regular monitoring';
            notes = `${condition} is under control`;
        }
        
        medicalHistory.push({
          date: diagnosisDate,
          diagnosis: `${condition} diagnosis and management`,
          treatment,
          notes
        });
      });
      
      // Generate prescriptions based on conditions
      const prescriptions = [];
      conditions.forEach(condition => {
        const prescriptionDate = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // Random date in last 90 days
        
        let medication, dosage, frequency, duration, notes;
        switch(condition) {
          case 'Hypertension':
            medication = 'Lisinopril';
            dosage = '10mg';
            frequency = 'Once daily';
            duration = '90 days';
            notes = 'Take in the morning with food';
            break;
          case 'Diabetes Type 2':
            medication = 'Metformin';
            dosage = '500mg';
            frequency = 'Twice daily';
            duration = '90 days';
            notes = 'Take with meals';
            break;
          case 'Asthma':
            medication = 'Albuterol';
            dosage = '90mcg';
            frequency = 'As needed';
            duration = '30 days';
            notes = 'Use inhaler before exercise';
            break;
          case 'Depression':
            medication = 'Sertraline';
            dosage = '50mg';
            frequency = 'Once daily';
            duration = '30 days';
            notes = 'Take in the morning';
            break;
          case 'Anxiety':
            medication = 'Lorazepam';
            dosage = '0.5mg';
            frequency = 'As needed';
            duration = '15 days';
            notes = 'Do not use with alcohol';
            break;
          default:
            medication = 'Vitamins';
            dosage = 'As directed';
            frequency = 'Once daily';
            duration = '30 days';
            notes = 'General supplement';
        }
        
        prescriptions.push({
          date: prescriptionDate,
          medication,
          dosage,
          frequency,
          duration,
          notes
        });
      });
      
      // Generate condition details based on chronic conditions
      const conditionDetails = [];
      
      conditions.forEach(condition => {
        const diagnosisDate = new Date(Date.now() - Math.random() * 365 * 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // Random date in last 3 years
        
        let severity, currentSymptoms, medications, notes;
        
        switch(condition) {
          case 'Hypertension':
            severity = ['mild', 'moderate', 'severe'][Math.floor(Math.random() * 3)];
            currentSymptoms = ['Headaches', 'Dizziness', 'Shortness of breath'];
            medications = ['Lisinopril', 'Amlodipine', 'Hydrochlorothiazide'];
            notes = 'Need to monitor blood pressure daily. Reducing salt intake.';
            break;
            
          case 'Diabetes Type 2':
            severity = ['mild', 'moderate', 'severe'][Math.floor(Math.random() * 3)];
            currentSymptoms = ['Increased thirst', 'Frequent urination', 'Fatigue'];
            medications = ['Metformin', 'Glipizide', 'Insulin'];
            notes = 'Following a strict diet and exercise regimen. Monitoring blood sugar levels daily.';
            break;
            
          case 'Asthma':
            severity = ['mild', 'moderate', 'severe'][Math.floor(Math.random() * 3)];
            currentSymptoms = ['Wheezing', 'Shortness of breath', 'Chest tightness'];
            medications = ['Albuterol inhaler', 'Fluticasone', 'Montelukast'];
            notes = 'Triggered by cold weather and exercise. Keeping rescue inhaler nearby at all times.';
            break;
            
          case 'Depression':
            severity = ['mild', 'moderate', 'severe'][Math.floor(Math.random() * 3)];
            currentSymptoms = ['Low mood', 'Loss of interest', 'Sleep difficulties'];
            medications = ['Sertraline', 'Bupropion', 'Trazodone'];
            notes = 'Attending therapy sessions weekly. Symptoms improve with regular exercise.';
            break;
            
          case 'Anxiety':
            severity = ['mild', 'moderate', 'severe'][Math.floor(Math.random() * 3)];
            currentSymptoms = ['Excessive worry', 'Restlessness', 'Panic attacks'];
            medications = ['Lorazepam', 'Escitalopram', 'Buspirone'];
            notes = 'Using breathing techniques for acute episodes. Working on stress management.';
            break;
            
          case 'Arthritis':
            severity = ['mild', 'moderate', 'severe'][Math.floor(Math.random() * 3)];
            currentSymptoms = ['Joint pain', 'Stiffness', 'Reduced range of motion'];
            medications = ['Ibuprofen', 'Meloxicam', 'Prednisone'];
            notes = 'Pain worsens in cold weather. Physical therapy twice weekly.';
            break;
            
          default:
            severity = ['mild', 'moderate'][Math.floor(Math.random() * 2)];
            currentSymptoms = ['Varies'];
            medications = ['Over-the-counter medications as needed'];
            notes = `Managing ${condition} with lifestyle modifications.`;
        }
        
        // Only include 1-2 symptoms and medications randomly
        const numSymptoms = 1 + Math.floor(Math.random() * 2);
        const selectedSymptoms = currentSymptoms.slice(0, numSymptoms);
        
        const numMeds = 1 + Math.floor(Math.random() * 2);
        const selectedMeds = medications.slice(0, numMeds);
        
        conditionDetails.push({
          condition,
          diagnosedDate: diagnosisDate,
          severity,
          currentSymptoms: selectedSymptoms,
          medications: selectedMeds,
          notes,
          lastUpdated: new Date()
        });
      });
      
      return {
        userId: user._id,
        dateOfBirth: dob,
        gender: genders[index % genders.length],
        bloodGroup: bloodGroups[index % bloodGroups.length],
        contactNumber: `+1${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        emergencyContact: {
          name: `Family of ${user.name}`,
          relationship: ['Spouse', 'Parent', 'Sibling', 'Child'][Math.floor(Math.random() * 4)],
          contactNumber: `+1${Math.floor(1000000000 + Math.random() * 9000000000)}`
        },
        address: {
          street: `${Math.floor(1000 + Math.random() * 9000)} Main St`,
          city: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Francisco'][Math.floor(Math.random() * 10)],
          state: ['NY', 'CA', 'IL', 'TX', 'AZ', 'PA', 'FL', 'GA', 'OH', 'NC'][Math.floor(Math.random() * 10)],
          zipCode: `${Math.floor(10000 + Math.random() * 90000)}`,
          country: 'USA'
        },
        allergies,
        chronicConditions: conditions,
        conditionDetails,
        medicalHistory,
        prescriptions,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    });

    const insertedPatientsResult = await db.collection('patients').insertMany(patients);
    console.log(`${insertedPatientsResult.insertedCount} patients created successfully`);

    // Get the inserted patients
    const insertedPatients = await db.collection('patients').find().toArray();
    
    // Create doctors with enhanced data and distribute patients
    console.log('Creating doctors...');
    const specializations = [
      'Cardiology', 
      'General Physician', 
      'Neurology', 
      'Pediatrics', 
      'Dermatology'
    ];
    
    const hospitals = [
      {
        name: 'General Hospital',
        address: {
          street: '123 Medical Ave',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA'
        }
      },
      {
        name: 'Community Medical Center',
        address: {
          street: '456 Health Blvd',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90001',
          country: 'USA'
        }
      },
      {
        name: 'University Hospital',
        address: {
          street: '789 Treatment St',
          city: 'Chicago',
          state: 'IL',
          zipCode: '60001',
          country: 'USA'
        }
      }
    ];
    
    // Distribute patients to doctors
    // We'll create a more realistic distribution where:
    // - Some doctors have more patients than others
    // - Some patients see multiple doctors (based on their conditions)
    const doctorPatientMap = {};
    
    // Initialize doctor-patient map
    insertedDoctorUsers.forEach(doctor => {
      doctorPatientMap[doctor._id.toString()] = [];
    });
    
    // Assign patients to doctors based on conditions
    insertedPatients.forEach(patient => {
      // Determine how many doctors this patient will see (1-3)
      const numDoctors = Math.min(1 + Math.floor(Math.random() * patient.chronicConditions.length), 3);
      
      // Select random doctors for this patient
      const doctorIndices = [];
      while (doctorIndices.length < numDoctors) {
        const idx = Math.floor(Math.random() * insertedDoctorUsers.length);
        if (!doctorIndices.includes(idx)) {
          doctorIndices.push(idx);
        }
      }
      
      // Assign patient to selected doctors
      doctorIndices.forEach(idx => {
        const doctorId = insertedDoctorUsers[idx]._id.toString();
        doctorPatientMap[doctorId].push(patient._id);
      });
    });
    
    // Create doctor documents
    const doctors = insertedDoctorUsers.map((user, index) => {
      return {
        userId: user._id,
        specialization: specializations[index % specializations.length],
        hospital: hospitals[index % hospitals.length],
        qualifications: [
          {
            degree: 'MD',
            institution: ['Harvard Medical School', 'Johns Hopkins School of Medicine', 'Stanford University School of Medicine', 'Yale School of Medicine', 'Mayo Medical School'][index % 5],
            year: 2010 - index
          },
          {
            degree: ['Board Certification', 'PhD', 'Fellowship', 'MPH', 'MBA'][index % 5],
            institution: ['American Medical Association', 'Mayo Clinic', 'Cleveland Clinic', 'Johns Hopkins Hospital', 'Massachusetts General Hospital'][index % 5],
            year: 2015 - index
          }
        ],
        experience: 5 + index * 2,
        licenseNumber: `MED${100000 + index}`,
        contactNumber: `+1${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        bio: `Dr. ${user.name.split(' ')[1]} is a dedicated healthcare professional with ${5 + index * 2} years of experience in ${specializations[index % specializations.length]}.`,
        availability: [
          {
            day: 'monday',
            startTime: '09:00',
            endTime: '17:00'
          },
          {
            day: 'tuesday',
            startTime: '09:00',
            endTime: '17:00'
          },
          {
            day: 'wednesday',
            startTime: '09:00',
            endTime: '17:00'
          },
          {
            day: 'thursday',
            startTime: '09:00',
            endTime: '17:00'
          },
          {
            day: 'friday',
            startTime: '09:00',
            endTime: '17:00'
          }
        ],
        patients: doctorPatientMap[user._id.toString()],
        createdAt: new Date(),
        updatedAt: new Date()
      };
    });

    const doctorsResult = await db.collection('doctors').insertMany(doctors);
    console.log(`${doctorsResult.insertedCount} doctors created successfully`);
    
    // Log patient distribution
    doctors.forEach(doctor => {
      console.log(`Dr. ${insertedDoctorUsers.find(u => u._id.toString() === doctor.userId.toString()).name.split(' ')[1]} has ${doctor.patients.length} patients`);
    });

    console.log('Database seeded successfully!');
    console.log(`Created ${insertedDoctorUsers.length} doctors and ${insertedPatientUsers.length} patients`);
  } catch (error) {
    console.error('Error seeding database:', error.message);
    console.error(error.stack);
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
    console.log('Seed process completed successfully');
    process.exit(0);
  })
  .catch(err => {
    console.error('Seed process failed:', err);
    process.exit(1);
  });