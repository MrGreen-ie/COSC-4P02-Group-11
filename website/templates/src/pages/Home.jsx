import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  Card,
  CardContent,
  CardActions,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
} from '@mui/material';
import { AccountCircle, Logout } from '@mui/icons-material';

const Home = () => {
  const navigate = useNavigate(); // Hook for navigation
  const [user, setUser] = useState(null); // State to store user data
  const [anchorEl, setAnchorEl] = useState(null); // State to manage dropdown menu

  useEffect(() => {
    // Retrieve user data from local storage on component mount
    const userData = localStorage.getItem('user');
    
    // Redirect to login page if no user data is found
    if (!userData) {
      navigate('/login');
      return;
    }

    // Parse and set the user data
    setUser(JSON.parse(userData));
  }, [navigate]);

  // Open user menu dropdown
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Close user menu dropdown
  const handleClose = () => {
    setAnchorEl(null);
  };

  // Handle user logout: remove user data and navigate to login page
  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  // List of features displayed on the dashboard
  const features = [
    { title: 'Feature 1', description: 'Description of feature 1 and its benefits.' },
    { title: 'Feature 2', description: 'Description of feature 2 and its benefits.' },
    { title: 'Feature 3', description: 'Description of feature 3 and its benefits.' },
  ];

  // Prevent rendering if user data is not available
  if (!user) return null;

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Top navigation bar */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Dashboard
          </Typography>
          <div>
            {/* User account icon */}
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>

            {/* Dropdown menu for user profile and logout */}
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              keepMounted
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleClose}>Profile</MenuItem>
              <MenuItem onClick={handleLogout}>
                <Logout sx={{ mr: 1 }} />
                Logout
              </MenuItem>
            </Menu>
          </div>
        </Toolbar>
      </AppBar>

      {/* Main content container */}
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          {/* Welcome message */}
          <Grid item xs={12}>
            <Paper
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                backgroundImage: 'linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)',
                color: 'white',
              }}
            >
              <Typography component="h1" variant="h4" gutterBottom>
                Welcome back, {user.firstName}!
              </Typography>
              <Typography variant="subtitle1">
                Here's what's new in your dashboard today.
              </Typography>
            </Paper>
          </Grid>

          {/* Feature cards section */}
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small">Learn More</Button>
                </CardActions>
              </Card>
            </Grid>
          ))}

          {/* User statistics section */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Your Activity
              </Typography>
              <Grid container spacing={3}>
                {/* Statistic cards */}
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      0
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Projects
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      0
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Active Tasks
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      0
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Completed Tasks
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Home;
