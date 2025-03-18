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
import '../styles/theme.css';

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
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--border-radius-md)',
          p: { xs: 'var(--spacing-sm)', sm: 'var(--spacing-md)' }
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: 'var(--spacing-xs)'
        }}>
          {/* Post Content */}
          <Typography variant="body2" sx={{ 
            color: 'var(--text-primary)',
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
            gap: 'var(--spacing-xs)'
          }}>
            {/* Time and Platform */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: 'var(--spacing-xs)',
              flexGrow: 1
            }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: 'var(--spacing-xxs)',
                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                color: isPastDue ? 'var(--error)' : 'var(--text-secondary)'
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
                  color: 'var(--secondary)'
                }} />
              </Box>
            </Box>
            
            {/* Status and Actions */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: 'var(--spacing-xs)'
            }}>
              <Typography variant="caption" sx={{ 
                color: 'var(--text-secondary)',
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
                      background: 'var(--primary)',
                      color: 'var(--text-primary)',
                      minWidth: 0,
                      p: '2px 6px',
                      fontSize: { xs: '0.7rem', sm: '0.75rem' },
                      minHeight: 0,
                      '&:hover': { background: 'var(--primary-light)' }
                    }}
                  >
                    Post
                  </Button>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteScheduledPost(post.id)}
                    disabled={isLoading}
                    sx={{
                      color: 'var(--text-secondary)',
                      p: '2px',
                      '&:hover': { color: 'var(--error)' }
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
        background: 'var(--bg-primary)',
        position: 'relative',
        boxSizing: 'border-box',
        pt: { xs: 'var(--spacing-xl)', sm: 'calc(var(--spacing-xl) + var(--spacing-md))' },
        pb: { xs: 'var(--spacing-lg)', sm: 'var(--spacing-xl)' },
        px: { xs: 'var(--spacing-md)', sm: 'var(--spacing-lg)' }
      }}>
        <Box sx={{ 
          width: '100%',
          maxWidth: '800px',
          display: 'flex',
          flexDirection: 'column',
          gap: { xs: 'var(--spacing-md)', sm: 'var(--spacing-lg)' }
        }}>
          {/* Twitter Authentication Section */}
          <Paper elevation={6} sx={{
            borderRadius: 'var(--border-radius-lg)',
            background: 'var(--bg-primary)',
            color: 'var(--text-primary)',
            overflow: 'hidden',
            mt: { xs: 'var(--spacing-sm)', sm: 'var(--spacing-md)' }
          }}>
            <Box sx={{ p: { xs: 'var(--spacing-sm)', sm: 'var(--spacing-md)' } }}>
              <TwitterAuth onAuthStatusChange={handleTwitterAuthStatusChange} />
            </Box>
          </Paper>
          
          {/* Main Content Section */}
          <Paper elevation={6} sx={{
            p: { xs: 'var(--spacing-md)', sm: 'var(--spacing-lg)' },
            borderRadius: 'var(--border-radius-lg)',
            background: 'var(--bg-primary)',
            color: 'var(--text-primary)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <Typography variant="h4" gutterBottom className="heading-primary" sx={{ 
              textAlign: 'center',
              fontSize: { xs: '1.5rem', sm: '2rem' }
            }}>
              Social Media Post System
            </Typography>
            <Typography variant="body1" gutterBottom className="text-secondary" sx={{ 
              textAlign: 'center', 
              mb: 'var(--spacing-xl)',
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
            mb: 'var(--spacing-md)',
            '& .MuiInputBase-root': {
              color: 'var(--text-primary)',
              '& fieldset': { borderColor: 'var(--border-color)' },
              '&:hover fieldset': { borderColor: 'var(--primary)' },
              '&.Mui-focused fieldset': { borderColor: 'var(--primary)' }
            },
            '& .MuiInputLabel-root': {
              color: 'var(--text-secondary)',
              '&.Mui-focused': { color: 'var(--primary)' }
            }
          }}
        />
        
        {/* Media attachments section */}
        <Box sx={{ mt: 'var(--spacing-md)', mb: 'var(--spacing-md)' }}>
          <Typography variant="subtitle1" gutterBottom sx={{ color: 'var(--text-primary)' }}>
            Media Attachments
          </Typography>
          
          {mediaError && (
            <Alert severity="error" sx={{ mb: 'var(--spacing-md)' }}>
              {mediaError}
            </Alert>
          )}
          
          {/* Media files preview */}
          {mediaFiles.length > 0 && (
            <Stack direction="row" spacing={2} sx={{ mb: 'var(--spacing-md)', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
              {mediaFiles.map((file, index) => (
                <Card key={index} sx={{ 
                  width: 150, 
                  position: 'relative',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)'
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
                      <DocumentIcon sx={{ fontSize: 40, color: 'var(--text-primary)' }} />
                    </Box>
                  )}
                  <CardContent sx={{ p: 'var(--spacing-sm)' }}>
                    <Typography variant="caption" noWrap sx={{ color: 'var(--text-primary)' }}>
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
                      bgcolor: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      '&:hover': {
                        bgcolor: 'var(--bg-secondary-hover)'
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
                color: 'var(--text-primary)',
                borderColor: 'var(--border-color)',
                '&:hover': {
                  borderColor: 'var(--primary)',
                  color: 'var(--primary)'
                }
              }}
            >
              Attach Media
            </Button>
          </label>
          {mediaFiles.length > 0 && (
            <Box sx={{ mt: 'var(--spacing-sm)' }}>
              <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                Selected files: {mediaFiles.map(file => file.name).join(', ')}
              </Typography>
            </Box>
          )}
        </Box>
        
        {/* Platform selection */}
        <FormControl component="fieldset" sx={{ mb: 'var(--spacing-lg)' }}>
          <Typography variant="subtitle1" gutterBottom sx={{ color: 'var(--text-primary)' }}>
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
                    color: 'var(--text-secondary)',
                    '&.Mui-checked': { color: 'var(--primary)' }
                  }}
                  icon={<TwitterIcon />}
                  checkedIcon={<TwitterIcon />}
                  disabled={!isTwitterAuthenticated}
                />
              }
              label={
                <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'var(--text-primary)' }}>
                  Twitter
                  {!isTwitterAuthenticated && (
                    <Typography variant="caption" color="error" sx={{ ml: 'var(--spacing-sm)' }}>
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
          mt: 'var(--spacing-lg)', 
          display: 'flex', 
          gap: 'var(--spacing-md)',
          flexDirection: { xs: 'column', sm: 'row' },
          width: '100%'
        }}>
          <Button
            variant="contained"
            startIcon={<SendIcon />}
            onClick={handlePost}
            disabled={isLoading || (platforms.twitter && !isTwitterAuthenticated)}
            sx={{
              background: 'var(--gradient-secondary)',
              color: 'var(--text-primary)',
              fontWeight: 'var(--font-weight-bold)',
              borderRadius: 'var(--border-radius-full)',
              width: { xs: '100%', sm: 'auto' },
              '&:hover': { 
                background: 'var(--bg-accent)',
                color: 'var(--text-primary)'
              },
              '&.Mui-disabled': {
                background: 'var(--bg-disabled)',
                color: 'var(--text-disabled)'
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
                gap: 'var(--spacing-md)',
                width: '100%'
              }}>
                <DateTimePicker
                  label="Schedule Time"
                  value={scheduledTime}
                  onChange={(newValue) => setScheduledTime(newValue)}
                  minDateTime={new Date()}
                  sx={{
                    '& .MuiInputBase-root': {
                      color: 'var(--text-primary)',
                      '& fieldset': { borderColor: 'var(--border-color)' },
                      '&:hover fieldset': { borderColor: 'var(--primary)' },
                      '&.Mui-focused fieldset': { borderColor: 'var(--primary)' }
                    },
                    '& .MuiInputLabel-root': {
                      color: 'var(--text-secondary)',
                      color: 'var(--text-light)',
                      '&.Mui-focused': { color: 'var(--secondary)' }
                    },
                    '& .MuiIconButton-root': {
                      color: 'var(--text-light)'
                    }
                  }}
                />
                <Box sx={{ 
                  display: 'flex', 
                  gap: 'var(--spacing-md)',
                  justifyContent: 'center'
                }}>
                  <Button
                    variant="contained"
                    onClick={handleSchedulePost}
                    disabled={isLoading || (platforms.twitter && !isTwitterAuthenticated)}
                    sx={{
                      background: 'var(--gradient-secondary)',
                      color: 'var(--primary)',
                      fontWeight: 'var(--font-weight-bold)',
                      borderRadius: 'var(--border-radius-full)',
                      flex: 1,
                      maxWidth: '200px',
                      '&:hover': { 
                        background: 'var(--bg-light)',
                        color: 'var(--primary)'
                      },
                      '&.Mui-disabled': {
                        background: 'var(--bg-disabled)',
                        color: 'var(--text-disabled)'
                      }
                    }}
                  >
                    Schedule
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => setIsScheduling(false)}
                    sx={{
                      color: 'var(--text-light)',
                      borderColor: 'var(--text-light)',
                      flex: 1,
                      maxWidth: '200px',
                      '&:hover': {
                        borderColor: 'var(--secondary)',
                        color: 'var(--secondary)'
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
                background: 'var(--gradient-secondary)',
                color: 'var(--primary)',
                fontWeight: 'var(--font-weight-bold)',
                borderRadius: 'var(--border-radius-full)',
                width: { xs: '100%', sm: 'auto' },
                '&:hover': { 
                  background: 'var(--bg-light)',
                  color: 'var(--primary)'
                },
                '&.Mui-disabled': {
                  background: 'var(--bg-disabled)',
                  color: 'var(--text-disabled)'
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
        borderRadius: 'var(--border-radius-lg)',
        background: 'var(--bg-translucent)',
        backdropFilter: 'blur(10px)',
        color: 'var(--text-light)',
        overflow: 'hidden'
      }}>
        <Box sx={{ p: { xs: 'var(--spacing-sm)', sm: 'var(--spacing-md)' } }}>
          <Typography variant="subtitle1" sx={{ 
            color: 'var(--text-light)',
            fontWeight: 'var(--font-weight-bold)',
            mb: 'var(--spacing-xs)',
            textAlign: 'center',
            fontSize: { xs: '0.875rem', sm: '1rem' }
          }}>
            Scheduled Posts
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 'var(--spacing-md)' }}>
                <CircularProgress size={24} sx={{ color: 'var(--secondary)' }} />
              </Box>
            ) : scheduledPosts.length > 0 ? (
              scheduledPosts.map((post) => (
                <Paper
                  key={post.id}
                  elevation={2}
                  sx={{
                    background: 'var(--bg-translucent-light)',
                    borderRadius: 'var(--border-radius-md)',
                    p: { xs: 'var(--spacing-sm)', sm: 'var(--spacing-md)' }
                  }}
                >
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    gap: 'var(--spacing-xs)'
                  }}>
                    {/* Post Content */}
                    <Typography variant="body2" sx={{ 
                      color: 'var(--text-light)',
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
                      gap: 'var(--spacing-xs)'
                    }}>
                      {/* Time and Platform */}
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        gap: 'var(--spacing-xs)',
                        flexGrow: 1
                      }}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          gap: 'var(--spacing-xxs)',
                          fontSize: { xs: '0.7rem', sm: '0.75rem' },
                          color: new Date(post.scheduled_time) < new Date() ? 'var(--error)' : 'var(--text-secondary)'
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
                            color: 'var(--secondary)'
                          }} />
                        </Box>
                      </Box>
                      
                      {/* Status and Actions */}
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        gap: 'var(--spacing-xs)'
                      }}>
                        <Typography variant="caption" sx={{ 
                          color: 'var(--text-secondary)',
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
                                background: 'var(--secondary)',
                                color: 'var(--primary)',
                                minWidth: 0,
                                p: '2px 6px',
                                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                minHeight: 0,
                                '&:hover': { background: 'var(--bg-light)' }
                              }}
                            >
                              Post
                            </Button>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteScheduledPost(post.id)}
                              disabled={isLoading}
                              sx={{
                                color: 'var(--text-secondary)',
                                p: '2px',
                                '&:hover': { color: 'var(--error)' }
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
                color: 'var(--text-secondary)',
                textAlign: 'center',
                py: 'var(--spacing-sm)',
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
            background: 'var(--bg-translucent)',
            backdropFilter: 'blur(10px)',
            borderRadius: 'var(--border-radius-lg)'
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
          <Button onClick={handleCloseStatusDialog} sx={{ color: 'var(--primary)' }}>
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
