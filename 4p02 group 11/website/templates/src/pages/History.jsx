import React from 'react';
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
} from '@mui/material';
import {
  Mail as MailIcon,
  PostAdd as PostIcon,
  Visibility as ViewIcon,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material';

const History = () => {
  const [tabValue, setTabValue] = React.useState(0);

  // Placeholder data
  const history = [];

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Content History
        </Typography>
      </Box>

      {/* Stats Overview */}
      <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2 }}>
        <Box flex={1} textAlign="center">
          <Typography variant="h6">Total Posts</Typography>
          <Typography variant="h4">0</Typography>
        </Box>
        <Divider orientation="vertical" flexItem />
        <Box flex={1} textAlign="center">
          <Typography variant="h6">Total Newsletters</Typography>
          <Typography variant="h4">0</Typography>
        </Box>
        <Divider orientation="vertical" flexItem />
        <Box flex={1} textAlign="center">
          <Typography variant="h6">Success Rate</Typography>
          <Typography variant="h4">0%</Typography>
        </Box>
      </Paper>

      {/* Content Tabs */}
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="All Content" />
          <Tab label="Posts" />
          <Tab label="Newsletters" />
        </Tabs>
      </Paper>

      {/* History List */}
      <Paper>
        {history.length === 0 ? (
          <Box p={4} textAlign="center">
            <Typography variant="h6" color="textSecondary">
              No content history available
            </Typography>
            <Typography variant="body1" color="textSecondary" sx={{ mt: 1 }}>
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
        )}
      </Paper>
    </Container>
  );
};

export default History;
