import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const Template = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Templates
        </Typography>
        <Typography variant="body1">
          Create and manage your content templates here.
        </Typography>
      </Paper>
    </Box>
  );
};

export default Template;
