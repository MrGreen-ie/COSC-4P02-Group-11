import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const Favourites = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Favourites
        </Typography>
        <Typography variant="body1">
          Access your saved and favorite content here.
        </Typography>
      </Paper>
    </Box>
  );
};

export default Favourites;
