import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Editor from './pages/Editor';
import Template from './pages/Template';
import AISummary from './pages/AISummary';
import PostSystem from './pages/PostSystem';
import Favourites from './pages/Favourites';
import Newsletters from './pages/Newsletters';
import History from './pages/History';
import { Container, Box } from '@mui/material';
import NavBar from './components/NavBar';

// ProtectedRoute component ensures that only authenticated users can access certain routes
const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/check-auth', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.status === 401 || response.status === 403) {
          // Only clear auth state for actual authentication failures
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
          return;
        }

        if (!response.ok) {
          // For other errors (network, server errors), keep trying
          console.error('Auth check failed:', response.status);
          return;
        }

        const data = await response.json();
        setIsAuthenticated(data.authenticated);
      } catch (error) {
        // For unexpected errors, log but don't clear auth state
        console.error('Auth check error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  if (isLoading) {
    return <div>Loading...</div>; // Or a proper loading spinner
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

const App = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    // Initialize from localStorage if available
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const handleLogout = async () => {
    try {
      const response = await fetch('/logout', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }

      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  return (
    <div style={{ display: 'flex' }}>
      <NavBar user={user} onLogout={handleLogout} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          minHeight: '100vh',
          marginLeft: '240px'
        }}
      >
        <Routes>
          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/editor"
            element={
              <ProtectedRoute>
                <Editor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/templates"
            element={
              <ProtectedRoute>
                <Template />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai-summary"
            element={
              <ProtectedRoute>
                <AISummary />
              </ProtectedRoute>
            }
          />
          <Route
            path="/post-system"
            element={
              <ProtectedRoute>
                <PostSystem />
              </ProtectedRoute>
            }
          />
          <Route
            path="/favourites"
            element={
              <ProtectedRoute>
                <Favourites />
              </ProtectedRoute>
            }
          />
          <Route
            path="/newsletters"
            element={
              <ProtectedRoute>
                <Newsletters />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            }
          />

          {/* Public Routes */}
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register onLogin={handleLogin} />} />
        </Routes>
      </Box>
    </div>
  );
};

export default App;
