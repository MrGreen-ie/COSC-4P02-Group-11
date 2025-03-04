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
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Stack,
  CardMedia
} from '@mui/material';
import { 
  Twitter as TwitterIcon, 
  Facebook as FacebookIcon, 
  LinkedIn as LinkedInIcon, 
  Schedule as ScheduleIcon, 
  Send as SendIcon, 
  Delete as DeleteIcon,
  Check as CheckIcon,
  Error as ErrorIcon,
  AttachFile as AttachFileIcon,
  Image as ImageIcon,
  Description as DocumentIcon,
  Clear as ClearIcon
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
  const [twitterCredentials, setTwitterCredentials] = useState(null);

  // State for media attachments
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaError, setMediaError] = useState('');
  
  // File input reference
  const fileInputRef = React.useRef(null);

  // Character limits for different platforms
  const characterLimits = {
    twitter: 280,
    facebook: 5000,
    linkedin: 3000
  };

  // Media limits for different platforms
  const mediaLimits = {
    twitter: {
      count: 4,
      size: 5 * 1024 * 1024, // 5MB
      types: ['image/jpeg', 'image/png', 'image/gif', 'video/mp4']
    },
    facebook: {
      count: 10,
      size: 25 * 1024 * 1024, // 25MB
      types: ['image/jpeg', 'image/png', 'image/gif', 'video/mp4']
    },
    linkedin: {
      count: 9,
      size: 100 * 1024 * 1024, // 100MB
      types: ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'application/pdf']
    }
  };

  // Load scheduled posts on component mount
  useEffect(() => {
    fetchScheduledPosts();
  }, []);

  // Fetch scheduled posts from the backend
  const fetchScheduledPosts = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/posts/scheduled');
      const data = await response.json();
      
      if (response.ok) {
        // Process posts to ensure consistent format
        const processedPosts = data.posts.map(post => ({
          ...post,
          // Ensure platforms is always an array
          platforms: Array.isArray(post.platforms) ? post.platforms : [],
          // Ensure scheduled_time is a string
          scheduled_time: post.scheduled_time || new Date().toISOString(),
          // Ensure status has a default value
          status: post.status || 'scheduled'
        }));
        
        setScheduledPosts(processedPosts);
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
  const handleTwitterAuthStatusChange = (status, credentials) => {
    setIsTwitterAuthenticated(status);
    setTwitterCredentials(credentials);
    
    // If Twitter is deauthenticated, deselect it from platforms
    if (!status && platforms.twitter) {
      setPlatforms({
        ...platforms,
        twitter: false
      });
    }
  };

  // Handle file selection
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    
    if (files.length === 0) return;
    
    // Validate files
    const validationError = validateFiles(files);
    if (validationError) {
      setMediaError(validationError);
      return;
    }
    
    // Create file objects with preview URLs
    const newFiles = files.map(file => ({
      file,
      name: file.name,
      type: file.type,
      size: file.size,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    }));
    
    setMediaFiles(prev => [...prev, ...newFiles]);
    setMediaError('');
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Handle file removal
  const handleFileRemove = (index) => {
    setMediaFiles(prev => {
      const newFiles = [...prev];
      // Revoke object URL to avoid memory leaks
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };
  
  // Validate files against platform rules
  const validateFiles = (files) => {
    const selectedPlatforms = Object.keys(platforms).filter(p => platforms[p]);
    
    if (selectedPlatforms.length === 0) {
      return null;
    }
    
    // Get the most restrictive limits from selected platforms
    let maxCount = Math.min(...selectedPlatforms.map(p => mediaLimits[p].count));
    let maxSize = Math.min(...selectedPlatforms.map(p => mediaLimits[p].size));
    let allowedTypes = selectedPlatforms.reduce((types, platform) => {
      return types.filter(type => mediaLimits[platform].types.includes(type));
    }, [...new Set(selectedPlatforms.flatMap(p => mediaLimits[p].types))]);
    
    // Check if adding these files would exceed the count limit
    if (mediaFiles.length + files.length > maxCount) {
      return `You can only attach up to ${maxCount} files for the selected platforms`;
    }
    
    // Check file sizes and types
    for (const file of files) {
      if (file.size > maxSize) {
        return `File "${file.name}" exceeds the maximum size limit (${Math.round(maxSize / (1024 * 1024))}MB)`;
      }
      
      if (!allowedTypes.includes(file.type)) {
        return `File type "${file.type}" is not supported by all selected platforms`;
      }
    }
    
    return null;
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
      
      // Create FormData for file uploads
      const formData = new FormData();
      formData.append('content', content);
      formData.append('platforms', JSON.stringify(selectedPlatforms));
      
      if (platforms.twitter) {
        formData.append('twitter_credentials', JSON.stringify(twitterCredentials));
      }
      
      // Add media files
      mediaFiles.forEach((mediaItem, index) => {
        formData.append(`media_${index}`, mediaItem.file);
      });
      
      const response = await fetch('/api/posts/publish', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (response.ok) {
        showAlert('Post published successfully!', 'success');
        setContent('');
        setMediaFiles([]);
        
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
      
      // Create FormData for file uploads
      const formData = new FormData();
      formData.append('content', content);
      formData.append('platforms', JSON.stringify(selectedPlatforms));
      formData.append('scheduled_time', scheduledTime.toISOString());
      
      if (platforms.twitter) {
        formData.append('twitter_credentials', JSON.stringify(twitterCredentials));
      }
      
      // Add media files
      mediaFiles.forEach((mediaItem, index) => {
        formData.append(`media_${index}`, mediaItem.file);
      });
      
      const response = await fetch('/api/posts/schedule', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (response.ok) {
        showAlert('Post scheduled successfully!', 'success');
        setContent('');
        setMediaFiles([]);
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
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (response.ok) {
        showAlert('Scheduled post deleted successfully!', 'success');
        fetchScheduledPosts(); // Refresh the list
      } else {
        showAlert(data.error || 'Failed to delete post', 'error');
      }
    } catch (error) {
      showAlert('Error connecting to the server', 'error');
      console.error('Error deleting post:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle executing a scheduled post
  const handleExecuteScheduledPost = async (postId) => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/posts/execute/${postId}`, {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (response.ok) {
        showAlert('Post executed successfully!', 'success');
        fetchScheduledPosts(); // Refresh the list
        
        // Show detailed results if available
        if (data.results) {
          setStatusDialog({
            open: true,
            title: 'Post Results',
            content: 'Your post has been processed with the following results:',
            results: data.results
          });
        }
      } else {
        showAlert(data.error || 'Failed to execute post', 'error');
      }
    } catch (error) {
      showAlert('Error connecting to the server', 'error');
      console.error('Error executing post:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Validate all inputs before submission
  const validateInputs = () => {
    // Check if content is provided
    if (!content.trim() && mediaFiles.length === 0) {
      showAlert('Please enter some content or attach media for your post', 'error');
      return false;
    }
    
    // Check if at least one platform is selected
    const selectedPlatforms = Object.keys(platforms).filter(p => platforms[p]);
    if (selectedPlatforms.length === 0) {
      showAlert('Please select at least one platform', 'error');
      return false;
    }
    
    // Validate content against platform rules
    if (content.trim() && !validateContent(content)) {
      showAlert(contentError, 'error');
      return false;
    }
    
    // Validate media files
    const mediaValidationError = validateFiles([]);
    if (mediaValidationError) {
      showAlert(mediaValidationError, 'error');
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

  // Render a scheduled post
  const renderScheduledPost = (post) => {
    const scheduledTime = new Date(post.scheduled_time);
    const isPastDue = scheduledTime < new Date();
    const hasMedia = post.media_paths && post.media_paths.length > 0;
    
    return (
      <Card key={post.id} sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Scheduled Post
          </Typography>
          
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
            {post.content}
          </Typography>
          
          {/* Display media attachment indicators if present */}
          {hasMedia && (
            <Box sx={{ mb: 2 }}>
              <Chip 
                icon={<AttachFileIcon />} 
                label={`${post.media_paths.length} media attachment${post.media_paths.length > 1 ? 's' : ''}`}
                color="primary" 
                variant="outlined" 
                size="small"
              />
            </Box>
          )}
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <ScheduleIcon sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2" color={isPastDue ? 'error' : 'text.secondary'}>
              {scheduledTime.toLocaleString()} {isPastDue ? '(Past Due)' : ''}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
            {post.platforms.map(platform => (
              <Chip
                key={platform}
                icon={getPlatformIcon(platform)}
                label={platform.charAt(0).toUpperCase() + platform.slice(1)}
                size="small"
                variant="outlined"
              />
            ))}
          </Box>
          
          <Typography variant="body2" color="text.secondary">
            Status: {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
          </Typography>
        </CardContent>
        <CardActions>
          {post.status === 'scheduled' && (
            <Button 
              size="small" 
              startIcon={<SendIcon />}
              onClick={() => handleExecuteScheduledPost(post.id)}
              disabled={isLoading}
            >
              Post Now
            </Button>
          )}
          <Button 
            size="small" 
            startIcon={<DeleteIcon />}
            onClick={() => handleDeleteScheduledPost(post.id)}
            disabled={isLoading}
            color="error"
          >
            Delete
          </Button>
        </CardActions>
      </Card>
    );
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
        
        {/* Media attachments section */}
        <Box sx={{ mt: 2, mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Media Attachments
          </Typography>
          
          {mediaError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {mediaError}
            </Alert>
          )}
          
          {/* Media files preview */}
          {mediaFiles.length > 0 && (
            <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: 'wrap', gap: 2 }}>
              {mediaFiles.map((file, index) => (
                <Card key={index} sx={{ width: 150, position: 'relative' }}>
                  {file.preview ? (
                    <CardMedia
                      component="img"
                      height="100"
                      image={file.preview}
                      alt={file.name}
                    />
                  ) : (
                    <Box sx={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <DocumentIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
                    </Box>
                  )}
                  <CardContent sx={{ p: 1 }}>
                    <Typography variant="caption" noWrap>
                      {file.name}
                    </Typography>
                  </CardContent>
                  <IconButton 
                    size="small" 
                    onClick={() => handleFileRemove(index)}
                    sx={{ position: 'absolute', top: 5, right: 5, bgcolor: 'rgba(255,255,255,0.7)' }}
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </Card>
              ))}
            </Stack>
          )}
          
          {/* File upload button */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,application/pdf"
            style={{ display: 'none' }}
            onChange={handleFileSelect}
          />
          <Button
            variant="outlined"
            startIcon={<AttachFileIcon />}
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
          >
            Attach Media
          </Button>
        </Box>
        
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
            {scheduledPosts.map(post => renderScheduledPost(post))}
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
