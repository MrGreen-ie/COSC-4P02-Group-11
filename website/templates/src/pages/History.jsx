import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Chip,
  IconButton,
  Divider,
  Card,
  CardContent,
  CardActions,
  Collapse,
} from '@mui/material';
import {
  Mail as MailIcon,
  PostAdd as PostIcon,
  Visibility as ViewIcon,
  Analytics as AnalyticsIcon,
  AutoFixHigh as AIIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';
import axios from 'axios';

const History = () => {
  const [tabValue, setTabValue] = useState(0);
  const [history, setHistory] = useState([]);
  const [savedSummaries, setSavedSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSummary, setExpandedSummary] = useState(null);

  useEffect(() => {
    // Fetch saved summaries when component mounts
    const fetchSavedSummaries = async () => {
      try {
        setLoading(true);
        console.log('Fetching saved summaries...');
        const response = await axios.get('/api/summary/saved');
        console.log('API Response:', response);
        console.log('Response data:', response.data);
        console.log('Response type:', typeof response.data);
        console.log('Is Array?', Array.isArray(response.data));
        
        if (response.data && typeof response.data === 'object') {
          console.log('Response data keys:', Object.keys(response.data));
        }

        // Determine what data to use based on response structure
        let summariesData = response.data;
        if (response.data && response.data.summaries) {
          console.log('Found summaries in response.data.summaries');
          summariesData = response.data.summaries;
        }

        // Ensure we're setting an array, even if the response is empty or malformed
        const validSummaries = Array.isArray(summariesData) ? summariesData : [];
        console.log('Final summaries to be set:', validSummaries);
        setSavedSummaries(validSummaries);

      } catch (error) {
        console.error('Error fetching saved summaries:', error);
        console.error('Error details:', {
          message: error.message,
          response: error.response,
          status: error?.response?.status,
          data: error?.response?.data
        });
        setError('Failed to load summaries. Please try again later.');
        setSavedSummaries([]); // Ensure we set an empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchSavedSummaries();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleExpandSummary = (id) => {
    setExpandedSummary(expandedSummary === id ? null : id);
  };

  const handleCopyToClipboard = (headline, summary) => {
    const textToCopy = `${headline}\n\n${summary}`;
    navigator.clipboard.writeText(textToCopy);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'sent':
        return 'success';
      case 'failed':
        return 'error';
      case 'scheduled':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getIcon = (type) => {
    return type === 'newsletter' ? <MailIcon /> : <PostIcon />;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Container maxWidth="lg" sx={{ 
      mt: 'var(--spacing-xl)', 
      mb: 'var(--spacing-xl)' 
    }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb="var(--spacing-xl)">
        <Typography variant="h4" component="h1" className="heading-primary">
          Content History
        </Typography>
      </Box>

      {/* Stats Overview */}
      <Paper sx={{ 
        p: 'var(--spacing-md)', 
        mb: 'var(--spacing-xl)', 
        display: 'flex', 
        gap: 'var(--spacing-md)',
        boxShadow: 'var(--shadow-md)',
        borderRadius: 'var(--border-radius-lg)'
      }}>
        <Box flex={1} textAlign="center">
          <Typography variant="h6" className="heading-secondary">Total Posts</Typography>
          <Typography variant="h4" className="text-primary">0</Typography>
        </Box>
        <Divider orientation="vertical" flexItem />
        <Box flex={1} textAlign="center">
          <Typography variant="h6" className="heading-secondary">Total Newsletters</Typography>
          <Typography variant="h4" className="text-primary">0</Typography>
        </Box>
        <Divider orientation="vertical" flexItem />
        <Box flex={1} textAlign="center">
          <Typography variant="h6" className="heading-secondary">AI Summaries</Typography>
          <Typography variant="h4" className="text-primary">{savedSummaries.length}</Typography>
        </Box>
      </Paper>

      {/* Content Tabs */}
      <Paper sx={{ 
        width: '100%', 
        mb: 'var(--spacing-md)',
        boxShadow: 'var(--shadow-md)',
        borderRadius: 'var(--border-radius-lg)'
      }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
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
          <Tab label="All Content" />
          <Tab label="Posts" />
          <Tab label="Newsletters" />
          <Tab label="AI Summaries" />
        </Tabs>
      </Paper>

      {/* Content Display */}
      <Paper sx={{
        boxShadow: 'var(--shadow-md)',
        borderRadius: 'var(--border-radius-lg)'
      }}>
        {tabValue === 3 ? (
          // AI Summaries Tab
          loading ? (
            <Box p="var(--spacing-xl)" textAlign="center">
              <Typography variant="body1" className="text-secondary">
                Loading summaries...
              </Typography>
            </Box>
          ) : error ? (
            <Box p="var(--spacing-xl)" textAlign="center">
              <Typography variant="body1" className="text-secondary" color="error">
                {error}
              </Typography>
            </Box>
          ) : !Array.isArray(savedSummaries) || savedSummaries.length === 0 ? (
            <Box p="var(--spacing-xl)" textAlign="center">
              <Typography variant="h6" className="text-secondary">
                No saved AI summaries
              </Typography>
              <Typography variant="body1" className="text-secondary" sx={{ mt: 'var(--spacing-md)' }}>
                Generate and save summaries in the AI Summary tool to see them here
              </Typography>
            </Box>
          ) : (
            <List>
              {savedSummaries.map((summary, index) => (
                <React.Fragment key={summary.id}>
                  {index > 0 && <Divider />}
                  <ListItem 
                    sx={{ 
                      display: 'block',
                      p: 'var(--spacing-md)',
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'var(--bg-secondary)',
                      },
                    }}
                    onClick={() => handleExpandSummary(summary.id)}
                  >
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box display="flex" alignItems="center" gap={2}>
                        <AIIcon sx={{ color: 'var(--primary)' }} />
                        <Box>
                          <Typography variant="h6" className="heading-secondary">
                            {summary.headline}
                          </Typography>
                          <Typography variant="body2" className="text-secondary">
                            Created: {formatDate(summary.created_at)}
                          </Typography>
                        </Box>
                      </Box>
                      <Box>
                        <Chip 
                          label={summary.tone}
                          size="small"
                          sx={{ 
                            mr: 1,
                            backgroundColor: 'var(--bg-accent)',
                            color: 'var(--primary)',
                          }}
                        />
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyToClipboard(summary.headline, summary.summary);
                          }}
                        >
                          <CopyIcon />
                        </IconButton>
                        <IconButton size="small">
                          {expandedSummary === summary.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      </Box>
                    </Box>
                    <Collapse in={expandedSummary === summary.id}>
                      <Box 
                        sx={{ 
                          mt: 'var(--spacing-md)',
                          p: 'var(--spacing-md)',
                          backgroundColor: 'var(--bg-secondary)',
                          borderRadius: 'var(--border-radius-md)',
                        }}
                      >
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                          {summary.summary}
                        </Typography>
                        {summary.tags && (
                          <Box sx={{ mt: 'var(--spacing-md)', display: 'flex', gap: 1 }}>
                            {summary.tags.split(',').map((tag, i) => (
                              <Chip
                                key={i}
                                label={tag.trim()}
                                size="small"
                                variant="outlined"
                                sx={{ 
                                  borderColor: 'var(--primary)',
                                  color: 'var(--primary)',
                                }}
                              />
                            ))}
                          </Box>
                        )}
                      </Box>
                    </Collapse>
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          )
        ) : (
          // Other tabs content
          history.length === 0 ? (
            <Box p="var(--spacing-xl)" textAlign="center">
              <Typography variant="h6" className="text-secondary">
                No content history available
              </Typography>
              <Typography variant="body1" className="text-secondary" sx={{ mt: 'var(--spacing-md)' }}>
                Your sent posts and newsletters will appear here
              </Typography>
            </Box>
          ) : (
            <List>
              {history.map((item, index) => (
                <React.Fragment key={item.id}>
                  {index > 0 && <Divider />}
                  <ListItem>
                    <ListItemIcon>
                      {getIcon(item.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.title}
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="textSecondary">
                            Sent: {item.sentDate} • Platform: {item.platform}
                          </Typography>
                        </>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Chip
                        label={item.status}
                        color={getStatusColor(item.status)}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <IconButton edge="end" aria-label="view" size="small" sx={{ mr: 1 }}>
                        <ViewIcon />
                      </IconButton>
                      <IconButton edge="end" aria-label="analytics" size="small">
                        <AnalyticsIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          )
        )}
      </Paper>
    </Container>
  );
};

export default History;
