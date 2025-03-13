import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, IconButton } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';

const Favourites = () => {
  const [favourites, setFavourites] = useState([]);

  const handleFavouriteToggle = (summaryId) => {
    setFavourites((prevFavourites) => {
      if (prevFavourites.includes(summaryId)) {
        return prevFavourites.filter(id => id !== summaryId); // Remove from favourites
      } else {
        return [...prevFavourites, summaryId]; // Add to favourites
      }
    });
  };

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
        overflowY: 'auto',
        position: 'sticky',        
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
        {/* Favourites Section */}
        <Box sx={{ padding: 2 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ textAlign: 'left', pl: 2, pr: 2 }}>
            Favourites
          </Typography>
        </Box>
        <Box sx={{ overflowY: 'auto', maxHeight: '400px', mb: 4, pl: 2, pr: 2 }}>
          {favourites.map((summaryId, index) => (
            <Paper
              key={index}
              elevation={2}
              sx={{
                padding: 2,
                mb: 2,
                backgroundColor: '#C44040',
                color: 'white',
                borderRadius: '15px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" sx={{ textAlign: 'left' }}>
                  {summaryId === 'article-1' ? 'Understanding Artificial Intelligence: A Beginner’s Guide' : 
                  summaryId === 'article-2' ? 'The Future of Web Development in 2025' : 
                  'Best Practices for Python Programming'}
                </Typography>
                <Typography variant="body2" sx={{ textAlign: 'left', mt: 1 }}>URL:</Typography>
              </Box>
              <IconButton sx={{ color: 'white' }} onClick={() => handleFavouriteToggle(summaryId)}>
                <StarIcon />
              </IconButton>
            </Paper>
          ))}
        </Box>

        {/* Recent Summaries Section */}
        <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ textAlign: 'left', pl: 2, pr: 2 }}>
          Recent Summaries
        </Typography>
        <Grid container spacing={3} sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Grid item xs={12} sm={4} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Paper
              elevation={2}
              sx={{
                padding: 2,
                mb: 2,
                backgroundColor: '#C44040',
                color: 'white',
                borderRadius: '15px',
                height: '200px', // Fixed height for uniformity
              }}
            >
              <Typography variant="h6" fontWeight="bold" sx={{ textAlign: 'left' }}>
                Understanding Artificial Intelligence: A Beginner’s Guide
              </Typography>
              <Typography variant="body2" sx={{ textAlign: 'left' }}>
                An introduction to AI concepts, machine learning, and their real-world applications.
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => handleFavouriteToggle('article-1')}>Read Me</Typography>
                <IconButton sx={{ color: 'white' }} onClick={() => handleFavouriteToggle('article-1')}>
                  {favourites.includes('article-1') ? <StarIcon /> : <StarBorderIcon />}
                </IconButton>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Paper
              elevation={2}
              sx={{
                padding: 2,
                mb: 2,
                backgroundColor: '#C44040',
                color: 'white',
                borderRadius: '15px',
                height: '200px', // Fixed height for uniformity
              }}
            >
              <Typography variant="h6" fontWeight="bold" sx={{ textAlign: 'left' }}>
                The Future of Web Development in 2025
              </Typography>
              <Typography variant="body2" sx={{ textAlign: 'left' }}>
                Exploring emerging trends in web development, including WebAssembly and edge computing.
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => handleFavouriteToggle('article-2')}>Read Me</Typography>
                <IconButton sx={{ color: 'white' }} onClick={() => handleFavouriteToggle('article-2')}>
                  {favourites.includes('article-2') ? <StarIcon /> : <StarBorderIcon />}
                </IconButton>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Paper
              elevation={2}
              sx={{
                padding: 2,
                mb: 2,
                backgroundColor: '#C44040',
                color: 'white',
                borderRadius: '15px',
                height: '200px', // Fixed height for uniformity
              }}
            >
              <Typography variant="h6" fontWeight="bold" sx={{ textAlign: 'left' }}>
                Best Practices for Python Programming
              </Typography>
              <Typography variant="body2" sx={{ textAlign: 'left' }}>
                Essential tips and tricks for writing clean, efficient Python code.
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => handleFavouriteToggle('article-3')}>Read Me</Typography>
                <IconButton sx={{ color: 'white' }} onClick={() => handleFavouriteToggle('article-3')}>
                  {favourites.includes('article-3') ? <StarIcon /> : <StarBorderIcon />}
                </IconButton>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default Favourites;
