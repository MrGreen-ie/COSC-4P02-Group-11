import React, { useState, useEffect, useRef } from 'react';

import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  IconButton,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  LinearProgress,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography
} from '@mui/material';

import {
  AccessTime as AccessTimeIcon,
  AddPhotoAlternate as AddPhotoAlternateIcon,
  AttachFile as AttachFileIcon,
  Check as CheckIcon,
  Clear as ClearIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Description as DocumentIcon,
  Error as ErrorIcon,
  Image as ImageIcon,
  Schedule as ScheduleIcon,
  Send as SendIcon,
  Twitter as TwitterIcon
} from '@mui/icons-material';

import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

import TwitterAuth from '../components/TwitterAuth';

const PostSystem = () => {
  // State for post content
  const [content, setContent] = useState('');
  const [contentError, setContentError] = useState('');
  
  // State for platform selection
  const [platforms, setPlatforms] = useState({
    twitter: false
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
  const fileInputRef = useRef(null);

  // Character limits for different platforms
  const characterLimits = {
    twitter: 280
  };

  // Media limits for different platforms
  const mediaLimits = {
    twitter: {
      count: 4,
      size: 5 * 1024 * 1024, // 5MB
      types: ['image/jpeg', 'image/png', 'image/gif', 'video/mp4']
    }
  };

  // Function to fetch scheduled posts
  const fetchScheduledPosts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/posts/scheduled', {
        headers: {
          'Accept': 'application/json'
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        // Process posts to ensure consistent format
        const processedPosts = (data.posts || []).map(post => ({
          ...post,
          // Ensure scheduled_time is a string
          scheduled_time: post.scheduled_time || new Date().toISOString(),
          // Ensure status has a default value
          status: post.status || 'scheduled',
          // Ensure content is a string
          content: post.content || '',
          // Ensure platforms is an array
          platforms: Array.isArray(post.platforms) ? post.platforms : ['twitter']
        }));
        setScheduledPosts(processedPosts);
      } else {
        setAlert({
          open: true,
          message: data.message || 'Failed to fetch scheduled posts',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error fetching scheduled posts:', error);
      setAlert({
        open: true,
        message: 'Error connecting to the server',
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle executing a scheduled post
  const handleExecuteScheduledPost = async (postId) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/posts/scheduled/${postId}/execute`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        setAlert({
          open: true,
          message: data.message || 'Post executed successfully!',
          severity: 'success'
        });
        // Show detailed results if available
        if (data.results) {
          setStatusDialog({
            open: true,
            title: 'Post Results',
            content: 'Your post has been processed with the following results:',
            results: data.results
          });
        }
        fetchScheduledPosts(); // Refresh the list
      } else {
        setAlert({
          open: true,
          message: data.message || 'Failed to execute post',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error executing post:', error);
      setAlert({
        open: true,
        message: 'Error connecting to the server',
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle deleting a scheduled post
  const handleDeleteScheduledPost = async (postId) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/posts/scheduled/${postId}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json'
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        setAlert({
          open: true,
          message: data.message || 'Post deleted successfully!',
          severity: 'success'
        });
        fetchScheduledPosts(); // Refresh the list
      } else {
        setAlert({
          open: true,
          message: data.message || 'Failed to delete post',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      setAlert({
        open: true,
        message: 'Error connecting to the server',
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch scheduled posts on component mount
  useEffect(() => {
    fetchScheduledPosts();
  }, []);

  // Function to render a scheduled post
  const renderScheduledPost = (post) => {
    const isPastDue = new Date(post.scheduled_time) < new Date();
    
    return (
      <Paper
        key={post.id}
        elevation={2}
        sx={{
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '8px',
          p: { xs: 0.75, sm: 1 }
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: 0.5
        }}>
          {/* Post Content */}
          <Typography variant="body2" sx={{ 
            color: 'white',
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
            lineHeight: 1.3,
            wordBreak: 'break-word'
          }}>
            {post.content}
          </Typography>
          
          {/* Post Details */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 0.5
          }}>
            {/* Time and Platform */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: 0.5,
              flexGrow: 1
            }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: 0.25,
                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                color: isPastDue ? '#ff4444' : 'rgba(255, 255, 255, 0.7)'
              }}>
                <AccessTimeIcon sx={{ fontSize: 'inherit' }} />
                {new Date(post.scheduled_time).toLocaleString()}
                {isPastDue && ' (Past Due)'}
              </Box>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center'
              }}>
                <TwitterIcon sx={{ 
                  fontSize: { xs: '0.8rem', sm: '0.875rem' },
                  color: '#ffdd57'
                }} />
              </Box>
            </Box>
            
            {/* Status and Actions */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: 0.5
            }}>
              <Typography variant="caption" sx={{ 
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: { xs: '0.7rem', sm: '0.75rem' }
              }}>
                {post.status}
              </Typography>
              <Button
                variant="contained"
                size="small"
                onClick={() => handleExecuteScheduledPost(post.id)}
                disabled={isLoading}
                sx={{
                  background: '#ffdd57',
                  color: '#8B0000',
                  minWidth: 0,
                  p: '2px 6px',
                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                  minHeight: 0,
                  '&:hover': { background: '#fff' }
                }}
              >
                Post
              </Button>
              <IconButton
                size="small"
                onClick={() => handleDeleteScheduledPost(post.id)}
                disabled={isLoading}
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  p: '2px',
                  '&:hover': { color: '#ff4444' }
                }}
              >
                <DeleteIcon sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }} />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Paper>
    );
  };

  // Handle platform selection change
  const handlePlatformChange = (event) => {
    // If trying to select Twitter but not authenticated
    if (event.target.name === 'twitter' && event.target.checked && !isTwitterAuthenticated) {
      setAlert({
        open: true,
        message: 'Please connect your Twitter account first',
        severity: 'warning'
      });
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
      setAlert({
        open: true,
        message: 'Please connect your Twitter account before posting',
        severity: 'error'
      });
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
        setAlert({
          open: true,
          message: 'Post published successfully!',
          severity: 'success'
        });
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
        setAlert({
          open: true,
          message: data.error || 'Failed to publish post',
          severity: 'error'
        });
      }
    } catch (error) {
      setAlert({
        open: true,
        message: 'Error connecting to the server',
        severity: 'error'
      });
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
      setAlert({
        open: true,
        message: 'Please connect your Twitter account before scheduling',
        severity: 'error'
      });
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
        setAlert({
          open: true,
          message: 'Post scheduled successfully!',
          severity: 'success'
        });
        setContent('');
        setMediaFiles([]);
        setIsScheduling(false);
        fetchScheduledPosts(); // Refresh the list
      } else {
        setAlert({
          open: true,
          message: data.error || 'Failed to schedule post',
          severity: 'error'
        });
      }
    } catch (error) {
      setAlert({
        open: true,
        message: 'Error connecting to the server',
        severity: 'error'
      });
      console.error('Error scheduling post:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Validate all inputs before submission
  const validateInputs = () => {
    // Check if content is provided
    if (!content.trim() && mediaFiles.length === 0) {
      setAlert({
        open: true,
        message: 'Please enter some content or attach media for your post',
        severity: 'error'
      });
      return false;
    }
    
    // Check if at least one platform is selected
    const selectedPlatforms = Object.keys(platforms).filter(p => platforms[p]);
    if (selectedPlatforms.length === 0) {
      setAlert({
        open: true,
        message: 'Please select at least one platform',
        severity: 'error'
      });
      return false;
    }
    
    // Validate content against platform rules
    if (content.trim() && !validateContent(content)) {
      setAlert({
        open: true,
        message: contentError,
        severity: 'error'
      });
      return false;
    }
    
    // Validate media files
    const mediaValidationError = validateFiles([]);
    if (mediaValidationError) {
      setAlert({
        open: true,
        message: mediaValidationError,
        severity: 'error'
      });
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
  const handleAlertClose = () => {
    setAlert({ ...alert, open: false });
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
    <>
      <Box sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #8B0000, #FF4C4C)',
        position: 'relative',
        boxSizing: 'border-box',
        pt: { xs: '72px', sm: '80px' },
        pb: { xs: 3, sm: 4 },
        px: { xs: 2, sm: 3 }
      }}>
        <Box sx={{ 
          width: '100%',
          maxWidth: '800px',
          display: 'flex',
          flexDirection: 'column',
          gap: { xs: 2, sm: 3 }
        }}>
          {/* Twitter Authentication Section */}
          <Paper elevation={6} sx={{
            borderRadius: '15px',
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            color: 'white',
            overflow: 'hidden',
            mt: { xs: 1, sm: 2 }
          }}>
            <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
              <TwitterAuth onAuthStatusChange={handleTwitterAuthStatusChange} />
            </Box>
          </Paper>
          
          {/* Main Content Section */}
          <Paper elevation={6} sx={{
            p: { xs: 2, sm: 3 },
            borderRadius: '15px',
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            color: 'white',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <Typography variant="h4" gutterBottom sx={{ 
              color: 'white', 
              fontWeight: 'bold', 
              textAlign: 'center',
              fontSize: { xs: '1.5rem', sm: '2rem' }
            }}>
              Social Media Post System
            </Typography>
            <Typography variant="body1" gutterBottom sx={{ 
              color: 'white', 
              textAlign: 'center', 
              mb: 4,
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }}>
              Create, schedule, and manage your social media posts across multiple platforms.
            </Typography>
        
        {/* Content input */}
        <TextField
          multiline
          rows={4}
          maxRows={6}
          placeholder="What's on your mind?"
          value={content}
          onChange={handleContentChange}
          fullWidth
          sx={{
            mb: 2,
            '& .MuiInputBase-root': {
              color: 'white',
              '& fieldset': { borderColor: 'white' },
              '&:hover fieldset': { borderColor: '#ffdd57' },
              '&.Mui-focused fieldset': { borderColor: '#ffdd57' }
            },
            '& .MuiInputLabel-root': {
              color: 'white',
              '&.Mui-focused': { color: '#ffdd57' }
            }
          }}
        />
        
        {/* Media attachments section */}
        <Box sx={{ mt: 2, mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom sx={{ color: 'white' }}>
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
                <Card key={index} sx={{ 
                  width: 150, 
                  position: 'relative',
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: 'white'
                }}>
                  {file.preview ? (
                    <CardMedia
                      component="img"
                      height="100"
                      image={file.preview}
                      alt={file.name}
                    />
                  ) : (
                    <Box sx={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <DocumentIcon sx={{ fontSize: 40, color: 'white' }} />
                    </Box>
                  )}
                  <CardContent sx={{ p: 1 }}>
                    <Typography variant="caption" noWrap sx={{ color: 'white' }}>
                      {file.name}
                    </Typography>
                  </CardContent>
                  <IconButton 
                    size="small" 
                    onClick={() => handleFileRemove(index)}
                    sx={{ 
                      position: 'absolute', 
                      top: 5, 
                      right: 5, 
                      bgcolor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.3)'
                      }
                    }}
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </Card>
              ))}
            </Stack>
          )}
          
          {/* File upload button */}
          <input
            type="file"
            accept="image/*,video/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            id="media-upload"
            multiple
          />
          <label htmlFor="media-upload">
            <Button
              component="span"
              variant="outlined"
              startIcon={<AttachFileIcon />}
              sx={{
                color: 'white',
                borderColor: 'white',
                '&:hover': {
                  borderColor: '#ffdd57',
                  color: '#ffdd57'
                }
              }}
            >
              Attach Media
            </Button>
          </label>
          {mediaFiles.length > 0 && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Selected files: {mediaFiles.map(file => file.name).join(', ')}
              </Typography>
            </Box>
          )}
        </Box>
        
        {/* Platform selection */}
        <FormControl component="fieldset" sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom sx={{ color: 'white' }}>
            Select Platforms
          </Typography>
          <FormGroup row>
            <FormControlLabel
              control={
                <Checkbox 
                  checked={platforms.twitter}
                  onChange={handlePlatformChange}
                  name="twitter"
                  sx={{
                    color: 'white',
                    '&.Mui-checked': { color: '#ffdd57' }
                  }}
                  icon={<TwitterIcon />}
                  checkedIcon={<TwitterIcon />}
                  disabled={!isTwitterAuthenticated}
                />
              }
              label={
                <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'white' }}>
                  Twitter
                  {!isTwitterAuthenticated && (
                    <Typography variant="caption" color="error" sx={{ ml: 1 }}>
                      (Authentication required)
                    </Typography>
                  )}
                </Box>
              }
            />
          </FormGroup>
        </FormControl>
        
        {/* Action buttons */}
        <Box sx={{ 
          mt: 3, 
          display: 'flex', 
          gap: 2,
          flexDirection: { xs: 'column', sm: 'row' },
          width: '100%'
        }}>
          <Button
            variant="contained"
            startIcon={<SendIcon />}
            onClick={handlePost}
            disabled={isLoading || (platforms.twitter && !isTwitterAuthenticated)}
            sx={{
              background: 'linear-gradient(135deg, #ffdd57, #FFD700)',
              color: '#8B0000',
              fontWeight: 'bold',
              borderRadius: '30px',
              width: { xs: '100%', sm: 'auto' },
              '&:hover': { 
                background: '#fff',
                color: '#8B0000'
              },
              '&.Mui-disabled': {
                background: 'rgba(255,255,255,0.3)',
                color: 'rgba(255,255,255,0.5)'
              }
            }}
          >
            Post Now
          </Button>
          
          {isScheduling ? (
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                gap: 2,
                width: '100%'
              }}>
                <DateTimePicker
                  label="Schedule Time"
                  value={scheduledTime}
                  onChange={(newValue) => setScheduledTime(newValue)}
                  minDateTime={new Date()}
                  sx={{
                    '& .MuiInputBase-root': {
                      color: 'white',
                      '& fieldset': { borderColor: 'white' },
                      '&:hover fieldset': { borderColor: '#ffdd57' },
                      '&.Mui-focused fieldset': { borderColor: '#ffdd57' }
                    },
                    '& .MuiInputLabel-root': {
                      color: 'white',
                      '&.Mui-focused': { color: '#ffdd57' }
                    },
                    '& .MuiIconButton-root': {
                      color: 'white'
                    }
                  }}
                />
                <Box sx={{ 
                  display: 'flex', 
                  gap: 2,
                  justifyContent: 'center'
                }}>
                  <Button
                    variant="contained"
                    onClick={handleSchedulePost}
                    disabled={isLoading || (platforms.twitter && !isTwitterAuthenticated)}
                    sx={{
                      background: 'linear-gradient(135deg, #ffdd57, #FFD700)',
                      color: '#8B0000',
                      fontWeight: 'bold',
                      borderRadius: '30px',
                      flex: 1,
                      maxWidth: '200px',
                      '&:hover': { 
                        background: '#fff',
                        color: '#8B0000'
                      },
                      '&.Mui-disabled': {
                        background: 'rgba(255,255,255,0.3)',
                        color: 'rgba(255,255,255,0.5)'
                      }
                    }}
                  >
                    Schedule
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => setIsScheduling(false)}
                    sx={{
                      color: 'white',
                      borderColor: 'white',
                      flex: 1,
                      maxWidth: '200px',
                      '&:hover': {
                        borderColor: '#ffdd57',
                        color: '#ffdd57'
                      }
                    }}
                  >
                    Cancel
                  </Button>
                </Box>
              </Box>
            </LocalizationProvider>
          ) : (
            <Button
              variant="contained"
              startIcon={<ScheduleIcon />}
              onClick={() => setIsScheduling(true)}
              disabled={isLoading || (platforms.twitter && !isTwitterAuthenticated)}
              sx={{
                background: 'linear-gradient(135deg, #ffdd57, #FFD700)',
                color: '#8B0000',
                fontWeight: 'bold',
                borderRadius: '30px',
                width: { xs: '100%', sm: 'auto' },
                '&:hover': { 
                  background: '#fff',
                  color: '#8B0000'
                },
                '&.Mui-disabled': {
                  background: 'rgba(255,255,255,0.3)',
                  color: 'rgba(255,255,255,0.5)'
                }
              }}
            >
              Schedule Post
            </Button>
          )}
        </Box>
      </Paper>

      {/* Scheduled Posts Section */}
      <Paper elevation={6} sx={{
        borderRadius: '15px',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        color: 'white',
        overflow: 'hidden'
      }}>
        <Box sx={{ p: { xs: 1, sm: 1.5 } }}>
          <Typography variant="subtitle1" sx={{ 
            color: 'white',
            fontWeight: 'bold',
            mb: 0.5,
            textAlign: 'center',
            fontSize: { xs: '0.875rem', sm: '1rem' }
          }}>
            Scheduled Posts
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <CircularProgress size={24} sx={{ color: '#ffdd57' }} />
              </Box>
            ) : scheduledPosts.length > 0 ? (
              scheduledPosts.map((post) => (
                <Paper
                  key={post.id}
                  elevation={2}
                  sx={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px',
                    p: { xs: 0.75, sm: 1 }
                  }}
                >
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    gap: 0.5
                  }}>
                    {/* Post Content */}
                    <Typography variant="body2" sx={{ 
                      color: 'white',
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      lineHeight: 1.3,
                      wordBreak: 'break-word'
                    }}>
                      {post.content}
                    </Typography>
                    
                    {/* Post Details */}
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 0.5
                    }}>
                      {/* Time and Platform */}
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        gap: 0.5,
                        flexGrow: 1
                      }}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          gap: 0.25,
                          fontSize: { xs: '0.7rem', sm: '0.75rem' },
                          color: new Date(post.scheduled_time) < new Date() ? '#ff4444' : 'rgba(255, 255, 255, 0.7)'
                        }}>
                          <AccessTimeIcon sx={{ fontSize: 'inherit' }} />
                          {new Date(post.scheduled_time).toLocaleString()}
                          {new Date(post.scheduled_time) < new Date() && ' (Past Due)'}
                        </Box>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center'
                        }}>
                          <TwitterIcon sx={{ 
                            fontSize: { xs: '0.8rem', sm: '0.875rem' },
                            color: '#ffdd57'
                          }} />
                        </Box>
                      </Box>
                      
                      {/* Status and Actions */}
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        gap: 0.5
                      }}>
                        <Typography variant="caption" sx={{ 
                          color: 'rgba(255, 255, 255, 0.7)',
                          fontSize: { xs: '0.7rem', sm: '0.75rem' }
                        }}>
                          {post.status === 'scheduled' ? 'Scheduled' : post.status}
                        </Typography>
                        {post.status === 'scheduled' && (
                          <>
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => handleExecuteScheduledPost(post.id)}
                              disabled={isLoading}
                              sx={{
                                background: '#ffdd57',
                                color: '#8B0000',
                                minWidth: 0,
                                p: '2px 6px',
                                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                minHeight: 0,
                                '&:hover': { background: '#fff' }
                              }}
                            >
                              Post
                            </Button>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteScheduledPost(post.id)}
                              disabled={isLoading}
                              sx={{
                                color: 'rgba(255, 255, 255, 0.7)',
                                p: '2px',
                                '&:hover': { color: '#ff4444' }
                              }}
                            >
                              <DeleteIcon sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }} />
                            </IconButton>
                          </>
                        )}
                      </Box>
                    </Box>
                  </Box>
                </Paper>
              ))
            ) : (
              <Typography variant="body2" sx={{ 
                color: 'rgba(255, 255, 255, 0.7)',
                textAlign: 'center',
                py: 1,
                fontSize: { xs: '0.75rem', sm: '0.875rem' }
              }}>
                No scheduled posts yet
              </Typography>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Alerts */}
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleAlertClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleAlertClose}
          severity={alert.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {alert.message}
        </Alert>
      </Snackbar>

      {/* Status Dialog */}
      <Dialog
        open={statusDialog.open}
        onClose={handleCloseStatusDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '15px'
          }
        }}
      >
        <DialogTitle>{statusDialog.title}</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>{statusDialog.content}</Typography>
          {statusDialog.results && (
            <List>
              {Object.entries(statusDialog.results).map(([platform, result]) => (
                <ListItem key={platform}>
                  <ListItemIcon>
                    {result.success ? (
                      <CheckIcon color="success" />
                    ) : (
                      <ErrorIcon color="error" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={platform.charAt(0).toUpperCase() + platform.slice(1)}
                    secondary={result.message}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStatusDialog} sx={{ color: '#8B0000' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  </Box>
  </>
  );
};

export default PostSystem;
