import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Grid, IconButton, CircularProgress, 
  Alert, Snackbar, Divider, Select, MenuItem, Button, 
  FormControl, InputLabel, FormHelperText, OutlinedInput, Chip,
  Fade, Grow, Skeleton, useMediaQuery, useTheme
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SearchIcon from '@mui/icons-material/Search';
import '../styles/theme.css';
import { 
  getFavoriteSummaries, 
  getSavedSummaries, 
  toggleFavorite, 
  searchNewsArticles, 
  toggleArticleFavorite, 
  getFavoriteArticles
} from '../services/api';
import ArticleCard from '../components/Articles/ArticleCard';
import axios from 'axios';

const AVAILABLE_CATEGORIES = [
  'business', 
  'entertainment', 
  'general', 
  'health', 
  'science', 
  'sports', 
  'technology'
];

const Favourites = () => {
  const [favourites, setFavourites] = useState([]);
  const [recentSummaries, setRecentSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSummary, setExpandedSummary] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [plan, setPlan] = useState('Free'); // Default to 'Free'

  // New state variables for articles
  const [categories, setCategories] = useState([]);
  const [articles, setArticles] = useState([]);
  const [favoriteArticles, setFavoriteArticles] = useState([]);
  const [articleLoading, setArticleLoading] = useState(false);
  const [showArticles, setShowArticles] = useState(false);

  // Get theme for responsive design
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

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
    fetchFavoriteArticles();
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

  const fetchFavoriteArticles = async () => {
    try {
      const response = await getFavoriteArticles();
      setFavoriteArticles(response.favorites || []);
    } catch (err) {
      console.error('Error fetching favorite articles:', err);
      setNotification({
        open: true,
        message: 'Failed to load favorite articles',
        severity: 'error'
      });
    }
  };

  const handleCategoryChange = (event) => {
    const selectedCategories = event.target.value;
    // Limit to maximum 2 categories
    if (selectedCategories.length <= 2) {
      setCategories(selectedCategories);
    }
  };

  const handleSearchArticles = async () => {
    if (categories.length === 0) {
      setNotification({
        open: true,
        message: 'Please select at least one category',
        severity: 'warning'
      });
      return;
    }

    try {
      setArticleLoading(true);
      setShowArticles(true);
      
      // Add loading placeholders
      setArticles(Array(6).fill({ loading: true }));
      
      const response = await searchNewsArticles(categories);
      
      // Update favorite status for articles
      const articlesWithFavoriteStatus = response.articles.map(article => {
        const isFavorite = favoriteArticles.some(fav => fav.uuid === article.uuid);
        return { ...article, is_favorite: isFavorite };
      });
      
      setArticles(articlesWithFavoriteStatus);
    } catch (err) {
      console.error('Error searching articles:', err);
      setNotification({
        open: true,
        message: 'Failed to fetch articles',
        severity: 'error'
      });
      setArticles([]); // Clear loading placeholders on error
    } finally {
      setArticleLoading(false);
    }
  };

  const handleArticleFavoriteToggle = async (article) => {
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
      const response = await toggleArticleFavorite(article);
      
      if (response.success) {
        // Update article in articles list
        setArticles(articles.map(a => 
          a.uuid === article.uuid ? { ...a, is_favorite: response.is_favorite } : a
        ));
        
        // Update favorite articles list
        if (response.is_favorite) {
          setFavoriteArticles([...favoriteArticles, { ...article, is_favorite: true }]);
          setNotification({ 
            open: true, 
            message: 'Added to favourites!', 
            severity: 'success' 
          });
        } else {
          setFavoriteArticles(favoriteArticles.filter(a => a.uuid !== article.uuid));
          setNotification({ 
            open: true, 
            message: 'Removed from favourites!', 
            severity: 'info' 
          });
        }
      }
    } catch (err) {
      console.error('Error toggling article favorite:', err);
      setNotification({ 
        open: true, 
        message: 'Failed to update favourite status.', 
        severity: 'error' 
      });
    }
  };

  const handleSummarizeArticle = (article) => {
    // Store the article URL in localStorage to be used by AISummary
    localStorage.setItem('articleToSummarize', article.url);
    // Navigate to AISummary page
    window.location.href = '/ai-summary';
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
          padding: 'var(--spacing-xl)',
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
          <Skeleton variant="text" height={40} width="50%" sx={{ mb: 4 }} />
          
          <Skeleton variant="rectangular" height={100} sx={{ mb: 4, borderRadius: 'var(--border-radius-md)' }} />
          
          <Skeleton variant="text" height={40} width="50%" sx={{ mb: 2 }} />
          
          <Grid container spacing={3}>
            {[1, 2, 3].map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item}>
                <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 'var(--border-radius-md)' }} />
              </Grid>
            ))}
          </Grid>
          
          <Skeleton variant="text" height={40} width="60%" sx={{ mt: 4, mb: 2 }} />
          
          <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 'var(--border-radius-md)' }} />
        </Paper>
      </Box>
    );
  }

  return (
    <Fade in={true} timeout={800}>
      <Box
        sx={{
          minHeight: '100vh',
          width: '100%',
          background: 'var(--bg-primary)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          padding: isMobile ? 'var(--spacing-md)' : 'var(--spacing-xl)',
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
            elevation={6}
          >
            {notification.message}
          </Alert>
        </Snackbar>

        <Paper
          elevation={6}
          sx={{
            padding: isMobile ? 'var(--spacing-md)' : 'var(--spacing-xl)',
            maxWidth: '900px',
            width: '100%',
            background: 'var(--bg-primary)',
            color: 'var(--text-primary)',
            borderRadius: 'var(--border-radius-lg)',
            boxShadow: 'var(--shadow-lg)',
            transition: 'all 0.3s ease',
          }}
        >
          {/* News Article Selection with improved styling */}
          <Grow in={true} timeout={800}>
            <Box sx={{ padding: 'var(--spacing-md)', mb: 2 }}>
              <Typography 
                variant="h4" 
                className="heading-primary"
                gutterBottom 
                sx={{ 
                  textAlign: 'left', 
                  pl: 'var(--spacing-md)', 
                  pr: 'var(--spacing-md)',
                  position: 'relative',
                  '&:after': {
                    content: '""',
                    position: 'absolute',
                    bottom: -8,
                    left: 'var(--spacing-md)',
                    width: 80,
                    height: 4,
                    backgroundColor: 'var(--primary)',
                    borderRadius: 2
                  }
                }}
              >
                News Articles
              </Typography>
            </Box>
          </Grow>

          <Box sx={{ pl: 'var(--spacing-md)', pr: 'var(--spacing-md)', mb: 4 }}>
            <FormControl sx={{ m: 1, width: '100%' }}>
              <InputLabel id="category-select-label">Categories</InputLabel>
              <Select
                labelId="category-select-label"
                multiple
                value={categories}
                onChange={handleCategoryChange}
                input={<OutlinedInput label="Categories" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip 
                        key={value} 
                        label={value} 
                        sx={{
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            backgroundColor: 'var(--primary-light)',
                            color: 'white',
                          }
                        }}
                      />
                    ))}
                  </Box>
                )}
              >
                {AVAILABLE_CATEGORIES.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>Select up to 2 categories</FormHelperText>
            </FormControl>
            
            <Button
              variant="contained"
              color="primary"
              startIcon={articleLoading ? null : <SearchIcon />}
              onClick={handleSearchArticles}
              disabled={articleLoading}
              sx={{ 
                mt: 2, 
                mb: 2, 
                minWidth: 150,
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 'var(--shadow-md)',
                },
                '&:after': articleLoading ? {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: '100%',
                  height: 3,
                  backgroundColor: 'rgba(255, 255, 255, 0.5)',
                  animation: 'loading 1.5s infinite linear',
                  '@keyframes loading': {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(100%)' }
                  }
                } : {}
              }}
            >
              {articleLoading ? (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                  Searching...
                </Box>
              ) : 'Search Articles'}
            </Button>
          </Box>

          {/* Article Results with improved loading and empty states */}
          {showArticles && (
            <Fade in={true} timeout={800}>
              <Box sx={{ mb: 4 }}>
                {articles.length > 0 ? (
                  <Grid container spacing={3}>
                    {articles.map((article, index) => (
                      <Grow in={true} timeout={(index + 1) * 200} key={article.uuid || index}>
                        <Grid item xs={12} sm={6} md={4}>
                          <ArticleCard 
                            article={article}
                            onToggleFavorite={handleArticleFavoriteToggle}
                            onSummarize={handleSummarizeArticle}
                            loading={article.loading || false}
                          />
                        </Grid>
                      </Grow>
                    ))}
                  </Grid>
                ) : (
                  !articleLoading && (
                    <Fade in={true} timeout={500}>
                      <Paper 
                        elevation={2}
                        sx={{
                          p: 4,
                          mb: 3,
                          backgroundColor: 'var(--bg-secondary)',
                          borderRadius: 'var(--border-radius-lg)',
                          textAlign: 'center',
                          border: '1px dashed var(--border-color)',
                        }}
                      >
                        <SearchIcon sx={{ fontSize: 60, color: 'var(--text-secondary)', mb: 2, opacity: 0.6 }} />
                        <Typography variant="h6" sx={{ mb: 1 }}>No articles found</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Try different categories or try again later
                        </Typography>
                      </Paper>
                    </Fade>
                  )
                )}
              </Box>
            </Fade>
          )}

          <Divider sx={{ my: 4 }} />

          {/* Favorite Articles Section with improved animations and UI */}
          <Grow in={true} timeout={1000}>
            <Box sx={{ padding: 'var(--spacing-md)', mb: 2 }}>
              <Typography 
                variant="h4" 
                className="heading-primary"
                gutterBottom 
                sx={{ 
                  textAlign: 'left', 
                  pl: 'var(--spacing-md)', 
                  pr: 'var(--spacing-md)',
                  position: 'relative',
                  '&:after': {
                    content: '""',
                    position: 'absolute',
                    bottom: -8,
                    left: 'var(--spacing-md)',
                    width: 80,
                    height: 4,
                    backgroundColor: 'var(--primary)',
                    borderRadius: 2
                  }
                }}
              >
                Favorite Articles
              </Typography>
            </Box>
          </Grow>

          <Box sx={{ mb: 4 }}>
            {favoriteArticles.length > 0 ? (
              <Grid container spacing={3}>
                {favoriteArticles.map((article, index) => (
                  <Grow in={true} timeout={(index + 1) * 200} key={article.uuid || index}>
                    <Grid item xs={12} sm={6} md={4}>
                      <ArticleCard 
                        article={article}
                        onToggleFavorite={handleArticleFavoriteToggle}
                        onSummarize={handleSummarizeArticle}
                      />
                    </Grid>
                  </Grow>
                ))}
              </Grid>
            ) : (
              <Fade in={true} timeout={500}>
                <Paper
                  elevation={2}
                  sx={{
                    padding: 'var(--spacing-lg)',
                    mb: 'var(--spacing-md)',
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    borderRadius: 'var(--border-radius-lg)',
                    textAlign: 'center',
                    border: '1px dashed var(--border-color)',
                    p: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <StarBorderIcon sx={{ fontSize: 60, color: 'var(--text-secondary)', mb: 2, opacity: 0.6 }} />
                  <Typography variant="h6">
                    {String(plan).toLowerCase() === 'free'
                      ? 'Limited Access, for Pro only'
                      : 'No favorite articles yet'}
                  </Typography>
                  {String(plan).toLowerCase() !== 'free' && (
                    <Typography variant="body2" className="text-secondary" sx={{ mt: 'var(--spacing-sm)' }}>
                      Star articles to see them here
                    </Typography>
                  )}
                </Paper>
              </Fade>
            )}
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Favourite Summaries section (update the header with consistent styling) */}
          <Grow in={true} timeout={1200}>
            <Box sx={{ padding: 'var(--spacing-md)' }}>
              <Typography 
                variant="h4" 
                className="heading-primary"
                gutterBottom 
                sx={{ 
                  textAlign: 'left', 
                  pl: 'var(--spacing-md)', 
                  pr: 'var(--spacing-md)',
                  position: 'relative',
                  '&:after': {
                    content: '""',
                    position: 'absolute',
                    bottom: -8,
                    left: 'var(--spacing-md)',
                    width: 80,
                    height: 4,
                    backgroundColor: 'var(--primary)',
                    borderRadius: 2
                  }
                }}
              >
                Favorite Summaries
              </Typography>
            </Box>
          </Grow>
          
          {/* Existing Favorites section - keep this part */}
          <Box sx={{ 
            overflowY: 'auto', 
            maxHeight: '400px', 
            mb: 'var(--spacing-xl)', 
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
            
            {/* Display Favourites */}
            {favourites.map((summary) => (
              <Paper
                key={summary.id}
                elevation={2}
                sx={{
                  padding: 'var(--spacing-lg)',
                  mb: 'var(--spacing-md)',
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  borderRadius: 'var(--border-radius-lg)',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Typography 
                    variant="h6" 
                    component="h3" 
                    sx={{ textAlign: 'left', fontWeight: 'bold', flex: 1 }}
                  >
                    {summary.headline}
                  </Typography>
                  <Box>
                    <IconButton 
                      onClick={() => handleFavouriteToggle(summary.id)}
                      sx={{ color: '#FFD700' }} 
                      aria-label="Remove from favorites"
                    >
                      <StarIcon />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleCopyToClipboard(summary.headline, summary.summary)}
                      aria-label="Copy to clipboard"
                    >
                      <ContentCopyIcon />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleExpandSummary(summary.id)}
                      aria-label={expandedSummary === summary.id ? "Collapse summary" : "Expand summary"}
                    >
                      {expandedSummary === summary.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  </Box>
                </Box>
                
                <Box 
                  sx={{ 
                    display: 'flex', 
                    mt: 'var(--spacing-sm)',
                    mb: 'var(--spacing-md)',
                    flexWrap: 'wrap',
                    gap: 'var(--spacing-xs)'
                  }}
                >
                  {summary.tags && summary.tags.split(',').map((tag, index) => (
                    <Chip 
                      key={index} 
                      label={tag.trim()} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                  ))}
                  <Chip 
                    label={summary.tone} 
                    size="small" 
                    color="secondary" 
                    variant="outlined"
                  />
                  <Chip 
                    label={`${summary.length}%`} 
                    size="small" 
                    color="info" 
                    variant="outlined"
                  />
                </Box>
                
                {expandedSummary === summary.id ? (
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      textAlign: 'left', 
                      whiteSpace: 'pre-line',
                      mt: 'var(--spacing-md)'
                    }}
                  >
                    {summary.summary}
                  </Typography>
                ) : (
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      textAlign: 'left', 
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      mb: 'var(--spacing-md)'
                    }}
                  >
                    {summary.summary}
                  </Typography>
                )}
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 'var(--spacing-sm)' }}>
                  <Typography variant="caption" color="text.secondary">
                    Created: {formatDate(summary.created_at)}
                  </Typography>
                </Box>
              </Paper>
            ))}
          </Box>
          
          {/* Recent Summaries Section with improved styling and animations */}
          <Grow in={true} timeout={1400}>
            <Box sx={{ padding: 'var(--spacing-md)' }}>
              <Typography 
                variant="h4" 
                className="heading-primary"
                gutterBottom 
                sx={{ 
                  textAlign: 'left', 
                  pl: 'var(--spacing-md)', 
                  pr: 'var(--spacing-md)',
                  position: 'relative',
                  '&:after': {
                    content: '""',
                    position: 'absolute',
                    bottom: -8,
                    left: 'var(--spacing-md)',
                    width: 80,
                    height: 4,
                    backgroundColor: 'var(--primary)',
                    borderRadius: 2
                  }
                }}
              >
                Recent Summaries
              </Typography>
            </Box>
          </Grow>
          
          <Box sx={{ 
            overflowY: 'auto', 
            maxHeight: '400px', 
            pl: 'var(--spacing-md)', 
            pr: 'var(--spacing-md)' 
          }}>
            {/* Display Recent Summaries with animations */}
            {recentSummaries.length > 0 ? (
              recentSummaries.map((summary, index) => (
                <Fade 
                  in={true} 
                  timeout={500 + (index * 200)} 
                  key={summary.id}
                  style={{ transitionDelay: `${index * 50}ms` }}
                >
                  <Paper
                    elevation={2}
                    sx={{
                      padding: 'var(--spacing-lg)',
                      mb: 'var(--spacing-md)',
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      borderRadius: 'var(--border-radius-lg)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 'var(--shadow-md)',
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography 
                        variant="h6" 
                        component="h3" 
                        sx={{ textAlign: 'left', fontWeight: 'bold', flex: 1 }}
                      >
                        {summary.headline}
                      </Typography>
                      <Box>
                        <IconButton 
                          onClick={() => handleFavouriteToggle(summary.id)}
                          aria-label="Add to favorites"
                          disabled={String(plan).toLowerCase() === 'free'}
                          sx={{
                            transition: 'transform 0.2s ease',
                            '&:hover': {
                              transform: 'scale(1.1)'
                            }
                          }}
                        >
                          <StarBorderIcon />
                        </IconButton>
                        <IconButton 
                          onClick={() => handleCopyToClipboard(summary.headline, summary.summary)}
                          aria-label="Copy to clipboard"
                          sx={{
                            transition: 'transform 0.2s ease',
                            '&:hover': {
                              transform: 'scale(1.1)'
                            }
                          }}
                        >
                          <ContentCopyIcon />
                        </IconButton>
                        <IconButton 
                          onClick={() => handleExpandSummary(summary.id)}
                          aria-label={expandedSummary === summary.id ? "Collapse summary" : "Expand summary"}
                          sx={{
                            transition: 'all 0.3s ease',
                            transform: expandedSummary === summary.id ? 'rotate(180deg)' : 'rotate(0deg)'
                          }}
                        >
                          <ExpandMoreIcon />
                        </IconButton>
                      </Box>
                    </Box>
                    
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        mt: 'var(--spacing-sm)',
                        mb: 'var(--spacing-md)',
                        flexWrap: 'wrap',
                        gap: 'var(--spacing-xs)'
                      }}
                    >
                      {summary.tags && summary.tags.split(',').map((tag, index) => (
                        <Chip 
                          key={index} 
                          label={tag.trim()} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                          sx={{
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              backgroundColor: 'var(--primary-light)',
                              color: 'white',
                            }
                          }}
                        />
                      ))}
                      <Chip 
                        label={summary.tone} 
                        size="small" 
                        color="secondary" 
                        variant="outlined"
                        sx={{
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            backgroundColor: 'var(--secondary-light)',
                            color: 'white',
                          }
                        }}
                      />
                      <Chip 
                        label={`${summary.length}%`} 
                        size="small" 
                        color="info" 
                        variant="outlined"
                        sx={{
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            backgroundColor: 'var(--info-light)',
                            color: 'white',
                          }
                        }}
                      />
                    </Box>
                    
                    <Grow in={expandedSummary === summary.id} timeout={300}>
                      <Box sx={{ display: expandedSummary === summary.id ? 'block' : 'none' }}>
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            textAlign: 'left', 
                            whiteSpace: 'pre-line',
                            mt: 'var(--spacing-md)',
                            p: 2,
                            backgroundColor: 'rgba(0,0,0,0.03)',
                            borderRadius: 'var(--border-radius-md)',
                            borderLeft: '4px solid var(--primary)'
                          }}
                        >
                          {summary.summary}
                        </Typography>
                      </Box>
                    </Grow>
                    
                    {expandedSummary !== summary.id && (
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          textAlign: 'left', 
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          mb: 'var(--spacing-md)'
                        }}
                      >
                        {summary.summary}
                      </Typography>
                    )}
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 'var(--spacing-sm)' }}>
                      <Typography variant="caption" color="text.secondary">
                        Created: {formatDate(summary.created_at)}
                      </Typography>
                    </Box>
                  </Paper>
                </Fade>
              ))
            ) : (
              <Fade in={true} timeout={500}>
                <Paper
                  elevation={2}
                  sx={{
                    padding: 'var(--spacing-lg)',
                    mb: 'var(--spacing-md)',
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    borderRadius: 'var(--border-radius-lg)',
                    textAlign: 'center',
                    border: '1px dashed var(--border-color)',
                    p: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ContentCopyIcon sx={{ fontSize: 60, color: 'var(--text-secondary)', mb: 2, opacity: 0.6 }} />
                  <Typography variant="h6">No recent summaries</Typography>
                  <Typography variant="body2" className="text-secondary" sx={{ mt: 'var(--spacing-sm)' }}>
                    Head to the AI Summary page to create summaries
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    href="/ai-summary"
                    sx={{ 
                      mt: 3,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 'var(--shadow-md)',
                      }
                    }}
                  >
                    Create a Summary
                  </Button>
                </Paper>
              </Fade>
            )}
          </Box>
        </Paper>
      </Box>
    </Fade>
  );
};

export default Favourites;
