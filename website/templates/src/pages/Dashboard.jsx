import React, { useState, useEffect } from 'react';
import Joyride from 'react-joyride';
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
import axios from 'axios';
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

const navigate = useNavigate(); // Ensure navigate is defined here

// Placeholder data for quick actions
const quickActions = [
  
  {
    icon: <PostIcon />,
    label: 'Create Post',
    onClick: () => navigate('/post-hub'), // Navigate to the Create Post page
  },
  {
    icon: <AIIcon />,
    label: 'Generate Summary',
    onClick: () => navigate('/summaries/generate'), // Navigate to the Generate Summary page
  },
  {
    icon: <NewsletterIcon />,
    label: 'Send Newsletter',
  
    onClick: () => navigate('/post-hub'), // Navigate to the Send Newsletter page
  },
  {
    icon: <TemplateIcon />,
    label: 'Explore Templates',
    onClick: () => navigate('/templates'), // Navigate to the Templates page
  },
];

// Placeholder data for features
const features = [
  { title: 'Templates', icon: <TemplateIcon />, description: 'Browse and use content templates.', path: '/templates' },
  { title: 'Articles', icon: <FavoritesIcon />, description: 'View news and saved articles.', path: '/articles' },
  { title: 'History', icon: <HistoryIcon />, description: 'Review your content history.', path: '/history' },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [plan, setPlan] = useState('Free');
  const [newsletterCount, setNewsletterCount] = useState(0);
  const [sentNewsletterCount, setSentNewsletterCount] = useState(0);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [twitterPostCount, setTwitterPostCount] = useState(0); // New state for Twitter post count
  const [isAdmin, setIsAdmin] = useState(false);
  const [runTutorial, setRunTutorial] = useState(true);

  // Fetch user info, newsletter count, sent newsletters count, and Twitter post count
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch('/api/user-info');
        const data = await response.json();
        if (response.ok) {
          setPlan(data.role);
          setIsAdmin(data.role.toLowerCase() === 'admin');
        } else {
          console.error('Failed to fetch user info:', data.error);
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };

    const fetchNewsletterCount = async () => {
      try {
        const response = await axios.get('/api/template/saved'); // Use the same endpoint as in Newsletters.jsx
        setNewsletterCount(response.data.templates.length); // Set the count based on the templates array length
      } catch (error) {
        console.error('Error fetching templates:', error);
      }
    };

    const fetchSentNewsletterCount = async () => {
      try {
        const response = await axios.get('/api/newsletter/sent-this-month');
        setSentNewsletterCount(response.data.sent_this_month);
      } catch (error) {
        console.error('Error fetching sent newsletters count:', error);
      }
    };

    // New function to fetch subscribers
    const fetchSubscribers = async () => {
      try {
        const response = await axios.get('/api/subscribers');
        setSubscriberCount(response.data.subscribers.length);
      } catch (error) {
        console.error('Error fetching subscribers:', error);
      }
    };

    // const fetchTwitterPostCount = async () => {
    //   try {
    //     const response = await axios.get('/api/twitter/posts-count');
    //     setTwitterPostCount(response.data.count);
    //   } catch (error) {
    //     console.error('Error fetching Twitter post count:', error);
    //     if (error.response && error.response.status === 400) {
    //       alert('Twitter authentication required. Please log in to Twitter.');
    //       // Optionally, redirect the user to the Twitter authentication page
    //     }
    //   }
    // };

    fetchUserInfo();
    fetchNewsletterCount();
    fetchSentNewsletterCount();
    fetchSubscribers();
    //fetchTwitterPostCount(); // Fetch Twitter post count
  }, []);

  const steps = [
    {
      target: '.welcome-section',
      content: 'Welcome to your dashboard! This is your main hub for managing content and analytics.',
      disableBeacon: true,
    },
    {
      target: '.analytics-section',
      content: 'Here you can view key metrics about your content performance.',
    },
    {
      target: '.quick-actions-section',
      content: 'Use these buttons to quickly create posts, summaries, or newsletters.',
    },
    {
      target: '.features-section',
      content: 'Explore templates, favorites, and history to manage your content.',
    },
    ...(isAdmin
      ? [
          {
            target: '.admin-panel-section',
            content: 'As an admin, you can manage users and system settings here.',
          },
        ]
      : []),
  ];

  // Update the analytics array dynamically
  const analytics = [
    { title: 'Summary', value: newsletterCount.toLocaleString(), icon: <TrendingUpIcon />},
    { title: 'X Post', value: twitterPostCount.toLocaleString(), icon: <ArticleIcon />}, // Updated to use twitterPostCount
    { title: 'Newsletter Post', value: sentNewsletterCount.toLocaleString(), icon: <PeopleIcon /> },
    { title: 'Subscribers', value: subscriberCount.toLocaleString(), icon: <SpeedIcon />},
  ];

  return (
    <Box
      sx={{
        p: 'var(--spacing-xl)',
        minHeight: '100vh',
        background: 'var(--bg-secondary)',
        backgroundAttachment: 'fixed',
        position: 'relative',
      }}
    >
      <Joyride
        steps={steps}
        run={runTutorial}
        continuous
        showSkipButton
        styles={{
          options: {
            zIndex: 1000,
          },
        }}
        callback={(data) => {
          if (data.status === 'finished' || data.status === 'skipped') {
            setRunTutorial(false); // Stop the tutorial
          }
        }}
      />

      {/* Plan Box */}
      <Box
        sx={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'var(--bg-primary)',
          color: 'var(--text-primary)',
          padding: 'var(--spacing-md)',
          borderRadius: 'var(--border-radius-md)',
          boxShadow: 'var(--shadow-md)',
          border: '1px solid rgba(var(--primary), 0.1)',
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 'var(--font-weight-bold)' }}>
          Current Plan: <span style={{ color: 'var(--primary)' }}>{plan}</span>
        </Typography>
      </Box>

      {/* Welcome Section */}
      <Typography
        variant="h3"
        gutterBottom
        className="welcome-section"
        sx={{
          color: 'var(--text-primary)',
          mb: 'var(--spacing-xs)',
          fontWeight: 'var(--font-weight-bold)',
        }}
      >
        Welcome back, {user?.firstName || 'User'}
      </Typography>
      <Typography
        variant="subtitle1"
        sx={{
          color: 'var(--text-secondary)',
          mb: 'var(--spacing-xl)',
        }}
      >
        Here's what's happening with your content
      </Typography>

      {/* Analytics Section */}
      <Grid container spacing={3} sx={{ mb: 'var(--spacing-xxl)' }} className="analytics-section">
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
        className="quick-actions-section"
        sx={{
          color: 'var(--text-primary)',
          mb: 'var(--spacing-lg)',
          fontWeight: 'var(--font-weight-bold)',
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
        className="features-section"
        sx={{
          color: 'var(--text-primary)',
          mb: 'var(--spacing-lg)',
          fontWeight: 'var(--font-weight-bold)',
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

      {/* Admin Panel Section */}
      {isAdmin && (
        <Typography
          variant="h5"
          gutterBottom
          className="admin-panel-section"
          sx={{
            color: 'var(--text-primary)',
            mt: 'var(--spacing-lg)',
            fontWeight: 'var(--font-weight-bold)',
          }}
        >
          Admin Panel
        </Typography>
      )}
    </Box>
  );
};

export default Dashboard;