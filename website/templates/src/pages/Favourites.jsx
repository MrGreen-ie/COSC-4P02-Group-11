import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, IconButton, CircularProgress, Alert, Snackbar } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import '../styles/theme.css';
import { getFavoriteSummaries, getSavedSummaries, toggleFavorite } from '../services/api';
import axios from 'axios';

const Favourites = () => {
  const [favourites, setFavourites] = useState([]);
  const [recentSummaries, setRecentSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSummary, setExpandedSummary] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [plan, setPlan] = useState('Free'); // Default to 'Free'

  // Fetch user info to update the plan from the database
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await axios.get('/api/user-info');
        if (response.status === 200) {
          setPlan(response.data.role);
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };

    fetchUserInfo();
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch favorite summaries
      const favoritesResponse = await getFavoriteSummaries();
      setFavourites(favoritesResponse.favorites || []);
      
      // Fetch recent summaries (non-favorites)
      const recentResponse = await getSavedSummaries();
      const recentSummaries = recentResponse.summaries || [];
      
      // Filter out summaries that are already favorites
      const favoriteIds = new Set(favoritesResponse.favorites.map(fav => fav.id));
      const nonFavoriteSummaries = recentSummaries.filter(summary => !favoriteIds.has(summary.id));
      
      // Only show the most recent 3 non-favorite summaries
      setRecentSummaries(nonFavoriteSummaries.slice(0, 3));
      
    } catch (err) {
      console.error('Error fetching summaries:', err);
      setError('Failed to load summaries. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleFavouriteToggle = async (summaryId) => {
    // Only restrict Free users; lift restrictions for Pro or Admin
    if (String(plan).toLowerCase() === 'free') {
      setNotification({
        open: true,
        message: 'Limited Access, for Pro only',
        severity: 'error',
      });
      return;
    }

    try {
      const response = await toggleFavorite(summaryId);
      
      if (response.success) {
        // Update the UI based on the new favorite status
        if (response.is_favorite) {
          // If newly favorited, move it from recent to favourites
          const summaryToMove = recentSummaries.find(s => s.id === summaryId);
          if (summaryToMove) {
            setRecentSummaries(recentSummaries.filter(s => s.id !== summaryId));
            setFavourites([...favourites, { ...summaryToMove, is_favorite: true }]);
          }
          setNotification({ 
            open: true, 
            message: 'Added to favourites!', 
            severity: 'success' 
          });
        } else {
          // If unfavorited, remove from favourites, then add back to recent if needed
          const removedSummary = favourites.find(s => s.id === summaryId);
          setFavourites(favourites.filter(s => s.id !== summaryId));
          
          if (recentSummaries.length < 3 && removedSummary) {
            setRecentSummaries([...recentSummaries, { ...removedSummary, is_favorite: false }]);
          }
          setNotification({ 
            open: true, 
            message: 'Removed from favourites!', 
            severity: 'info' 
          });
        }
      }
    } catch (err) {
      console.error('Error toggling favourite:', err);
      setNotification({ 
        open: true, 
        message: 'Failed to update favourite status.', 
        severity: 'error' 
      });
    }
  };

  const handleExpandSummary = (id) => {
    setExpandedSummary(expandedSummary === id ? null : id);
  };

  const handleCopyToClipboard = (headline, summary) => {
    const textToCopy = `${headline}\n\n${summary}`;
    navigator.clipboard.writeText(textToCopy);
    setNotification({ 
      open: true, 
      message: 'Copied to clipboard!', 
      severity: 'success' 
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          width: '100%',
          background: 'var(--bg-primary)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <CircularProgress color="primary" />
      </Box>
    );
  }

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
      }}
    >
      <Snackbar 
        open={notification.open} 
        autoHideDuration={3000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>

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
          {error && (
            <Alert severity="error" sx={{ mb: 'var(--spacing-md)' }}>
              {error}
            </Alert>
          )}
          
          {/* Empty State Messaging */}
          {!error && favourites.length === 0 && (
            <Paper
              elevation={2}
              sx={{
                padding: 'var(--spacing-lg)',
                mb: 'var(--spacing-md)',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                borderRadius: 'var(--border-radius-lg)',
                textAlign: 'center'
              }}
            >
              <Typography variant="h6">
                {String(plan).toLowerCase() === 'free'
                  ? 'Limited Access, for Pro only'
                  : 'No favourites yet'}
              </Typography>
              {String(plan).toLowerCase() !== 'free' && (
                <Typography variant="body2" className="text-secondary" sx={{ mt: 'var(--spacing-sm)' }}>
                  Star your favourite summaries to see them here
                </Typography>
              )}
            </Paper>
          )}
          
          {favourites.map((summary) => (
            <Paper
              key={summary.id}
              elevation={2}
              sx={{
                padding: 'var(--spacing-md)',
                mb: 'var(--spacing-md)',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                borderRadius: 'var(--border-radius-lg)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'var(--transition-normal)',
                '&:hover': {
                  backgroundColor: 'var(--bg-accent)',
                  transform: 'translateY(-2px)',
                  boxShadow: 'var(--shadow-md)',
                }
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                  <Typography variant="h6" sx={{ textAlign: 'left' }}>
                    {summary.headline}
                  </Typography>
                  <Typography variant="body2" className="text-secondary" sx={{ mt: 'var(--spacing-sm)' }}>
                    Created: {formatDate(summary.created_at)}
                  </Typography>
                </Box>
                <Box>
                  <IconButton 
                    sx={{ 
                      color: 'var(--primary)',
                      transition: 'var(--transition-normal)',
                      '&:hover': {
                        color: 'var(--primary-light)',
                      }
                    }} 
                    onClick={() => handleCopyToClipboard(summary.headline, summary.summary)}
                  >
                    <ContentCopyIcon />
                  </IconButton>
                  <IconButton 
                    sx={{ 
                      color: 'var(--primary)',
                      transition: 'var(--transition-normal)',
                      '&:hover': {
                        color: 'var(--primary-light)',
                      }
                    }} 
                    onClick={() => handleExpandSummary(summary.id)}
                  >
                    {expandedSummary === summary.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                  <IconButton 
                    sx={{ 
                      color: 'var(--primary)',
                      transition: 'var(--transition-normal)',
                      '&:hover': {
                        color: 'var(--primary-light)',
                      }
                    }} 
                    onClick={() => handleFavouriteToggle(summary.id)}
                  >
                    {favourites.some(f => f.id === summary.id) ? <StarIcon /> : <StarBorderIcon />}
                  </IconButton>
                </Box>
              </Box>
              
              {expandedSummary === summary.id && (
                <Box 
                  sx={{ 
                    mt: 'var(--spacing-md)',
                    p: 'var(--spacing-md)',
                    backgroundColor: 'var(--bg-primary)',
                    borderRadius: 'var(--border-radius-md)',
                    textAlign: 'left'
                  }}
                >
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {summary.summary}
                  </Typography>
                  {summary.tags && (
                    <Box sx={{ mt: 'var(--spacing-md)', display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {summary.tags.split(',').map((tag, i) => (
                        <Paper
                          key={i}
                          sx={{
                            display: 'inline-block',
                            px: 'var(--spacing-sm)',
                            py: 'var(--spacing-xs)',
                            backgroundColor: 'var(--primary)',
                            color: 'white',
                            borderRadius: 'var(--border-radius-sm)',
                            fontSize: '0.75rem',
                          }}
                        >
                          {tag.trim()}
                        </Paper>
                      ))}
                    </Box>
                  )}
                </Box>
              )}
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
        {recentSummaries.length === 0 && !loading && (
          <Paper
            elevation={2}
            sx={{
              padding: 'var(--spacing-lg)',
              mb: 'var(--spacing-md)',
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              borderRadius: 'var(--border-radius-lg)',
              textAlign: 'center'
            }}
          >
            <Typography variant="h6">No recent summaries</Typography>
            <Typography variant="body2" className="text-secondary" sx={{ mt: 'var(--spacing-sm)' }}>
              Create summaries in the AI Summary tool to see them here
            </Typography>
          </Paper>
        )}
        <Grid container spacing={3} sx={{ display: 'flex', justifyContent: 'space-between' }}>
          {recentSummaries.map((summary) => (
            <Grid item xs={12} sm={4} key={summary.id}>
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
                  {summary.headline}
                </Typography>
                <Typography variant="body2" className="text-secondary" sx={{ textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                  {summary.summary}
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
                    onClick={() => handleExpandSummary(summary.id)}
                  >
                    View Summary
                  </Typography>
                  <IconButton 
                    sx={{ 
                      color: 'var(--primary)',
                      transition: 'var(--transition-normal)',
                      '&:hover': {
                        color: 'var(--primary-light)',
                      }
                    }} 
                    onClick={() => handleFavouriteToggle(summary.id)}
                  >
                    {favourites.some(f => f.id === summary.id) ? <StarIcon /> : <StarBorderIcon />}
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
