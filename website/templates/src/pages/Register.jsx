import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Box, TextField, Button, Typography, Alert, Paper, Grid } from '@mui/material';
import { register, login } from '../services/api';

const Register = ({ onLogin }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      console.log('Starting registration process...');
      console.log('Form data:', formData);
      setServerError('');
      setErrors({});
      
      console.log('Calling register API...');
      const registerResponse = await register(
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName
      );
      console.log('Register API response:', registerResponse);

      if (registerResponse.message) {
        try {
          console.log('Registration successful, attempting login...');
          const loginResponse = await login(formData.email, formData.password);
          console.log('Login response:', loginResponse);
          
          if (loginResponse.user) {
            // Store user data in localStorage
            localStorage.setItem('user', JSON.stringify(loginResponse.user));
            if (loginResponse.token) {
              localStorage.setItem('token', loginResponse.token);
            }
            
            // Update parent component's user state
            if (onLogin) {
              onLogin(loginResponse.user);
            }
            
            // Navigate to home page
            navigate('/', { replace: true });
          }
        } catch (loginError) {
          console.error('Login after registration failed:', loginError);
          setServerError('Registration successful! Redirecting to login...');
          setTimeout(() => navigate('/login', { replace: true }), 2000);
        }
      }
    } catch (error) {
      if (error.error === 'Email already exists') {
        setServerError('This email is already registered. Please use a different email or try logging in.');
        setErrors((prev) => ({ ...prev, email: 'Email already exists' }));
      } else if (error.errors) {
        setErrors((prev) => ({ ...prev, ...error.errors }));
        setServerError('Please check your information and try again.');
      } else {
        setServerError(error.error || 'An unexpected error occurred. Please try again.');
      }
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
          Sign Up
        </Typography>

        {serverError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {serverError}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                id="firstName"
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                error={!!errors.firstName}
                helperText={errors.firstName}
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
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                id="lastName"
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                error={!!errors.lastName}
                helperText={errors.lastName}
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
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                id="email"
                label="Email Address"
                name="email"
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
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                name="password"
                label="Password"
                type="password"
                id="password"
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
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
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
            </Grid>
          </Grid>
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
              borderRadius: '30px',
              '&:hover': { background: '#fff', color: '#8B0000' },
            }}
          >
            Sign Up
          </Button>

          <Typography sx={{ color: 'white' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#ffdd57', fontWeight: 'bold', textDecoration: 'none' }}>
              Sign In
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Register;
