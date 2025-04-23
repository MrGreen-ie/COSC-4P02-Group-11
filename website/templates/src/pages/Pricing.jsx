import React from 'react';
import { Box, Typography, Button, Paper, Grid } from '@mui/material';
import TranslatedText from '../components/TranslatedText';

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
          <TranslatedText>Choose Your Plan</TranslatedText>
        </Typography>
        <Typography variant="body1" sx={{ mb: 4 }}>
          <TranslatedText>Find the perfect plan that fits your needs.</TranslatedText>
        </Typography>
        
        <Grid container spacing={3} justifyContent="center">
          {/* Basic Plan */}
          <Grid item xs={12} sm={4}>
            <Paper sx={{ padding: 3, backgroundColor: '#8B0000', color: 'white', borderRadius: '15px' }}>
              <Typography variant="h6" fontWeight="bold"><TranslatedText>Basic</TranslatedText></Typography>
              <Typography variant="h4" fontWeight="bold">$5</Typography>
              <Typography><TranslatedText>30 Summarizations/month</TranslatedText></Typography>
              <Typography><TranslatedText>100 Newsletters</TranslatedText></Typography>
              <Typography><TranslatedText>100 Social Media Posts</TranslatedText></Typography>
              <Button variant="contained" sx={{ mt: 2, backgroundColor: '#FFD700', color: 'black' }}>
                <TranslatedText>Choose Plan</TranslatedText>
              </Button>
            </Paper>
          </Grid>

          {/* Pro (Preferred) Plan */}
          <Grid item xs={12} sm={4}>
            <Paper sx={{ padding: 3, backgroundColor: '#B22222', color: 'white', borderRadius: '15px', border: '3px solid #FFD700' }}>
              <Typography variant="h6" fontWeight="bold" color="#FFD700"><TranslatedText>Pro (Preferred)</TranslatedText></Typography>
              <Typography variant="h4" fontWeight="bold">$10</Typography>
              <Typography><TranslatedText>100 Summarizations/month</TranslatedText></Typography>
              <Typography><TranslatedText>200 Newsletters</TranslatedText></Typography>
              <Typography><TranslatedText>200 Social Media Posts</TranslatedText></Typography>
              <Button variant="contained" sx={{ mt: 2, backgroundColor: '#FFD700', color: 'black' }}>
                <TranslatedText>Choose Plan</TranslatedText>
              </Button>
            </Paper>
          </Grid>

          {/* Unlimited Plan */}
          <Grid item xs={12} sm={4}>
            <Paper sx={{ padding: 3, backgroundColor: '#8B0000', color: 'white', borderRadius: '15px' }}>
              <Typography variant="h6" fontWeight="bold"><TranslatedText>Unlimited</TranslatedText></Typography>
              <Typography variant="h4" fontWeight="bold">$15</Typography>
              <Typography><TranslatedText>Unlimited Summarizations</TranslatedText></Typography>
              <Typography><TranslatedText>Unlimited Newsletters</TranslatedText></Typography>
              <Typography><TranslatedText>Unlimited Social Media Posts</TranslatedText></Typography>
              <Button variant="contained" sx={{ mt: 2, backgroundColor: '#FFD700', color: 'black' }}>
                <TranslatedText>Choose Plan</TranslatedText>
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default Pricing;
