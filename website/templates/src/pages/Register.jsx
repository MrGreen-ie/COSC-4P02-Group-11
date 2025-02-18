import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Box, TextField, Button, Typography, Alert, Paper, Grid } from '@mui/material';
import { register, login } from '../services/api'; // Import both register and login API calls

const Register = ({ onLogin }) => { // Add onLogin prop
  const navigate = useNavigate(); // Hook for programmatic navigation
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  }); // Form data state

  const [errors, setErrors] = useState({}); // Validation errors state
  const [serverError, setServerError] = useState(''); // Server error state for failed registrations

  // Form validation logic
  const validateForm = () => {
    const newErrors = {};

    // First name validation
    if (!formData.firstName) {
      newErrors.firstName = 'First name is required';
    }

    // Last name validation
    if (!formData.lastName) {
      newErrors.lastName = 'Last name is required';
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
    if (!validateForm()) return;

    try {
      setServerError(''); // Clear any previous errors
      setErrors({}); // Clear any field errors
      console.log('Submitting registration form...');
      
      // Register the user
      const registerResponse = await register(
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName
      );

      console.log('Registration response:', registerResponse);

      if (registerResponse.message) {
        console.log('Registration successful, attempting auto-login...');
        try {
          // Automatically log in after successful registration
          const loginResponse = await login(formData.email, formData.password);
          console.log('Login response:', loginResponse);
          
          if (loginResponse.user) {
            console.log('Login successful, updating state and redirecting...');
            
            // Update authentication state
            onLogin(loginResponse.user);
            
            // Redirect to dashboard immediately
            navigate('/', { replace: true });
          }
        } catch (loginError) {
          console.error('Auto-login failed:', loginError);
          setServerError('Registration successful! Redirecting to login...');
          setTimeout(() => {
            console.log('Redirecting to login page...');
            navigate('/login', { replace: true });
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Registration/Login error:', error);
      
      // Handle email exists error
      if (error.error === 'Email already exists') {
        setServerError('This email is already registered. Please use a different email or try logging in.');
        setErrors(prev => ({
          ...prev,
          email: 'Email already exists'
        }));
        return;
      }
      
      // Handle validation errors
      if (error.errors) {
        setErrors(prev => ({
          ...prev,
          ...error.errors
        }));
        setServerError('Please check your information and try again.');
        return;
      }
      
      // Handle other errors
      setServerError(error.error || 'An unexpected error occurred. Please try again.');
    }
  };

  return (
    <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Paper elevation={3} sx={{ p: 4, maxWidth: 400, width: '100%' }}>
        <Typography component="h1" variant="h5" align="center" gutterBottom>
          Create Account
        </Typography>

        {serverError && (
          <Alert 
            severity="error" 
            sx={{ mb: 2 }}
            action={
              serverError.includes('already registered') && (
                <Button
                  component={Link}
                  to="/login"
                  size="small"
                  color="inherit"
                >
                  Go to Login
                </Button>
              )
            }
          >
            {serverError}
          </Alert>
        )}

        {/* Registration Form */}
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="firstName"
                label="First Name"
                name="firstName"
                autoComplete="given-name"
                value={formData.firstName}
                onChange={handleChange}
                error={!!errors.firstName}
                helperText={errors.firstName}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="lastName"
                label="Last Name"
                name="lastName"
                autoComplete="family-name"
                value={formData.lastName}
                onChange={handleChange}
                error={!!errors.lastName}
                helperText={errors.lastName}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                id="confirmPassword"
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
              />
            </Grid>
          </Grid>

          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
            Sign Up
          </Button>

          {/* Link to login page */}
          <Typography align="center">
            Already have an account?{' '}
            <Link to="/login" style={{ textDecoration: 'none' }}>
              Sign In
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Register;
