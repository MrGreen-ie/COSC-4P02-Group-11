import React, { useState } from 'react';
import { Box, Typography, Paper, Tabs, Tab, Button, Grid, Divider, Card, CardContent, CardActionArea, CardMedia } from '@mui/material';
import Template1 from './Template1';
import Template2 from './Template2';
import Template3 from './Template3';

const Template = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(0);
  const [activeView, setActiveView] = useState('selection'); // 'selection' or 'preview'

  const templates = [
    {
      id: 0,
      name: 'Business Template',
      description: 'A professional newsletter template with traditional styling, perfect for business updates and corporate communications.',
      features: ['Clean and professional layout', 'Traditional black and white styling', 'Ideal for business communications'],
      component: Template1
    },
    {
      id: 1,
      name: 'Modern Green',
      description: 'A fresh, modern template with green accents, suitable for environmental organizations, wellness companies, and sustainability initiatives.',
      features: ['Earth-friendly green color scheme', 'Modern typography', 'Warm and inviting design'],
      component: Template2
    },
    {
      id: 2,
      name: 'Grid Layout',
      description: 'A clean, organized grid-based template that allows for multiple sections of content in a modern, responsive layout.',
      features: ['Responsive grid design', 'Multiple content areas', 'Modern and minimal aesthetic'],
      component: Template3
    }
  ];

  const handleTemplateSelect = (id) => {
    setSelectedTemplate(id);
    setActiveView('preview');
  };

  const handleBackToSelection = () => {
    setActiveView('selection');
  };

  const handleUseTemplate = () => {
    // This would typically navigate to an editor with the selected template
    console.log(`Selected template: ${selectedTemplate + 1}`);
  };

  const TemplateSelectionView = () => (
    <>
      <Typography 
        variant="h4" 
        className="heading-primary"
        gutterBottom 
        sx={{ 
          textAlign: 'left', 
          mb: 'var(--spacing-lg)'
        }}
      >
        Newsletter Templates
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 'var(--spacing-lg)' }}>
        Choose a template format for your newsletter. You can customize colors, content, and layout after selection.
      </Typography>
      
      <Grid container spacing={4}>
        {templates.map((template) => (
          <Grid item xs={12} md={4} key={template.id}>
            <Card 
              elevation={3}
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 'var(--shadow-lg)',
                },
              }}
            >
              <CardActionArea onClick={() => handleTemplateSelect(template.id)}>
                <Box 
                  sx={{ 
                    height: '200px', 
                    overflow: 'hidden',
                    borderBottom: '1px solid var(--border-color)'
                  }}
                >
                  <Box sx={{ transform: 'scale(0.5)', transformOrigin: 'top center' }}>
                    {React.createElement(template.component)}
                  </Box>
                </Box>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {template.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {template.description}
                  </Typography>
                  <Box component="ul" sx={{ pl: 2, mt: 1 }}>
                    {template.features.map((feature, idx) => (
                      <Typography component="li" variant="body2" key={idx} sx={{ mb: 0.5 }}>
                        {feature}
                      </Typography>
                    ))}
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </>
  );

  const TemplatePreviewView = () => {
    const ActiveTemplate = templates[selectedTemplate].component;
    
    return (
      <>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 'var(--spacing-lg)' }}>
          <Box>
            <Typography variant="h4" className="heading-primary">
              {templates[selectedTemplate].name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Preview the template before customization
            </Typography>
          </Box>
          <Button 
            variant="outlined"
            onClick={handleBackToSelection}
            sx={{ 
              borderColor: 'var(--primary)',
              color: 'var(--primary)',
              '&:hover': {
                borderColor: 'var(--primary-dark)',
                backgroundColor: 'rgba(var(--primary-rgb), 0.04)',
              }
            }}
          >
            Back to Templates
          </Button>
        </Box>
        
        <Typography variant="body1" paragraph>
          {templates[selectedTemplate].description}
        </Typography>
        
        <Box sx={{ 
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--border-radius-md)',
          height: '500px',
          mb: 'var(--spacing-lg)',
          overflow: 'auto'
        }}>
          <ActiveTemplate />
        </Box>
        
        <Grid container spacing={2} justifyContent="flex-end">
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              onClick={handleUseTemplate}
              sx={{
                backgroundColor: 'var(--primary)',
                '&:hover': {
                  backgroundColor: 'var(--primary-dark)',
                },
              }}
            >
              Use This Template
            </Button>
          </Grid>
        </Grid>
      </>
    );
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        background: 'var(--bg-primary)',
        padding: 'var(--spacing-xl)',
        overflowY: 'auto',
      }}
    >
      <Paper
        elevation={6}
        sx={{
          padding: 'var(--spacing-xl)',
          maxWidth: '1200px',
          margin: '0 auto',
          background: 'var(--bg-primary)',
          color: 'var(--text-primary)',
          borderRadius: 'var(--border-radius-lg)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        {activeView === 'selection' ? (
          <TemplateSelectionView />
        ) : (
          <TemplatePreviewView />
        )}
      </Paper>
    </Box>
  );
};

export default Template;
