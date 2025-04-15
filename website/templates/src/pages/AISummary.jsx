import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Joyride from 'react-joyride';
import TranslatedText from '../components/TranslatedText';

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  MenuItem,
  Paper,
  Select,
  Slider,
  Snackbar,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography
} from '@mui/material';

import {
  AccessTime as AccessTimeIcon,
  Category as CategoryIcon,
  ContentCopy as ContentCopyIcon,
  Edit as EditIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  Link as LinkIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
  TextFields as TextFieldsIcon,
  Warning as WarningIcon,
  Twitter as TwitterIcon
} from '@mui/icons-material';

import { generateSummary, saveSummary } from '../services/api';

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
  const [showTutorial, setShowTutorial] = useState(false); // Removed manual tutorial toggle
  const [runTutorial, setRunTutorial] = useState(true); // Automatically start Joyride
  const [twitterShareUrl, setTwitterShareUrl] = useState('');
  const [isEditing, setIsEditing] = useState(false); // Track editing state
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [originalSummary, setOriginalSummary] = useState('');
  const [originalHeadline, setOriginalHeadline] = useState('');

  // Translation functionality
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState('fr');
  const [translationLoading, setTranslationLoading] = useState(false);
  const [translationError, setTranslationError] = useState('');
  const [autoDetect, setAutoDetect] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState('');
  const [showTranslation, setShowTranslation] = useState(false);
  const [detectingLanguage, setDetectingLanguage] = useState(false);

  const API_KEY = 'AIzaSyDqkyW03Bw4A5rK1ZlJCzgkYvo0dMzDxjM';
  const API_URL = 'https://translation.googleapis.com/language/translate/v2';
  const DETECT_URL = 'https://translation.googleapis.com/language/translate/v2/detect';

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'French' },
    { code: 'es', name: 'Spanish' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ru', name: 'Russian' },
    { code: 'ar', name: 'Arabic' },
    { code: 'hi', name: 'Hindi' },
    { code: 'pt', name: 'Portuguese' },
  ];

  const detectLanguage = async (text) => {
    if (!text.trim()) return;
    
    setDetectingLanguage(true);
    
    try {
      console.log("Detecting language for:", text.substring(0, 50) + "...");
      
      const response = await axios.post(
        `${DETECT_URL}?key=${API_KEY}`,
        { q: text }
      );

      console.log("Detection response:", response.data);

      // Check if we have a valid detection result
      if (response.data && 
          response.data.data && 
          response.data.data.detections && 
          response.data.data.detections.length > 0 &&
          response.data.data.detections[0].length > 0) {
        
        const detected = response.data.data.detections[0][0].language;
        console.log("Detected language:", detected);
        
        setDetectedLanguage(detected);
        
        if (autoDetect) {
          setSourceLanguage(detected);
        }
        
        return detected;
      } else {
        // Alternative approach: try to detect language using translation API directly
        console.log("Trying alternative detection method...");
        
        const translationResponse = await axios.post(
          `${API_URL}?key=${API_KEY}`,
          { 
            q: text,
            target: targetLanguage,
            format: 'text' 
          }
        );
        
        console.log("Translation response for detection:", translationResponse.data);
        
        if (translationResponse.data && 
            translationResponse.data.data && 
            translationResponse.data.data.translations && 
            translationResponse.data.data.translations.length > 0 &&
            translationResponse.data.data.translations[0].detectedSourceLanguage) {
          
          const detected = translationResponse.data.data.translations[0].detectedSourceLanguage;
          console.log("Detected language from translation:", detected);
          
          setDetectedLanguage(detected);
          
          if (autoDetect) {
            setSourceLanguage(detected);
          }
          
          return detected;
        } else {
          console.log("No language detected in either response structure");
        }
      }
    } catch (error) {
      console.error('Language detection error:', error);
      // Don't set error state here to avoid disrupting the UI
    } finally {
      setDetectingLanguage(false);
    }
    
    return null;
  };

  const handleInputChange = (e) => {
    const text = e.target.value;
    setInputText(text);
    
    // Debounce language detection to avoid too many API calls
    if (text.trim().length > 10 && autoDetect && !detectingLanguage) {
      // Clear any previous timeout
      if (window.detectLanguageTimeout) {
        clearTimeout(window.detectLanguageTimeout);
      }
      
      // Set a new timeout
      window.detectLanguageTimeout = setTimeout(() => {
        console.log("Triggering language detection after debounce");
        detectLanguage(text);
      }, 1000); // Increased debounce time for better API usage
    }
  };

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      setTranslationError('Please enter text to translate');
      return;
    }

    setTranslationLoading(true);
    setTranslationError('');

    try {
      // If auto-detect is enabled, detect the language first
      let sourceLang = sourceLanguage;
      if (autoDetect) {
        setDetectingLanguage(true);
        const detected = await detectLanguage(inputText);
        if (detected) {
          sourceLang = detected;
        }
        setDetectingLanguage(false);
      }

      const requestBody = {
        q: inputText,
        target: targetLanguage,
        format: 'text'
      };
      
      // Only include source parameter if not using auto-detect
      if (!autoDetect) {
        requestBody.source = sourceLang;
      }

      console.log("Translation request body:", requestBody);
      
      const response = await axios.post(
        `${API_URL}?key=${API_KEY}`,
        requestBody
      );

      console.log("Translation response:", response.data);
      
      if (response.data && 
          response.data.data && 
          response.data.data.translations && 
          response.data.data.translations.length > 0) {
        
        setOutputText(response.data.data.translations[0].translatedText);
        
        // If the translation included detected language info, update the UI
        if (response.data.data.translations[0].detectedSourceLanguage) {
          const detected = response.data.data.translations[0].detectedSourceLanguage;
          console.log("Detected language from translation:", detected);
          setDetectedLanguage(detected);
          if (autoDetect) {
            setSourceLanguage(detected);
          }
        }
      } else {
        setTranslationError('Translation failed. Please try again.');
      }
    } catch (error) {
      console.error('Translation error:', error);
      setTranslationError(error.response?.data?.error?.message || 'An error occurred during translation');
    } finally {
      setTranslationLoading(false);
    }
  };

  const handleSwapLanguages = () => {
    if (!autoDetect) {
      setSourceLanguage(targetLanguage);
      setTargetLanguage(sourceLanguage);
      setInputText(outputText);
      setOutputText(inputText);
    } else {
      // If auto-detect is on, just swap the output to input
      setTargetLanguage(sourceLanguage);
      setInputText(outputText);
      setOutputText('');
      setAutoDetect(false); // Turn off auto-detect when swapping
    }
  };

  const handleAutoDetectChange = (e) => {
    setAutoDetect(e.target.checked);
    if (e.target.checked && inputText.trim()) {
      detectLanguage(inputText);
    }
  };

  // Helper function to get language name from code
  const getLanguageName = (code) => {
    const language = languages.find(lang => lang.code === code);
    return language ? language.name : code;
  };

  // Function to copy summary to translation input
  const copyToTranslation = () => {
    setInputText(summary);
    setShowTranslation(true);
    // Scroll to translation section
    document.getElementById('translation-section').scrollIntoView({ behavior: 'smooth' });
  };

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
    console.log('Running first time setup for AISummary component');
    fetchUserPlan();

    // Check if there's a tutorial flag in localStorage
    const hasTutorial = localStorage.getItem('ai_summary_tutorial');
    if (!hasTutorial) {
      setShowTutorial(true);
      localStorage.setItem('ai_summary_tutorial', 'seen');
    }
    
    // Check if there's an article URL to summarize
    const articleUrl = localStorage.getItem('articleToSummarize');
    if (articleUrl) {
      setUrl(articleUrl);
      setInputTab(1); // Switch to URL tab
      localStorage.removeItem('articleToSummarize'); // Clear after use
      
      // Auto-generate the summary if a URL is provided
      setTimeout(() => {
        handleGenerateSummary();
      }, 500);
    }
  }, []);

  useEffect(() => {
    setRunTutorial(true); // Automatically start the tutorial when the component loads
  }, []);

  const steps = [
    {
      target: '.heading-primary',
      content: 'Welcome to the AI Summary Tool! Let me guide you through the features.',
    },
    {
      target: '#summary-length-slider',
      content: 'Use this slider to adjust the summary length as a percentage of the original content.',
    },
    {
      target: '#tone-select',
      content: 'Select the tone for your summary. Free users are limited to the Professional tone.',
    },
    {
      target: '.MuiTabs-root',
      content: 'Switch between providing text content or a URL to summarize.',
    },
    {
      target: '.MuiButton-containedPrimary',
      content: 'Click this button to generate your summary after configuring the options.',
    },
    {
      target: '.MuiPaper-root:last-of-type',
      content: 'Here you will see the generated summary along with options to regenerate, copy, or save it.',
    },
    {
      target: '.edit-button',
      content: 'You can now edit your summary! Click the Edit button to make changes to both the headline and summary text, then click Save Edits when done.',
    },
  ];

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

  const handleRegenerate = () => {
    // Check if user has made edits to the summary
    if (isEditing || 
        (summary !== originalSummary && originalSummary !== '') || 
        (headline !== originalHeadline && originalHeadline !== '')) {
      setConfirmDialogOpen(true);
    } else {
      handleGenerateSummary();
    }
  };

  const handleConfirmRegenerate = () => {
    setConfirmDialogOpen(false);
    handleGenerateSummary();
  };

  const handleCancelRegenerate = () => {
    setConfirmDialogOpen(false);
  };

  const handleCopyToClipboard = () => {
    const textToCopy = headline ? `${headline}\n\n${summary}` : summary;
    const textArea = document.createElement('textarea');
    textArea.value = textToCopy;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    
    setSnackbar({
      open: true,
      message: 'Summary copied to clipboard',
      severity: 'success'
    });
  };

  // Handler for summary editing
  const handleSummaryChange = (event) => {
    setSummary(event.target.value);
  };

  // Handler for headline editing
  const handleHeadlineChange = (event) => {
    setHeadline(event.target.value);
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    if (isEditing) {
      // When saving edits
      setSnackbar({
        open: true,
        message: 'Summary edits saved successfully',
        severity: 'success'
      });
    }
    setIsEditing(!isEditing);
  };

  const handleTwitterShare = () => {
    try {
      const textToShare = headline ? `${headline}\n\n${summary}` : summary;
      // Truncate text if it's too long for Twitter (280 chars)
      const truncatedText = textToShare.length > 250 
        ? textToShare.substring(0, 247) + '...' 
        : textToShare;
      
      // Add hashtags and source information
      let tweetText = truncatedText;
      if (metadata && metadata.source) {
        const sourceUrl = metadata.source.length > 30 
          ? metadata.source.substring(0, 27) + '...' 
          : metadata.source;
        tweetText += `\n\nSource: ${sourceUrl}`;
      }
      tweetText += '\n\n#MrGreen #AISummary';
      
      // Use Twitter's web intent URL
      const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
      
      // Open in a new tab
      window.open(shareUrl, '_blank');
      
      setSnackbar({
        open: true,
        message: 'Opening Twitter share page',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error sharing to Twitter:', error);
      setSnackbar({
        open: true,
        message: `Error sharing to Twitter: ${error.message || 'Unknown error'}`,
        severity: 'error'
      });
    }
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
  
    try {
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
    setIsEditing(false);
    
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
      
      // Store original summary and headline for comparison
      setOriginalSummary(result.summary);
      setOriginalHeadline(result.headline || '');
      
      // Set warnings if present
      if (result.warnings && result.warnings.length > 0) {
        setWarnings(result.warnings);
        setShowWarnings(true);
      }
      
      console.log('Summary generated successfully:', result);
      
    } catch (err) {
      console.error('Error generating summary:', err);
      setError(err.error || 'Failed to generate summary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 'var(--spacing-xl)' }}>
      <Joyride
        steps={steps}
        run={runTutorial}
        continuous
        showSkipButton
        disableBeacon // Prevent the red dot from appearing
        styles={{
          options: {
            zIndex: 10000,
          },
        }}
        callback={(data) => {
          if (data.status === 'finished' || data.status === 'skipped') {
            setRunTutorial(false); // Stop the tutorial when finished or skipped
          }
        }}
      />
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
                sx={{ mr: 1 }}
              >
                {saving ? <CircularProgress size={24} color="inherit" /> : 'Save'}
              </Button>

              <Button
                startIcon={<TwitterIcon />}
                onClick={handleTwitterShare}
                color="info"
                sx={{ mr: 1 }}
              >
                Tweet
              </Button>

              <Button
                onClick={copyToTranslation}
                color="primary"
                sx={{ mr: 1 }}
              >
                Translate
              </Button>

              <Button
                onClick={toggleEditMode}
                color={isEditing ? "success" : "primary"}
                className="edit-button"
                startIcon={isEditing ? <SaveIcon /> : <EditIcon />}
              >
                {isEditing ? "Save Edits" : "Edit"}
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
              {isEditing ? (
                <TextField
                  fullWidth
                  value={headline}
                  onChange={handleHeadlineChange}
                  variant="outlined"
                  sx={{ mb: 2, fontWeight: 'bold' }}
                />
              ) : (
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                  {headline}
                </Typography>
              )}
              <Divider sx={{ mb: 2 }} />
            </>
          )}
          
          {isEditing ? (
            <TextField
              multiline
              fullWidth
              rows={10}
              value={summary}
              onChange={handleSummaryChange}
              variant="outlined"
              sx={{ whiteSpace: 'pre-wrap' }}
              helperText={`${summary.length} characters`}
            />
          ) : (
            <Typography variant="body1" component="div" sx={{ whiteSpace: 'pre-wrap' }}>
              {summary}
            </Typography>
          )}
          
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

      {/* Translation Section */}
      <Box id="translation-section" sx={{ mt: 4 }}>
        <Button 
          onClick={() => setShowTranslation(!showTranslation)}
          variant="outlined"
          fullWidth
          sx={{ mb: 2 }}
        >
          {showTranslation ? "Hide Translation Tool" : "Show Translation Tool"}
        </Button>

        {showTranslation && (
          <Paper
            elevation={3}
            sx={{
              padding: 3,
              borderRadius: '10px',
            }}
          >
            <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
              <TranslatedText>Text Translation</TranslatedText>
            </Typography>

            {translationError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                <TranslatedText>{translationError}</TranslatedText>
              </Alert>
            )}

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 3 }}>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <FormControl sx={{ width: autoDetect ? '60%' : '100%' }}>
                    <InputLabel id="source-language-label">
                      <TranslatedText>Source Language</TranslatedText>
                    </InputLabel>
                    <Select
                      labelId="source-language-label"
                      value={sourceLanguage}
                      onChange={(e) => setSourceLanguage(e.target.value)}
                      disabled={autoDetect}
                    >
                      {languages.map((lang) => (
                        <MenuItem key={lang.code} value={lang.code}>
                          {lang.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={autoDetect}
                        onChange={handleAutoDetectChange}
                      />
                    }
                    label={<TranslatedText>Auto Detect</TranslatedText>}
                    sx={{ ml: 1 }}
                  />
                </Box>
                
                {autoDetect && detectedLanguage && (
                  <Typography variant="body2" sx={{ mb: 1, color: 'primary.main', textAlign: 'left' }}>
                    <TranslatedText>Detected:</TranslatedText> {getLanguageName(detectedLanguage)}
                    {detectingLanguage && <CircularProgress size={12} sx={{ ml: 1 }} />}
                  </Typography>
                )}
                
                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  placeholder="Enter text to translate"
                  value={inputText}
                  onChange={handleInputChange}
                />
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 1 }}>
                <Button
                  onClick={handleSwapLanguages}
                  variant="contained"
                  sx={{
                    minWidth: { xs: '100%', md: 'auto' },
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    p: 0,
                  }}
                >
                  ⇄
                </Button>
              </Box>

              <Box sx={{ flex: 1 }}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel id="target-language-label">
                    <TranslatedText>Target Language</TranslatedText>
                  </InputLabel>
                  <Select
                    labelId="target-language-label"
                    value={targetLanguage}
                    onChange={(e) => setTargetLanguage(e.target.value)}
                  >
                    {languages.map((lang) => (
                      <MenuItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  placeholder="Translation will appear here"
                  value={outputText}
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </Box>
            </Box>

            <Button
              onClick={handleTranslate}
              disabled={translationLoading}
              fullWidth
              variant="contained"
              sx={{
                mt: 2,
                mb: 2,
                height: '50px',
              }}
            >
              {translationLoading ? <CircularProgress size={24} /> : <TranslatedText>Translate</TranslatedText>}
            </Button>

            <Typography variant="caption" sx={{ display: 'block', mt: 2, textAlign: 'center', color: 'text.secondary' }}>
              <TranslatedText>Powered by Google Translate API</TranslatedText>
            </Typography>
          </Paper>
        )}
      </Box>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
      
      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={handleCancelRegenerate}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Regenerate Summary?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            You have made edits to the summary. Regenerating will replace your edited content with a new AI-generated summary. Are you sure you want to continue?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelRegenerate}>Cancel</Button>
          <Button onClick={handleConfirmRegenerate} autoFocus>
            Regenerate
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AISummary;
