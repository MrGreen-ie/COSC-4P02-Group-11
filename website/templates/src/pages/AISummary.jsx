import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
  Divider,
  TextField,
  CircularProgress,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  Chip,
  Collapse,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  LinearProgress
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import LinkIcon from '@mui/icons-material/Link';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import WarningIcon from '@mui/icons-material/Warning';
import CategoryIcon from '@mui/icons-material/Category';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SaveIcon from '@mui/icons-material/Save';
import { generateSummary, saveSummary } from '../services/api';
import axios from 'axios';

// Tab panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const AISummary = () => {
  // State management
  const [length, setLength] = useState(50);
  const [tone, setTone] = useState('professional');
  const [originalContent, setOriginalContent] = useState('');
  const [url, setUrl] = useState('');
  const [isHtml, setIsHtml] = useState(false);
  const [strictFiltering, setStrictFiltering] = useState(false);
  const [inputTab, setInputTab] = useState(0);
  const [summary, setSummary] = useState('');
  const [headline, setHeadline] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [warnings, setWarnings] = useState([]);
  const [showWarnings, setShowWarnings] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [saving, setSaving] = useState(false);
  const [plan, setPlan] = useState('Free'); // Default to 'Free', update based on user session

  useEffect(() => {
    const fetchUserPlan = async () => {
      try {
        const response = await fetch('/api/user-info'); // Backend API to fetch user info
        const data = await response.json();
        if (response.ok) {
          setPlan(data.role); // Update the plan state (e.g., 'Free', 'Pro', 'Admin')
        } else {
          console.error('Failed to fetch user plan:', data.error);
        }
      } catch (error) {
        console.error('Error fetching user plan:', error);
      }
    };
    fetchUserPlan();
  }, []);

  // Handlers
  const handleLengthChange = (event, newValue) => {
    setLength(newValue);
  };

  const handleToneChange = (event) => {
    // If the user is Free, ignore unwanted tone selections.
    if (String(plan).toLowerCase() === 'free' && event.target.value !== 'professional') {
      alert('Access limited. This tone is Pro only.');
      return;
    }
    setTone(event.target.value);
  };

  const handleContentChange = (event) => {
    const text = event.target.value;
    // Count words (filtering out any empty strings)
    const wordCount = text.split(/\s+/).filter(word => word !== "").length;
    
    // For Free users, limit summarized content to 500 words
    if (String(plan).toLowerCase() === 'free' && wordCount > 500) {
      alert('No longer than 500 words. Please upgrade to Pro version to have full access.');
      return;
    }
    setOriginalContent(text);
  };

  const handleUrlChange = (event) => {
    setUrl(event.target.value);
  };

  const handleHtmlToggle = (event) => {
    setIsHtml(event.target.checked);
  };

  const handleStrictFilteringToggle = (event) => {
    setStrictFiltering(event.target.checked);
  };

  const handleTabChange = (event, newValue) => {
    setInputTab(newValue);
  };

  const handleToggleWarnings = () => {
    setShowWarnings(!showWarnings);
  };

  const handleProgressUpdate = (progressData) => {
    if (progressData.status === 'processing') {
      setProgress(progressData.progress);
      setProgressMessage(progressData.message);
    } else if (progressData.status === 'completed') {
      setProgress(100);
      setProgressMessage('Summary generation complete');
    } else if (progressData.status === 'error') {
      setError(progressData.message);
      setProgress(0);
      setLoading(false);
    }
  };

  const handleGenerateSummary = async () => {
    // Reset state
    setSummary('');
    setHeadline('');
    setError(null);
    setMetadata(null);
    setWarnings([]);
    setLoading(true);
    setProgress(0);
    setProgressMessage('Preparing to generate summary...');
    
    try {
      // Determine if we're using content or URL
      const content = inputTab === 0 ? originalContent : '';
      const urlToUse = inputTab === 1 ? url : '';
      
      if (!content && !urlToUse) {
        throw new Error('Please provide content or a URL to summarize.');
      }
      
      // Call the API with progress callback
      const result = await generateSummary(
        content,
        length,
        tone,
        isHtml,
        urlToUse,
        strictFiltering,
        handleProgressUpdate
      );
      
      // Update state with results
      setSummary(result.summary);
      setHeadline(result.headline || '');
      setMetadata(result.metadata);
      
      // Set warnings if present
      if (result.warnings && result.warnings.length > 0) {
        setWarnings(result.warnings);
        setShowWarnings(true);
      }
      
// Log success
// Log success
      console.log('Summary generated successfully:', result);
      
    } catch (err) {
      console.error('Error generating summary:', err);
      setError(err.error || 'Failed to generate summary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = () => {
    handleGenerateSummary();
  };

  const handleCopyToClipboard = () => {// Copy both headline and summary if headline exists

// Copy both headline and summary if headline exists
    const textToCopy = headline ? `${headline}\n\n${summary}` : summary;
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        setSnackbar({
          open: true,
          message: 'Summary copied to clipboard',
          severity: 'success'
        });
      })
      .catch(err => {
        console.error('Failed to copy:', err);
        setSnackbar({
          open: true,
          message: 'Failed to copy to clipboard',
          severity: 'error'
        });
      });
  };

  const handleSaveSummary = async () => {
    if (!summary) {
      setSnackbar({
        open: true,
        message: 'No summary to save',
        severity: 'error'
      });
      return;
    }
  
    setSaving(true);
  
// Save the summary to newsletters
    try {
// Save the summary to newsletters
      const response = await axios.post('/api/newsletter', {
        headline,
        summary
      });
  
      if (response.data.success) {
        setSnackbar({
          open: true,
          message: 'Summary added to newsletters successfully',
          severity: 'success'
        });
      } else {
        throw new Error(response.data.error || 'Failed to add summary to newsletters');
      }
    } catch (err) {
      console.error('Error saving summary to newsletters:', err);
      setSnackbar({
        open: true,
        message: err.message || 'Failed to save summary to newsletters',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

// Helper function to get category color
  const getCategoryColor = (category) => {
    const categoryColors = {
      'technology': 'primary',
      'business': 'secondary',
      'news': 'info',
      'health': 'success',
      'science': 'info',
      'politics': 'error',
      'entertainment': 'secondary',
      'sports': 'success',
      'general': 'default'
    };

    return categoryColors[category] || 'default';
  };

  return (
    <Box sx={{ p: 'var(--spacing-xl)' }}>
      <Typography variant="h4" gutterBottom className="heading-primary">
        AI Content Summary
      </Typography>
      
      <Paper sx={{ 
        p: 'var(--spacing-xl)', 
        mb: 'var(--spacing-xl)',
        boxShadow: 'var(--shadow-md)',
        borderRadius: 'var(--border-radius-lg)'
      }}>
        <Typography variant="h6" gutterBottom className="heading-secondary">
          Configuration
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography gutterBottom>Summary Length: {length}%</Typography>
            <Slider
              value={length}
              onChange={handleLengthChange}
              aria-labelledby="summary-length-slider"
              valueLabelDisplay="auto"
              step={10}
              marks
              min={10}
              max={90}
              disabled={loading}
              sx={{
                color: 'var(--primary)',
                '& .MuiSlider-thumb': {
                  '&:hover, &.Mui-focusVisible': {
                    boxShadow: '0 0 0 8px var(--bg-accent)',
                  },
                },
                '& .MuiSlider-rail': {
                  opacity: 0.5,
                },
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="tone-select-label">Tone</InputLabel>
              {String(plan).toLowerCase() === 'free' ? (
                <Select
                  labelId="tone-select-label"
                  id="tone-select"
                  value="professional"
                  label="Tone"
                  disabled
                >
                  <MenuItem value="professional">Professional</MenuItem>
                </Select>
              ) : (
                <Select
                  labelId="tone-select-label"
                  id="tone-select"
                  value={tone}
                  label="Tone"
                  onChange={handleToneChange}
                  disabled={loading}
                >
                  <MenuItem value="professional">Professional</MenuItem>
                  <MenuItem value="casual">Casual</MenuItem>
                  <MenuItem value="academic">Academic</MenuItem>
                  <MenuItem value="friendly">Friendly</MenuItem>
                  <MenuItem value="promotional">Promotional</MenuItem>
                  <MenuItem value="informative">Informative</MenuItem>
                </Select>
              )}
            </FormControl>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 3 }}>
          <Tabs 
            value={inputTab} 
            onChange={handleTabChange} 
            aria-label="input tabs"
            sx={{
              '& .MuiTabs-indicator': {
                backgroundColor: 'var(--primary)',
              },
              '& .MuiTab-root': {
                color: 'var(--text-secondary)',
                '&.Mui-selected': {
                  color: 'var(--primary)',
                },
              },
            }}
          >
            <Tab icon={<TextFieldsIcon />} label="Text" />
            <Tab icon={<LinkIcon />} label="URL" />
          </Tabs>
          
          <TabPanel value={inputTab} index={0}>
            <TextField
              label="Content to Summarize"
              multiline
              rows={6}
              fullWidth
              value={originalContent}
              onChange={handleContentChange}
              disabled={loading}
              placeholder="Paste or type the content you want to summarize..."
            />
            <FormControlLabel
              control={
                <Switch
                  checked={isHtml}
                  onChange={handleHtmlToggle}
                  disabled={loading}
                />
              }
              label="Content contains HTML"
            />
          </TabPanel>
          
          <TabPanel value={inputTab} index={1}>
            <TextField
              label="URL to Summarize"
              fullWidth
              value={url}
              onChange={handleUrlChange}
              disabled={loading}
              placeholder="Enter a URL to extract and summarize content..."
            />
          </TabPanel>
        </Box>
        
        <Box sx={{ mt: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={strictFiltering}
                onChange={handleStrictFilteringToggle}
                disabled={loading}
              />
            }
            label="Strict content filtering"
          />
        </Box>
        
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleGenerateSummary}
            disabled={loading || (inputTab === 0 && !originalContent) || (inputTab === 1 && !url)}
            sx={{ 
              minWidth: 200,
              background: 'var(--primary)',
              '&:hover': {
                background: 'var(--primary-light)'
              }
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Generate Summary'
            )}
          </Button>
        </Box>
        
        {loading && progress > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" gutterBottom>
              {progressMessage}
            </Typography>
            <LinearProgress variant="determinate" value={progress} />
          </Box>
        )}
      </Paper>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {warnings.length > 0 && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={handleToggleWarnings}>
            <WarningIcon color="warning" sx={{ mr: 1 }} />
            <Typography variant="subtitle1">
              Content Warnings ({warnings.length})
            </Typography>
            {showWarnings ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </Box>
          
          <Collapse in={showWarnings}>
            <List dense>
              {warnings.map((warning, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <WarningIcon color="warning" />
                  </ListItemIcon>
                  <ListItemText primary={warning} />
                </ListItem>
              ))}
            </List>
          </Collapse>
        </Paper>
      )}
      
      {summary && (
        <Paper sx={{ 
          p: 'var(--spacing-xl)',
          boxShadow: 'var(--shadow-md)',
          borderRadius: 'var(--border-radius-lg)'
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Generated Summary
            </Typography>
            
            <Box>
              <Button
                startIcon={<RefreshIcon />}
                onClick={handleRegenerate}
                sx={{ mr: 1 }}
              >
                Regenerate
              </Button>
              
              <Button
                startIcon={<ContentCopyIcon />}
                onClick={handleCopyToClipboard}
                sx={{ mr: 1 }}
              >
                Copy
              </Button>
              
              <Button
                startIcon={<SaveIcon />}
                onClick={handleSaveSummary}
                disabled={saving}
                color="secondary"
              >
                {saving ? <CircularProgress size={24} color="inherit" /> : 'Save'}
              </Button>
            </Box>
          </Box>
          
          {metadata && metadata.categories && (
            <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {metadata.categories.primary_category && (
                <Chip
                  icon={<CategoryIcon />}
                  label={`Primary: ${metadata.categories.primary_category}`}
                  color={getCategoryColor(metadata.categories.primary_category)}
                  variant="filled"
                  size="small"
                />
              )}
              {metadata.categories.secondary_category && (
                <Chip
                  icon={<CategoryIcon />}
                  label={`Secondary: ${metadata.categories.secondary_category}`}
                  color={getCategoryColor(metadata.categories.secondary_category)}
                  variant="outlined"
                  size="small"
                />
              )}
            </Box>
          )}
          
          <Divider sx={{ mb: 2 }} />
          
          {headline && (
            <>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                {headline}
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </>
          )}
          
          <Typography variant="body1" component="div" sx={{ whiteSpace: 'pre-wrap' }}>
            {summary}
          </Typography>
          
          {metadata && (
            <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #eee' }}>
              <Typography variant="caption" color="text.secondary">
                {metadata.word_count && `Word count: ${metadata.word_count} • `}
                {metadata.reading_time && `Reading time: ${metadata.reading_time} min • `}
                {metadata.source && `Source: ${metadata.source}`}
              </Typography>
            </Box>
          )}
        </Paper>
      )}
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AISummary;
