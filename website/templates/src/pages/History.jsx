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
  Grid,
  Button,
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
  Delete as DeleteIcon,
  Send as SendIcon,
  DesignServices as TemplateIcon,
  Article as ArticleIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { getSavedTemplates, deleteTemplate } from '../services/api';
import { useNavigate } from 'react-router-dom';

const History = () => {
  const [tabValue, setTabValue] = useState(0);
  const [history, setHistory] = useState([]);
  const [savedSummaries, setSavedSummaries] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSummary, setExpandedSummary] = useState(null);
  const navigate = useNavigate();

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

    // Fetch both summaries and newsletters when component mounts
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        // Fetch summaries
        await fetchSavedSummaries();
        // Fetch templates/newsletters
        await fetchTemplates();
      } catch (error) {
        console.error('Error fetching initial data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const fetchTemplates = async () => {
    try {
      console.log('Fetching templates...');
      const response = await getSavedTemplates();
      if (response && response.templates) {
        console.log('Fetched templates:', response.templates);
        // Transform the templates to properly handle content for different template types
        const processedTemplates = response.templates.map(template => {
          const processed = { ...template };
          
          // Add a displayContent property based on template type
          if (template.template_id === 2) { // Template3 (Grid Layout)
            // Check if we have section data from the updated schema
            if (template.section1 || template.section2 || template.section3) {
              console.log(`Template ${template.id} has section data`, {
                section1: template.section1?.substring(0, 30) + '...',
                section2: template.section2?.substring(0, 30) + '...',
                section3: template.section3?.substring(0, 30) + '...'
              });
              
              // Create a display content that shows it has multiple sections
              processed.displayContent = template.section1 || 'Section 1';
              processed.hasSections = true;
            } else {
              // Fallback to regular content
              processed.displayContent = template.content;
              processed.hasSections = false;
            }
          } else {
            // For all other templates, use standard content
            processed.displayContent = template.content;
            processed.hasSections = false;
          }
          
          return processed;
        });
        
        setTemplates(processedTemplates);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      setError('Failed to load templates. Please try again later.');
    }
  };

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

  const handleDeleteTemplate = async (id) => {
    try {
      await deleteTemplate(id);
      setTemplates((prevTemplates) => prevTemplates.filter((template) => template.id !== id));
    } catch (error) {
      console.error('Error deleting template:', error);
    }
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

  // Helper function to get template style based on template_id
  const getTemplateStyle = (templateId) => {
    const styles = {
      0: { bgcolor: '#f5f5f5', icon: '💼' }, // Business Template
      1: { bgcolor: '#e8f5e9', icon: '🌿' }, // Modern Green
      2: { bgcolor: '#f5f5f5', icon: '📰' }, // Grid Layout
      3: { bgcolor: '#e1f5fe', icon: '💧' }, // Aqua Breeze
      4: { bgcolor: '#f3e5f5', icon: '💜' }, // Vibrant Purple
      5: { bgcolor: '#e0f2f1', icon: '📋' }, // Dual Column Layout
    };
    return styles[templateId] || { bgcolor: '#f5f5f5', icon: '📄' };
  };

  // Function to combine and sort newsletters and summaries for the All Content tab
  const getAllContent = () => {
    // Create a combined array with type property for identification
    const combinedContent = [
      ...templates.map(template => ({
        ...template,
        type: 'newsletter',
        displayDate: new Date(template.created_at)
      })),
      ...savedSummaries.map(summary => ({
        ...summary,
        type: 'summary',
        displayDate: new Date(summary.created_at)
      }))
    ];

    // Sort by creation date, newest first
    return combinedContent.sort((a, b) => b.displayDate - a.displayDate);
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
          <Typography variant="h4" className="text-primary">{templates.length}</Typography>
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
        {tabValue === 0 ? (
          // All Content Tab
          loading ? (
            <Box p="var(--spacing-xl)" textAlign="center">
              <Typography variant="body1" className="text-secondary">
                Loading content...
              </Typography>
            </Box>
          ) : error ? (
            <Box p="var(--spacing-xl)" textAlign="center">
              <Typography variant="body1" className="text-secondary" color="error">
                {error}
              </Typography>
            </Box>
          ) : getAllContent().length === 0 ? (
            <Box p="var(--spacing-xl)" textAlign="center">
              <Typography variant="h6" className="text-secondary">
                No content history available
              </Typography>
              <Typography variant="body1" className="text-secondary" sx={{ mt: 'var(--spacing-md)' }}>
                Your newsletters and AI summaries will appear here
              </Typography>
            </Box>
          ) : (
            <List>
              {getAllContent().map((item, index) => (
                <React.Fragment key={`${item.type}-${item.id}`}>
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
                    onClick={() => item.type === 'summary' ? handleExpandSummary(item.id) : null}
                  >
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box display="flex" alignItems="center" gap={2}>
                        {item.type === 'summary' ? (
                          <AIIcon sx={{ color: 'var(--primary)' }} />
                        ) : (
                          <ArticleIcon sx={{ color: item.template_id ? 'var(--accent)' : 'var(--primary)' }} />
                        )}
                        <Box>
                          <Typography variant="h6" className="heading-secondary">
                            {item.headline}
                          </Typography>
                          <Typography variant="body2" className="text-secondary">
                            {item.type === 'summary' ? 'AI Summary' : `Template: ${item.template_name}`} • Created: {formatDate(item.created_at)}
                          </Typography>
                        </Box>
                      </Box>
                      <Box>
                        {item.type === 'summary' && item.tone && (
                          <Chip 
                            label={item.tone}
                            size="small"
                            sx={{ 
                              mr: 1,
                              backgroundColor: 'var(--bg-accent)',
                              color: 'var(--primary)',
                            }}
                          />
                        )}
                        {item.type === 'newsletter' && (
                          <IconButton 
                            size="small" 
                            title="Send" 
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate('/newsletters');
                            }}
                            sx={{ mr: 1 }}
                          >
                            <SendIcon />
                          </IconButton>
                        )}
                        {item.type === 'summary' ? (
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyToClipboard(item.headline, item.summary);
                            }}
                            sx={{ mr: 1 }}
                          >
                            <CopyIcon />
                          </IconButton>
                        ) : (
                          <IconButton
                            size="small"
                            title="Delete"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTemplate(item.id);
                            }}
                            sx={{ mr: 1 }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                        {item.type === 'summary' && (
                          <IconButton size="small">
                            {expandedSummary === item.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          </IconButton>
                        )}
                      </Box>
                    </Box>
                    {item.type === 'summary' && (
                      <Collapse in={expandedSummary === item.id}>
                        <Box 
                          sx={{ 
                            mt: 'var(--spacing-md)',
                            p: 'var(--spacing-md)',
                            backgroundColor: 'var(--bg-secondary)',
                            borderRadius: 'var(--border-radius-md)',
                          }}
                        >
                          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                            {item.summary}
                          </Typography>
                          {item.tags && (
                            <Box sx={{ mt: 'var(--spacing-md)', display: 'flex', gap: 1 }}>
                              {item.tags.split(',').map((tag, i) => (
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
                    )}
                    {item.type === 'newsletter' && (
                      <Box sx={{ ml: 7, mt: 1 }}>
                        <Typography variant="body2" noWrap sx={{ color: 'var(--text-secondary)' }}>
                          {item.displayContent && item.displayContent.substring(0, 200)}...
                        </Typography>
                      </Box>
                    )}
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          )
        ) : tabValue === 1 ? (
          // Posts Tab
          <Box p="var(--spacing-xl)" textAlign="center">
            <Typography variant="h6" className="text-secondary">
              No posts available
            </Typography>
            <Typography variant="body1" className="text-secondary" sx={{ mt: 'var(--spacing-md)' }}>
              Your published posts will appear here
            </Typography>
          </Box>
        ) : tabValue === 2 ? (
          // Newsletters Tab
          loading ? (
            <Box p="var(--spacing-xl)" textAlign="center">
              <Typography variant="body1" className="text-secondary">
                Loading templates...
              </Typography>
            </Box>
          ) : error ? (
            <Box p="var(--spacing-xl)" textAlign="center">
              <Typography variant="body1" className="text-secondary" color="error">
                {error}
              </Typography>
            </Box>
          ) : !Array.isArray(templates) || templates.length === 0 ? (
            <Box p="var(--spacing-xl)" textAlign="center">
              <Typography variant="h6" className="text-secondary">
                No newsletter templates
              </Typography>
              <Typography variant="body1" className="text-secondary" sx={{ mt: 'var(--spacing-md)' }}>
                Create templates in the Newsletter section to see them here
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<TemplateIcon />}
                onClick={() => navigate('/templates?skipOverlay=true')}
                sx={{ mt: 2 }}
              >
                Create Template
              </Button>
            </Box>
          ) : (
            <Grid container spacing={3} sx={{ p: 3 }}>
              {templates.map((template) => {
                const templateStyle = getTemplateStyle(template.template_id);
                
                return (
                  <Grid item xs={12} md={6} lg={4} key={template.id}>
                    <Card className="card" sx={{ position: 'relative' }}>
                      <Box 
                        sx={{ 
                          position: 'absolute', 
                          top: 0, 
                          left: 0, 
                          width: '100%', 
                          height: '8px', 
                          bgcolor: templateStyle.bgcolor 
                        }} 
                      />
                      <CardContent sx={{ pt: 3 }}>
                        <Box display="flex" alignItems="center" mb={1}>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              mr: 1, 
                              fontSize: '18px',
                              lineHeight: 1
                            }}
                          >
                            {templateStyle.icon}
                          </Typography>
                          <Chip 
                            label={template.template_name} 
                            size="small" 
                            sx={{ 
                              bgcolor: templateStyle.bgcolor,
                              mb: 1
                            }} 
                          />
                        </Box>
                        <Typography variant="h6" component="h2" noWrap className="heading-secondary">
                          {template.headline}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom className="text-secondary">
                          Created: {formatDate(template.created_at)}
                        </Typography>
                        <Typography variant="body2" noWrap className="text-primary" sx={{ mb: 1 }}>
                          {template.template_id === 2 && template.hasSections ? (
                            <>
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Chip 
                                    label="Multi-Section" 
                                    size="small" 
                                    color="primary" 
                                    variant="outlined" 
                                    sx={{ mr: 1, mb: 1, fontSize: '0.7rem' }}
                                  />
                                </Box>
                                {template.displayContent.substring(0, 80)}...
                              </Box>
                            </>
                          ) : (
                            template.displayContent.substring(0, 100) + '...'
                          )}
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <IconButton size="small" title="Send" onClick={() => navigate(`/newsletters`)}>
                          <SendIcon />
                        </IconButton>
                        <IconButton size="small" title="Delete" onClick={() => handleDeleteTemplate(template.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </CardActions>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )
        ) : tabValue === 3 ? (
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
          // Default/fallback content
          <Box p="var(--spacing-xl)" textAlign="center">
            <Typography variant="h6" className="text-secondary">
              No content available
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default History;
