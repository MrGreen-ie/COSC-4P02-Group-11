import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Box, TextField, Button, Typography, Alert, Paper } from '@mui/material';
import { login } from '../services/api'; // Importing login API call

const Login = () => {
  const navigate = useNavigate(); // Hook for programmatic navigation
  const [formData, setFormData] = useState({ email: '', password: '' }); // Form data state
  const [errors, setErrors] = useState({}); // Validation errors state
  const [serverError, setServerError] = useState(''); // Server error state for failed logins

  // Form validation logic
  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'; // Regex checks for basic email format
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Return true if no errors
  };

  // Handle input field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error message as user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return; // Prevent submission if validation fails

    try {
      const response = await login(formData.email, formData.password); // API call to login
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user)); // Store user data for session management
        navigate('/dashboard'); // Redirect to dashboard after successful login
      }
    } catch (error) {
      setServerError(error.error || 'Login failed. Please try again.'); // Handle server errors
    }
  };

  return (
    <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
        <Typography component="h1" variant="h5" align="center" gutterBottom>
          Sign In
        </Typography>

        {/* Display server-side errors */}
        {serverError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {serverError}
          </Alert>
        )}

        {/* Login Form */}
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
          />
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
            Sign In
          </Button>

          {/* Link to registration page */}
          <Typography align="center">
            Don't have an account?{' '}
            <Link to="/register" style={{ textDecoration: 'none' }}>
              Sign Up
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;
