import React from 'react';
import { Box, Typography, Grid, Paper, Button, Stack } from '@mui/material';
import {
  Edit as EditIcon,
  Description as TemplateIcon,
  AutoFixHigh as AIIcon,
  Share as PostIcon,
  Star as FavoritesIcon,
  Email as NewsletterIcon,
  History as HistoryIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Article as ArticleIcon,
  Speed as SpeedIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import '../styles/theme.css';

// Analytics Card Component
const AnalyticsCard = ({ title, value, icon, trend }) => (
  <Paper
    sx={{
      p: 'var(--spacing-lg)',
      background: 'var(--bg-primary)',
      borderRadius: 'var(--border-radius-lg)',
      color: 'var(--text-primary)',
      boxShadow: 'var(--shadow-md)',
      border: '1px solid rgba(var(--primary), 0.1)',
      transition: 'var(--transition-normal)',
      '&:hover': {
        boxShadow: 'var(--shadow-lg)'
      }
    }}
  >
    <Stack direction="row" alignItems="center" spacing={2}>
      <Box sx={{ 
        p: 'var(--spacing-md)', 
        borderRadius: 'var(--border-radius-md)', 
        background: 'var(--bg-accent)' 
      }}>
        {React.cloneElement(icon, { sx: { color: 'var(--primary)' } })}
      </Box>
      <Box>
        <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
          {title}
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)' }}>
          {value}
        </Typography>
        {trend && (
          <Typography variant="caption" sx={{ 
            color: trend.startsWith('+') ? 'var(--success)' : 'var(--error)', 
            fontWeight: 'var(--font-weight-bold)' 
          }}>
            {trend} this month
          </Typography>
        )}
      </Box>
    </Stack>
  </Paper>
);

// Quick Action Button Component
const QuickActionButton = ({ icon, label, onClick }) => (
  <Button
    variant="contained"
    startIcon={React.cloneElement(icon, { sx: { color: 'var(--text-light)' } })}
    onClick={onClick}
    sx={{
      py: 'var(--spacing-md)',
      px: 'var(--spacing-lg)',
      background: 'var(--primary)',
      color: 'var(--text-light)',
      boxShadow: 'var(--shadow-md)',
      '&:hover': {
        background: 'var(--primary-light)',
        transform: 'translateY(-2px)',
        boxShadow: 'var(--shadow-lg)',
      },
      width: '100%',
      justifyContent: 'flex-start',
      transition: 'var(--transition-normal)'
    }}
  >
    {label}
  </Button>
);

// Feature Card Component
const FeatureCard = ({ title, icon, description, path }) => {
  const navigate = useNavigate();
  
  return (
    <Paper
      sx={{
        p: 'var(--spacing-lg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: 'pointer',
        background: 'var(--bg-primary)',
        borderRadius: 'var(--border-radius-lg)',
        color: 'var(--text-primary)',
        transition: 'var(--transition-normal)',
        boxShadow: 'var(--shadow-md)',
        border: '1px solid rgba(var(--primary), 0.1)',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: 'var(--shadow-lg)',
          borderColor: 'var(--primary)',
        }
      }}
      onClick={() => navigate(path)}
    >
      {React.cloneElement(icon, { 
        sx: { 
          fontSize: 'var(--font-size-xxxl)', 
          mb: 'var(--spacing-md)', 
          color: 'var(--primary)' 
        } 
      })}
      <Typography variant="h6" gutterBottom sx={{ 
        color: 'var(--text-primary)', 
        fontWeight: 'var(--font-weight-bold)' 
      }}>
        {title}
      </Typography>
      <Typography variant="body2" textAlign="center" sx={{ color: 'var(--text-secondary)' }}>
        {description}
      </Typography>
    </Paper>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  
  const analytics = [
    {
      title: 'Total Posts',
      value: '156',
      icon: <ArticleIcon />,
      trend: '+12%'
    },
    {
      title: 'Engagement Rate',
      value: '24.8%',
      icon: <PeopleIcon />,
      trend: '+5.3%'
    },
    {
      title: 'AI Summaries',
      value: '34',
      icon: <AIIcon />,
      trend: '+18%'
    },
    {
      title: 'Avg. Response Time',
      value: '1.2s',
      icon: <SpeedIcon />,
      trend: '-0.3s'
    }
  ];

  const quickActions = [
    {
      icon: <EditIcon />,
      label: 'Create New Post',
      onClick: () => navigate('/editor')
    },
    {
      icon: <AIIcon />,
      label: 'Generate AI Summary',
      onClick: () => navigate('/ai-summary')
    },
    {
      icon: <PostIcon />,
      label: 'Schedule Post',
      onClick: () => navigate('/post-system')
    },
    {
      icon: <NewsletterIcon />,
      label: 'Create Newsletter',
      onClick: () => navigate('/newsletters')
    }
  ];

  const features = [
    {
      title: 'Templates',
      icon: <TemplateIcon />,
      description: 'Access and manage your content templates',
      path: '/templates'
    },
    {
      title: 'Favourites',
      icon: <FavoritesIcon />,
      description: 'Access your saved content and templates',
      path: '/favourites'
    },
    {
      title: 'History',
      icon: <HistoryIcon />,
      description: 'View your content history and analytics',
      path: '/history'
    }
  ];

  return (
    <Box sx={{ 
      p: 'var(--spacing-xl)',
      minHeight: '100vh',
      background: 'var(--bg-secondary)',
      backgroundAttachment: 'fixed'
    }}>
      {/* Welcome Section */}
      <Typography 
        variant="h3" 
        gutterBottom 
        sx={{ 
          color: 'var(--text-primary)',
          mb: 'var(--spacing-xs)',
          fontWeight: 'var(--font-weight-bold)'
        }}
      >
        Welcome back, {user?.firstName || 'User'}
      </Typography>
      <Typography 
        variant="subtitle1" 
        sx={{ 
          color: 'var(--text-secondary)',
          mb: 'var(--spacing-xl)'
        }}
      >
        Here's what's happening with your content
      </Typography>

      {/* Analytics Section */}
      <Grid container spacing={3} sx={{ mb: 'var(--spacing-xxl)' }}>
        {analytics.map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item.title}>
            <AnalyticsCard {...item} />
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions Section */}
      <Typography 
        variant="h5" 
        gutterBottom 
        sx={{ 
          color: 'var(--text-primary)',
          mb: 'var(--spacing-lg)',
          fontWeight: 'var(--font-weight-bold)'
        }}
      >
        Quick Actions
      </Typography>
      <Grid container spacing={3} sx={{ mb: 'var(--spacing-xxl)' }}>
        {quickActions.map((action) => (
          <Grid item xs={12} sm={6} md={3} key={action.label}>
            <QuickActionButton {...action} />
          </Grid>
        ))}
      </Grid>

      {/* Features Section */}
      <Typography 
        variant="h5" 
        gutterBottom 
        sx={{ 
          color: 'var(--text-primary)',
          mb: 'var(--spacing-lg)',
          fontWeight: 'var(--font-weight-bold)'
        }}
      >
        Features
      </Typography>
      <Grid container spacing={3}>
        {features.map((feature) => (
          <Grid item xs={12} sm={6} md={4} key={feature.title}>
            <FeatureCard {...feature} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Dashboard; 