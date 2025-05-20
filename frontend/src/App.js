import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Container, Box } from '@mui/material';
import { useAuth } from './contexts/AuthContext';
import { AnimatePresence } from 'framer-motion';

// Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import PageTransition from './components/PageTransition';
import SplashScreen from './components/SplashScreen';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import DoctorDashboard from './pages/DoctorDashboard';
import PatientDashboard from './pages/PatientDashboard';
import PatientDetails from './pages/PatientDetails';
import NotFound from './pages/NotFound';

function App() {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // Show splash screen while checking authentication status
  if (loading) {
    return <SplashScreen />;
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flex: 1 }}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {/* Public routes */}
            <Route path="/login" element={
              isAuthenticated ? <Navigate to="/" /> : (
                <PageTransition>
                  <Login />
                </PageTransition>
              )
            } />
            <Route path="/register" element={
              isAuthenticated ? <Navigate to="/" /> : (
                <PageTransition>
                  <Register />
                </PageTransition>
              )
            } />
            
            {/* Protected routes */}
            <Route path="/" element={
              isAuthenticated ? (
                user?.role === 'doctor' ? <Navigate to="/doctor/dashboard" /> : <Navigate to="/patient/dashboard" />
              ) : <Navigate to="/login" />
            } />
            
            {/* Doctor routes */}
            <Route path="/doctor/dashboard" element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <PageTransition>
                  <DoctorDashboard />
                </PageTransition>
              </ProtectedRoute>
            } />
            <Route path="/doctor/patients/:patientId" element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <PageTransition>
                  <PatientDetails />
                </PageTransition>
              </ProtectedRoute>
            } />
            
            {/* Patient routes */}
            <Route path="/patient/dashboard" element={
              <ProtectedRoute allowedRoles={['patient']}>
                <PageTransition>
                  <PatientDashboard />
                </PageTransition>
              </ProtectedRoute>
            } />
            
            {/* 404 page */}
            <Route path="*" element={
              <PageTransition>
                <NotFound />
              </PageTransition>
            } />
          </Routes>
        </AnimatePresence>
      </Container>
    </Box>
  );
}

export default App; 