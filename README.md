# MedVault (Healthcare Management System)

A web application for managing doctor-patient relationships, medical histories, and prescriptions.

## Features

- User authentication (JWT-based) for doctors and patients
- Role-based access control
- Doctors can:
  - View their patient list
  - Add medical history records
  - Prescribe medications
  - Assign new patients
- Patients can:
  - View their medical history
  - View their prescriptions
  - View their assigned doctors

## Tech Stack

- **Backend**: Node.js, Express, MongoDB, Mongoose
- **Security**: JWT Authentication, Bcrypt password hashing
- **Database**: MongoDB

## Project Structure

```
/healthcare-app
  /backend
    /controllers        # Request handlers
    /models             # Database schemas
    /routes             # API routes
    /middleware         # Custom middleware (auth, roles)
    /utils              # Utility functions
    server.js           # Express app setup
    .env                # Environment variables
  /frontend             # Frontend code (to be added)
  /scripts
    seed.js             # Database seeding script
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user (doctor or patient)
- `POST /api/auth/login` - Login and receive JWT token
- `GET /api/auth/profile` - Get user profile

### Doctor Routes (Protected)
- `GET /api/doctors/profile` - Get doctor's profile
- `GET /api/doctors/patients` - Get all patients assigned to doctor
- `GET /api/doctors/patients/:patientId` - Get specific patient details
- `POST /api/doctors/patients/:patientId/medical-history` - Add medical history
- `POST /api/doctors/patients/:patientId/prescriptions` - Add prescription
- `POST /api/doctors/assign-patient` - Assign patient to doctor

### Patient Routes (Protected)
- `GET /api/patients/profile` - Get patient's profile
- `GET /api/patients/medical-history` - Get patient's medical history
- `GET /api/patients/prescriptions` - Get patient's prescriptions
- `GET /api/patients/doctors` - Get patient's assigned doctors

## Setup Instructions

### Prerequisites
- Node.js (v14+)
- MongoDB

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/healthcare-app.git
   cd healthcare-app
   ```

2. Install backend dependencies
   ```bash
   cd backend
   npm install
   ```

3. Set up environment variables
   - Create a `.env` file in the backend directory
   - Add the following variables:
     ```
     PORT=5000
     MONGODB_URI=mongodb://localhost:27017/healthcare-app
     JWT_SECRET=your_secure_jwt_secret_key_here
     ```

4. Seed the database (optional)
   ```bash
   cd ../scripts
   node seed.js
   ```

5. Start the server
   ```bash
   cd ../backend
   npm run dev
   ```

## Security Implementation

This application implements several security measures:

1. **JWT Authentication**: All protected routes require a valid JWT token
2. **Role-Based Access Control**: Different routes are accessible based on user roles
3. **Relationship Verification**: 
   - Doctors can only access data for patients assigned to them
   - Patients can only access their own data
4. **Password Hashing**: User passwords are hashed using bcrypt

## Sample Users (From Seed Data)

### Doctors:
- Email: alice.brown@hospital.com, Password: password123
- Email: bob.smith@clinic.com, Password: password123

### Patients:
- Email: jane.doe@gmail.com, Password: password123
- Email: john.miller@gmail.com, Password: password123
- Email: emily.clark@gmail.com, Password: password123 
