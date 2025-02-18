import React from 'react';
import {
  Box,
  Container,
  Typography,
} from '@mui/material';

function Home() {
  return (
    <Box 
      sx={{ 
        display: 'flex',
        minHeight: '100vh',
      }}
    >
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          marginLeft: '240px', // Match the width of the expanded NavBar
        }}
      >
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Typography variant="h4" gutterBottom>
            Welcome to Your Dashboard
          </Typography>
          {/* Add your main content here */}
        </Container>
      </Box>
    </Box>
  );
}

export default Home;
