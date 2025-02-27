// Long Tong 's working section
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  FormControl, 
  FormGroup, 
  FormControlLabel, 
  Checkbox, 
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  Chip, 
  Alert, 
  Snackbar, 
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Divider
} from '@mui/material';
import { 
  Twitter as TwitterIcon, 
  Facebook as FacebookIcon, 
  LinkedIn as LinkedInIcon, 
  Schedule as ScheduleIcon, 
  Send as SendIcon, 
  Delete as DeleteIcon,
  Check as CheckIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Import the TwitterAuth component
import TwitterAuth from '../components/TwitterAuth';

const PostSystem = () => {
  // State for post content
  const [content, setContent] = useState('');
  const [contentError, setContentError] = useState('');
  
  // State for platform selection
  const [platforms, setPlatforms] = useState({
    twitter: false,
    facebook: false,
    linkedin: false
  });
  
  // State for scheduling
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduledTime, setScheduledTime] = useState(new Date());
  
  // State for scheduled posts
  const [scheduledPosts, setScheduledPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // State for alerts
  const [alert, setAlert] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  
  // State for post status dialog
  const [statusDialog, setStatusDialog] = useState({
    open: false,
    title: '',
    content: '',
    results: null
  });

  // State for Twitter authentication
  const [isTwitterAuthenticated, setIsTwitterAuthenticated] = useState(false);

  // Character limits for different platforms
  const characterLimits = {
    twitter: 280,
    facebook: 5000,
    linkedin: 3000
  };

  // Load scheduled posts on component mount
  useEffect(() => {
    fetchScheduledPosts();
  }, []);

  // Fetch scheduled posts from the backend
  const fetchScheduledPosts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/posts/scheduled');
      const data = await response.json();
      
      if (response.ok) {
        setScheduledPosts(data.posts || []);
      } else {
        showAlert(data.error || 'Failed to fetch scheduled posts', 'error');
      }
    } catch (error) {
      showAlert('Error connecting to the server', 'error');
      console.error('Error fetching scheduled posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle platform selection change
  const handlePlatformChange = (event) => {
    // If trying to select Twitter but not authenticated
    if (event.target.name === 'twitter' && event.target.checked && !isTwitterAuthenticated) {
      showAlert('Please connect your Twitter account first', 'warning');
      return;
    }
    
    setPlatforms({
      ...platforms,
      [event.target.name]: event.target.checked
    });
    validateContent(content);
  };

  // Handle content change
  const handleContentChange = (event) => {
    const newContent = event.target.value;
    setContent(newContent);
    validateContent(newContent);
  };

  // Validate content against platform rules
  const validateContent = (text) => {
    const selectedPlatforms = Object.keys(platforms).filter(p => platforms[p]);
    
    if (selectedPlatforms.length === 0) {
      setContentError('');
      return true;
    }
    
    // Check character limits for each selected platform
    const errors = [];
    
    for (const platform of selectedPlatforms) {
      const limit = characterLimits[platform];
      if (text.length > limit) {
        errors.push(`${platform.charAt(0).toUpperCase() + platform.slice(1)} has a ${limit} character limit (${text.length}/${limit})`);
      }
    }
    
    if (errors.length > 0) {
      setContentError(errors.join('. '));
      return false;
    } else {
      setContentError('');
      return true;
    }
  };

  // Handle Twitter authentication status change
  const handleTwitterAuthStatusChange = (status) => {
    setIsTwitterAuthenticated(status);
    
    // If Twitter is deauthenticated, deselect it from platforms
    if (!status && platforms.twitter) {
      setPlatforms({
        ...platforms,
        twitter: false
      });
    }
  };

  // Handle post submission
  const handlePost = async () => {
    // Validate inputs
    if (!validateInputs()) return;
    
    // Check if Twitter is selected but not authenticated
    if (platforms.twitter && !isTwitterAuthenticated) {
      showAlert('Please connect your Twitter account before posting', 'error');
      return;
    }
    
    const selectedPlatforms = Object.keys(platforms).filter(p => platforms[p]);
    
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/posts/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          platforms: selectedPlatforms
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        showAlert('Post published successfully!', 'success');
        setContent('');
        
        // Show detailed results
        setStatusDialog({
          open: true,
          title: 'Post Results',
          content: 'Your post has been processed with the following results:',
          results: data.results
        });
      } else {
        showAlert(data.error || 'Failed to publish post', 'error');
      }
    } catch (error) {
      showAlert('Error connecting to the server', 'error');
      console.error('Error publishing post:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle scheduling a post
  const handleSchedulePost = async () => {
    // Validate inputs
    if (!validateInputs()) return;
    
    // Check if Twitter is selected but not authenticated
    if (platforms.twitter && !isTwitterAuthenticated) {
      showAlert('Please connect your Twitter account before scheduling', 'error');
      return;
    }
    
    const selectedPlatforms = Object.keys(platforms).filter(p => platforms[p]);
    
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/posts/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          platforms: selectedPlatforms,
          scheduled_time: scheduledTime.toISOString()
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        showAlert('Post scheduled successfully!', 'success');
        setContent('');
        setIsScheduling(false);
        fetchScheduledPosts(); // Refresh the list
      } else {
        showAlert(data.error || 'Failed to schedule post', 'error');
      }
    } catch (error) {
      showAlert('Error connecting to the server', 'error');
      console.error('Error scheduling post:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle deleting a scheduled post
  const handleDeleteScheduledPost = async (postId) => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/posts/scheduled/${postId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        showAlert('Post deleted successfully!', 'success');
        fetchScheduledPosts(); // Refresh the list
      } else {
        const data = await response.json();
        showAlert(data.error || 'Failed to delete post', 'error');
      }
    } catch (error) {
      showAlert('Error connecting to the server', 'error');
      console.error('Error deleting post:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Validate all inputs before submission
  const validateInputs = () => {
    // Check if content is provided
    if (!content.trim()) {
      showAlert('Please enter some content for your post', 'error');
      return false;
    }
    
    // Check if at least one platform is selected
    const selectedPlatforms = Object.keys(platforms).filter(p => platforms[p]);
    if (selectedPlatforms.length === 0) {
      showAlert('Please select at least one platform', 'error');
      return false;
    }
    
    // Validate content against platform rules
    if (!validateContent(content)) {
      showAlert(contentError, 'error');
      return false;
    }
    
    return true;
  };

  // Show alert message
  const showAlert = (message, severity = 'info') => {
    setAlert({
      open: true,
      message,
      severity
    });
  };

  // Handle closing the alert
  const handleCloseAlert = () => {
    setAlert({
      ...alert,
      open: false
    });
  };

  // Handle closing the status dialog
  const handleCloseStatusDialog = () => {
    setStatusDialog({
      ...statusDialog,
      open: false
    });
  };

  // Get platform icon
  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'twitter':
        return <TwitterIcon />;
      case 'facebook':
        return <FacebookIcon />;
      case 'linkedin':
        return <LinkedInIcon />;
      default:
        return null;
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Twitter Authentication Section */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <TwitterAuth onAuthStatusChange={handleTwitterAuthStatusChange} />
      </Paper>
      
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Social Media Post System
        </Typography>
        <Typography variant="body1" gutterBottom>
          Create, schedule, and manage your social media posts across multiple platforms.
        </Typography>
        
        {/* Content input */}
        <TextField
          label="Post Content"
          multiline
          rows={4}
          value={content}
          onChange={handleContentChange}
          fullWidth
          margin="normal"
          error={!!contentError}
          helperText={contentError}
        />
        
        {/* Platform selection */}
        <FormControl component="fieldset" sx={{ mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Select Platforms
          </Typography>
          <FormGroup row>
            <FormControlLabel
              control={
                <Checkbox 
                  checked={platforms.twitter}
                  onChange={handlePlatformChange}
                  name="twitter"
                  color="primary"
                  icon={<TwitterIcon />}
                  checkedIcon={<TwitterIcon />}
                  disabled={!isTwitterAuthenticated}
                />
              }
              label={
                <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                  Twitter
                  {!isTwitterAuthenticated && (
                    <Typography variant="caption" color="error" sx={{ ml: 1 }}>
                      (Authentication required)
                    </Typography>
                  )}
                </Box>
              }
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={platforms.facebook}
                  onChange={handlePlatformChange}
                  name="facebook"
                  color="primary"
                  icon={<FacebookIcon />}
                  checkedIcon={<FacebookIcon />}
                  disabled
                />
              }
              label="Facebook (Coming soon)"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={platforms.linkedin}
                  onChange={handlePlatformChange}
                  name="linkedin"
                  color="primary"
                  icon={<LinkedInIcon />}
                  checkedIcon={<LinkedInIcon />}
                  disabled
                />
              }
              label="LinkedIn (Coming soon)"
            />
          </FormGroup>
        </FormControl>
        
        {/* Action buttons */}
        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SendIcon />}
            onClick={handlePost}
            disabled={isLoading || (platforms.twitter && !isTwitterAuthenticated)}
          >
            Post Now
          </Button>
          
          {isScheduling ? (
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <DateTimePicker
                  label="Schedule Time"
                  value={scheduledTime}
                  onChange={(newValue) => setScheduledTime(newValue)}
                  minDateTime={new Date()}
                  slotProps={{ textField: { size: 'small' } }}
                />
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleSchedulePost}
                  disabled={isLoading || (platforms.twitter && !isTwitterAuthenticated)}
                >
                  Schedule
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setIsScheduling(false)}
                >
                  Cancel
                </Button>
              </Box>
            </LocalizationProvider>
          ) : (
            <Button
              variant="outlined"
              startIcon={<ScheduleIcon />}
              onClick={() => setIsScheduling(true)}
              disabled={isLoading || (platforms.twitter && !isTwitterAuthenticated)}
            >
              Schedule for Later
            </Button>
          )}
        </Box>
        
        {isLoading && <LinearProgress sx={{ mt: 2 }} />}
      </Paper>
      
      {/* Scheduled Posts */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Scheduled Posts
        </Typography>
        
        {isLoading ? (
          <LinearProgress />
        ) : scheduledPosts.length > 0 ? (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {scheduledPosts.map((post) => (
              <Grid item xs={12} md={6} key={post.id}>
                <Card>
                  <CardContent>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {post.content}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      {post.platforms.map((platform) => (
                        <Chip
                          key={platform}
                          icon={getPlatformIcon(platform)}
                          label={platform.charAt(0).toUpperCase() + platform.slice(1)}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                    
                    <Typography variant="caption" color="text.secondary">
                      Scheduled for: {formatDate(post.scheduled_time)}
                    </Typography>
                    
                    {post.status !== 'scheduled' && (
                      <Box sx={{ mt: 1 }}>
                        <Chip
                          icon={post.status === 'posted' ? <CheckIcon /> : <ErrorIcon />}
                          label={post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                          color={post.status === 'posted' ? 'success' : 'error'}
                          size="small"
                        />
                        {post.error_message && (
                          <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
                            {post.error_message}
                          </Typography>
                        )}
                      </Box>
                    )}
                  </CardContent>
                  <CardActions>
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => handleDeleteScheduledPost(post.id)}
                      disabled={isLoading}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No scheduled posts yet. Use the form above to schedule your first post.
          </Typography>
        )}
      </Paper>
      
      {/* Alert Snackbar */}
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseAlert} severity={alert.severity} sx={{ width: '100%' }}>
          {alert.message}
        </Alert>
      </Snackbar>
      
      {/* Status Dialog */}
      <Dialog open={statusDialog.open} onClose={handleCloseStatusDialog} maxWidth="md">
        <DialogTitle>{statusDialog.title}</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            {statusDialog.content}
          </Typography>
          
          {statusDialog.results && (
            <Box sx={{ mt: 2 }}>
              {Object.entries(statusDialog.results).map(([platform, result]) => (
                <Paper key={platform} sx={{ p: 2, mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    {getPlatformIcon(platform)}
                    <Typography variant="subtitle1">
                      {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </Typography>
                    <Chip
                      label={result.success ? 'Success' : 'Failed'}
                      color={result.success ? 'success' : 'error'}
                      size="small"
                      sx={{ ml: 'auto' }}
                    />
                  </Box>
                  
                  {result.success ? (
                    <Typography variant="body2" component="div">
                      Post ID: {result.post_id}
                      <br />
                      <a href={result.url} target="_blank" rel="noopener noreferrer">
                        View Post
                      </a>
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="error">
                      Error: {result.error}
                    </Typography>
                  )}
                </Paper>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStatusDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PostSystem;
