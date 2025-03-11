import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Paper,
} from '@mui/material';
import { login } from '../services/api';

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await login(formData.email, formData.password);
      if (onLogin) onLogin(response.user);
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Login error:', error);
      setServerError(error.message || 'An error occurred during login');
    }
  };

  return (
    <Box
      sx={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #8B0000, #FF4C4C)',
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 400,
          borderRadius: '15px',
          textAlign: 'center',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          color: 'white',
        }}
      >
        <Typography component="h1" variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'white' }}>
          Sign In
        </Typography>

        {serverError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {serverError}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={formData.email}
            onChange={handleChange}
            error={!!errors.email}
            helperText={errors.email}
            sx={{
              input: { color: 'white' },
              '& label': { color: 'white' },
              '& label.Mui-focused': { color: 'white' },
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: 'white' },
                '&:hover fieldset': { borderColor: '#ffdd57' },
                '&.Mui-focused fieldset': { borderColor: '#ffdd57' },
              },
            }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
            error={!!errors.password}
            helperText={errors.password}
            sx={{
              input: { color: 'white' },
              '& label': { color: 'white' },
              '& label.Mui-focused': { color: 'white' },
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: 'white' },
                '&:hover fieldset': { borderColor: '#ffdd57' },
                '&.Mui-focused fieldset': { borderColor: '#ffdd57' },
              },
            }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              mt: 3,
              mb: 2,
              background: 'linear-gradient(135deg, #ffdd57, #FFD700)',
              color: '#8B0000',
              fontWeight: 'bold',
              borderRadius: '30px', // Makes the button more rounded
              '&:hover': { background: '#fff', color: '#8B0000' },
            }}
          >
            Sign In
          </Button>

          <Typography sx={{ color: 'white' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#ffdd57', fontWeight: 'bold', textDecoration: 'none' }}>
              Sign Up
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;
