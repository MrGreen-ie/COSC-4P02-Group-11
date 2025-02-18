import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const AISummary = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          AI Summary
        </Typography>
        <Typography variant="body1">
          View AI-generated summaries of your content here.
        </Typography>
      </Paper>
    </Box>
  );
};

export default AISummary;
