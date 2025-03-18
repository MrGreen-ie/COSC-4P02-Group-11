import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, IconButton } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import '../styles/theme.css';

const Favourites = () => {
  const [favourites, setFavourites] = useState([]);

  const handleFavouriteToggle = (summaryId) => {
    setFavourites((prevFavourites) => {
      if (prevFavourites.includes(summaryId)) {
        return prevFavourites.filter(id => id !== summaryId);
      } else {
        return [...prevFavourites, summaryId];
      }
    });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        background: 'var(--bg-primary)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: 'var(--spacing-xl)',
        overflowY: 'auto',
        position: 'sticky',        
      }}
    >
      <Paper
        elevation={6}
        sx={{
          padding: 'var(--spacing-xl)',
          maxWidth: '900px',
          width: '100%',
          background: 'var(--bg-primary)',
          color: 'var(--text-primary)',
          borderRadius: 'var(--border-radius-lg)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        {/* Favourites Section */}
        <Box sx={{ padding: 'var(--spacing-md)' }}>
          <Typography 
            variant="h4" 
            className="heading-primary"
            gutterBottom 
            sx={{ 
              textAlign: 'left', 
              pl: 'var(--spacing-md)', 
              pr: 'var(--spacing-md)' 
            }}
          >
            Favourites
          </Typography>
        </Box>
        <Box sx={{ 
          overflowY: 'auto', 
          maxHeight: '400px', 
          mb: 'var(--spacing-xl)', 
          pl: 'var(--spacing-md)', 
          pr: 'var(--spacing-md)' 
        }}>
          {favourites.map((summaryId, index) => (
            <Paper
              key={index}
              elevation={2}
              sx={{
                padding: 'var(--spacing-md)',
                mb: 'var(--spacing-md)',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                borderRadius: 'var(--border-radius-lg)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'var(--transition-normal)',
                '&:hover': {
                  backgroundColor: 'var(--bg-accent)',
                  transform: 'translateY(-2px)',
                  boxShadow: 'var(--shadow-md)',
                }
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" sx={{ textAlign: 'left' }}>
                  {summaryId === 'article-1' ? "Understanding Artificial Intelligence: A Beginner's Guide" : 
                  summaryId === 'article-2' ? 'The Future of Web Development in 2025' : 
                  'Best Practices for Python Programming'}
                </Typography>
                <Typography variant="body2" className="text-secondary" sx={{ textAlign: 'left', mt: 'var(--spacing-sm)' }}>URL:</Typography>
              </Box>
              <IconButton 
                sx={{ 
                  color: 'var(--primary)',
                  transition: 'var(--transition-normal)',
                  '&:hover': {
                    color: 'var(--primary-light)',
                  }
                }} 
                onClick={() => handleFavouriteToggle(summaryId)}
              >
                <StarIcon />
              </IconButton>
            </Paper>
          ))}
        </Box>

        {/* Recent Summaries Section */}
        <Typography 
          variant="h4" 
          className="heading-primary"
          gutterBottom 
          sx={{ 
            textAlign: 'left', 
            pl: 'var(--spacing-md)', 
            pr: 'var(--spacing-md)' 
          }}
        >
          Recent Summaries
        </Typography>
        <Grid container spacing={3} sx={{ display: 'flex', justifyContent: 'space-between' }}>
          {['article-1', 'article-2', 'article-3'].map((articleId, index) => (
            <Grid item xs={12} sm={4} key={articleId}>
              <Paper
                elevation={2}
                sx={{
                  padding: 'var(--spacing-md)',
                  mb: 'var(--spacing-md)',
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  borderRadius: 'var(--border-radius-lg)',
                  height: '200px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'var(--transition-normal)',
                  '&:hover': {
                    backgroundColor: 'var(--bg-accent)',
                    transform: 'translateY(-2px)',
                    boxShadow: 'var(--shadow-md)',
                  }
                }}
              >
                <Typography variant="h6" fontWeight="var(--font-weight-bold)" sx={{ textAlign: 'left' }}>
                  {articleId === 'article-1' ? "Understanding Artificial Intelligence: A Beginner's Guide" :
                   articleId === 'article-2' ? 'The Future of Web Development in 2025' :
                   'Best Practices for Python Programming'}
                </Typography>
                <Typography variant="body2" className="text-secondary" sx={{ textAlign: 'left' }}>
                  {articleId === 'article-1' ? 'An introduction to AI concepts, machine learning, and their real-world applications.' :
                   articleId === 'article-2' ? 'Exploring emerging trends in web development, including WebAssembly and edge computing.' :
                   'Essential tips and tricks for writing clean, efficient Python code.'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'var(--primary)', 
                      fontWeight: 'var(--font-weight-bold)', 
                      cursor: 'pointer',
                      '&:hover': {
                        color: 'var(--primary-light)',
                      }
                    }} 
                    onClick={() => handleFavouriteToggle(articleId)}
                  >
                    Read Me
                  </Typography>
                  <IconButton 
                    sx={{ 
                      color: 'var(--primary)',
                      transition: 'var(--transition-normal)',
                      '&:hover': {
                        color: 'var(--primary-light)',
                      }
                    }} 
                    onClick={() => handleFavouriteToggle(articleId)}
                  >
                    {favourites.includes(articleId) ? <StarIcon /> : <StarBorderIcon />}
                  </IconButton>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
};

export default Favourites;
