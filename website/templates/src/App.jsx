import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import { Container } from '@mui/material';

// ProtectedRoute component ensures that only authenticated users can access certain routes
const ProtectedRoute = ({ children }) => {
  const user = localStorage.getItem('user'); // Retrieve user data from localStorage

  // If no user is found (not logged in), redirect to the login page
  if (!user) {
    return <Navigate to="/login" />;
  }

  // If user exists, allow access to the requested route
  return children;
};

const App = () => {
  return (
    <Routes>
      {/* Protected Route for Home Page ("/") */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />

      {/* Protected Route for Dashboard (alias to Home) */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />

      {/* Public Route for Login */}
      <Route
        path="/login"
        element={
          <Container component="main" maxWidth="xs">
            <Login />
          </Container>
        }
      />

      {/* Public Route for Registration */}
      <Route
        path="/register"
        element={
          <Container component="main" maxWidth="xs">
            <Register />
          </Container>
        }
      />
    </Routes>
  );
};

export default App;
