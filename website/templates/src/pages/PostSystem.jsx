// Long Tong 's working section
import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const PostSystem = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Post System
        </Typography>
        <Typography variant="body1">
          Schedule and manage your social media posts here.
        </Typography>
      </Paper>
    </Box>
  );
};

export default PostSystem;
