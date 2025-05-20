import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in (on app load)
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          setLoading(false);
          return;
        }

        // Set auth header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Fetch user profile
        const response = await axios.get('http://localhost:3001/api/auth/profile');
        setUser(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  // Register user
  const register = async (userData) => {
    try {
      setError(null);
      const response = await axios.post('http://localhost:3001/api/auth/register', userData);
      
      // Save token and update user state
      localStorage.setItem('token', response.data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      setUser(response.data);
      
      return response.data;
    } catch (error) {
      setError(error.response?.data?.error || 'Registration failed');
      throw error;
    }
  };

  // Login user
  const login = async (credentials) => {
    try {
      setError(null);
      const response = await axios.post('http://localhost:3001/api/auth/login', credentials);
      
      // Save token and update user state
      localStorage.setItem('token', response.data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      setUser(response.data);
      
      return response.data;
    } catch (error) {
      setError(error.response?.data?.error || 'Login failed');
      throw error;
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    register,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 