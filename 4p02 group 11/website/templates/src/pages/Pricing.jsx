import React from 'react';
import { Box, Typography, Button, Paper, Grid } from '@mui/material';

const Pricing = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        background: 'linear-gradient(135deg, #8B0000, #FF4C4C)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: 3,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          padding: 4,
          maxWidth: 900,
          width: '100%',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          color: 'white',
          borderRadius: '15px',
        }}
      >
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Choose Your Plan
        </Typography>
        <Typography variant="body1" sx={{ mb: 4 }}>
          Find the perfect plan that fits your needs.
        </Typography>
        
        <Grid container spacing={3} justifyContent="center">
          {/* Basic Plan */}
          <Grid item xs={12} sm={4}>
            <Paper sx={{ padding: 3, backgroundColor: '#8B0000', color: 'white', borderRadius: '15px' }}>
              <Typography variant="h6" fontWeight="bold">Basic</Typography>
              <Typography variant="h4" fontWeight="bold">$5</Typography>
              <Typography>30 Summarizations/month</Typography>
              <Typography>100 Newsletters</Typography>
              <Typography>100 Social Media Posts</Typography>
              <Button variant="contained" sx={{ mt: 2, backgroundColor: '#FFD700', color: 'black' }}>
                Choose Plan
              </Button>
            </Paper>
          </Grid>

          {/* Pro (Preferred) Plan */}
          <Grid item xs={12} sm={4}>
            <Paper sx={{ padding: 3, backgroundColor: '#B22222', color: 'white', borderRadius: '15px', border: '3px solid #FFD700' }}>
              <Typography variant="h6" fontWeight="bold" color="#FFD700">Pro (Preferred)</Typography>
              <Typography variant="h4" fontWeight="bold">$10</Typography>
              <Typography>100 Summarizations/month</Typography>
              <Typography>200 Newsletters</Typography>
              <Typography>200 Social Media Posts</Typography>
              <Button variant="contained" sx={{ mt: 2, backgroundColor: '#FFD700', color: 'black' }}>
                Choose Plan
              </Button>
            </Paper>
          </Grid>

          {/* Unlimited Plan */}
          <Grid item xs={12} sm={4}>
            <Paper sx={{ padding: 3, backgroundColor: '#8B0000', color: 'white', borderRadius: '15px' }}>
              <Typography variant="h6" fontWeight="bold">Unlimited</Typography>
              <Typography variant="h4" fontWeight="bold">$15</Typography>
              <Typography>Unlimited Summarizations</Typography>
              <Typography>Unlimited Newsletters</Typography>
              <Typography>Unlimited Social Media Posts</Typography>
              <Button variant="contained" sx={{ mt: 2, backgroundColor: '#FFD700', color: 'black' }}>
                Choose Plan
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default Pricing;
