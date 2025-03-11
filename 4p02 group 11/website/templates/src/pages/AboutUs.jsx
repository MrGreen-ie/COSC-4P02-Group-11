import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';

const AboutUs = () => {
  return (
    <Box
      sx={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #8B0000, #FF4C4C)',
        textAlign: 'center',
        padding: 2,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 4,
          maxWidth: 600,
          borderRadius: '15px',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          color: 'white',
        }}
      >
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          About Us
        </Typography>
        <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
          Welcome to <strong>Our Platform</strong>, where innovation meets excellence. Our mission is to provide top-tier
          solutions that empower individuals and businesses to achieve their goals.
        </Typography>
        <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
          We believe in <strong>quality, integrity, and customer satisfaction</strong>. Our team of experts is dedicated
          to creating seamless experiences tailored to your needs.
        </Typography>
        <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
          Join us on this journey as we continue to innovate and redefine the future.
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#FFD700', mt: 2 }}>
          "Empowering Dreams, One Step at a Time"
        </Typography>
      </Paper>
    </Box>
  );
};

export default AboutUs;
