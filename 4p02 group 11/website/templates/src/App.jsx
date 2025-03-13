import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
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
import Pricing from './pages/Pricing';


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
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/editor" element={<Editor />} />
          <Route path="/templates" element={<Template />} />
          <Route path="/ai-summary" element={<AISummary />} />
          <Route path="/post-system" element={<PostSystem />} />
          <Route path="/favourites" element={<Favourites />} />
          <Route path="/newsletters" element={<Newsletters />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </Box>
    </div>
  );
};

export default App;