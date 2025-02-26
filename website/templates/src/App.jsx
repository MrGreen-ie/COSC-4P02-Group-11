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
import { Box } from '@mui/material';
import NavBar from './components/NavBar';
import AboutUs from './pages/AboutUs';  
import Contact from './pages/Contact';  

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
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
          return;
        }

        if (!response.ok) {
          console.error('Auth check failed:', response.status);
          return;
        }

        const data = await response.json();
        setIsAuthenticated(data.authenticated);
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

const App = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
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

  return (
    <div style={{ display: 'flex' }}>
      <NavBar user={user} onLogout={handleLogout} />
      <Box 
        sx={{
          flexGrow: 1, 
          backgroundColor: 'linear-gradient(135deg, #8B0000, #FF4C4C)', 
          minHeight: '100vh', 
          width: '100vw',
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center'
        }}
      >
        <Routes>
          {/* Public Routes */}
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/aboutus" element={<AboutUs />} />  
          <Route path="/contact" element={<Contact />} />  

          {/* Protected Routes */}
          <Route path="/editor" element={<ProtectedRoute><Editor /></ProtectedRoute>} />
          <Route path="/templates" element={<ProtectedRoute><Template /></ProtectedRoute>} />
          <Route path="/ai-summary" element={<ProtectedRoute><AISummary /></ProtectedRoute>} />
          <Route path="/post-system" element={<ProtectedRoute><PostSystem /></ProtectedRoute>} />
          <Route path="/favourites" element={<ProtectedRoute><Favourites /></ProtectedRoute>} />
          <Route path="/newsletters" element={<ProtectedRoute><Newsletters /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
        </Routes>
      </Box>
    </div>
  );
};

export default App;
