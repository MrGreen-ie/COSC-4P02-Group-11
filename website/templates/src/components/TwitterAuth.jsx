import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Card, 
  CardContent, 
  CardActions, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogContentText, 
  DialogActions, 
  CircularProgress, 
  Alert, 
  IconButton,
  TextField
} from '@mui/material';
import { 
  Twitter as TwitterIcon, 
  Link as LinkIcon, 
  Check as CheckIcon,
  Close as CloseIcon,
  Logout as LogoutIcon,
  Lock as LockIcon
} from '@mui/icons-material';

const TwitterAuth = ({ onAuthStatusChange }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [twitterCredentials, setTwitterCredentials] = useState(null);
  const [userData, setUserData] = useState({
    username: '',
    name: '',
    access_token: '',
    access_token_secret: ''
  });
  const [authError, setAuthError] = useState({
    show: false,
    message: '',
    error: ''
  });
  
  // State for direct auth dialog
  const [directAuthDialog, setDirectAuthDialog] = useState({
    open: false,
    username: '',
    password: '',
    error: ''
  });
  
  // Update authentication status
  const updateAuthStatus = (status, credentials = null) => {
    if (onAuthStatusChange) {
      onAuthStatusChange(status, credentials);
    }
  };
  
  // Effect to check for stored credentials on component mount
  useEffect(() => {
    const checkStoredCredentials = () => {
      const storedAuth = localStorage.getItem('twitterAuthenticated');
      const storedCredentials = localStorage.getItem('twitterCredentials');
      
      if (storedAuth === 'true' && storedCredentials) {
        try {
          const credentials = JSON.parse(storedCredentials);
          setIsAuthenticated(true);
          setTwitterCredentials(credentials);
          setUserData({
            username: credentials.username || '',
            name: credentials.name || '',
            access_token: credentials.access_token,
            access_token_secret: credentials.access_token_secret
          });
          
          updateAuthStatus(true, credentials);
        } catch (error) {
          console.error('Error parsing stored credentials:', error);
          // Clear invalid storage
          localStorage.removeItem('twitterAuthenticated');
          localStorage.removeItem('twitterCredentials');
        }
      }
    };
    
    checkStoredCredentials();
  }, []);
  
  // Handle connect with Twitter (OAuth)
  const handleConnect = async () => {
    try {
      setIsLoading(true);
      
      // Redirect to the backend OAuth endpoint
      window.location.href = 'http://localhost:5000/api/twitter/auth';
    } catch (error) {
      console.error('Error during Twitter authentication:', error);
      setAuthError({
        show: true,
        message: 'Failed to connect with Twitter',
        error: error.message || 'Unknown error'
      });
      setIsLoading(false);
    }
  };
  
  // Handle disconnect
  const handleDisconnect = async () => {
    try {
      setIsLoading(true);
      
      // Clear local storage
      localStorage.removeItem('twitterAuthenticated');
      localStorage.removeItem('twitterCredentials');
      
      // Update state
      setIsAuthenticated(false);
      setTwitterCredentials(null);
      setUserData({
        username: '',
        name: '',
        access_token: '',
        access_token_secret: ''
      });
      
      updateAuthStatus(false);
    } catch (error) {
      console.error('Error during disconnect:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle error dialog close
  const handleErrorClose = () => {
    setAuthError({
      show: false,
      message: '',
      error: ''
    });
  };
  
  // Handle direct auth dialog open
  const handleDirectAuthOpen = () => {
    setDirectAuthDialog({
      ...directAuthDialog,
      open: true
    });
  };

  // Handle direct auth dialog close
  const handleDirectAuthClose = () => {
    setDirectAuthDialog({
      ...directAuthDialog,
      open: false
    });
  };

  // Handle input change in direct auth dialog
  const handleDirectAuthInputChange = (event) => {
    setDirectAuthDialog({
      ...directAuthDialog,
      [event.target.name]: event.target.value,
      error: '' // Clear any previous error
    });
  };

  // Handle direct authentication
  const handleDirectAuth = async () => {
    try {
      setIsLoading(true);
      
      // Validate inputs
      if (!directAuthDialog.username || !directAuthDialog.password) {
        setDirectAuthDialog({
          ...directAuthDialog,
          error: 'Username and password are required'
        });
        return;
      }
      
      // Call the direct auth endpoint
      const response = await fetch('http://localhost:5000/api/twitter/direct-auth', {
        method: 'POST',
        mode: 'cors',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          username: directAuthDialog.username,
          password: directAuthDialog.password
        }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        // Authentication successful
        const credentials = {
          username: data.username,
          name: data.name,
          access_token: data.access_token,
          access_token_secret: data.access_token_secret
        };
        
        // Save credentials to localStorage
        localStorage.setItem('twitterAuthenticated', 'true');
        localStorage.setItem('twitterCredentials', JSON.stringify(credentials));
        
        setIsAuthenticated(true);
        setTwitterCredentials(credentials);
        setUserData(credentials);
        updateAuthStatus(true, credentials);
        
        // Close the dialog
        setDirectAuthDialog({
          ...directAuthDialog,
          open: false
        });
      } else {
        // Authentication failed
        setDirectAuthDialog({
          ...directAuthDialog,
          error: data.error || 'Authentication failed. Please check your credentials.'
        });
      }
    } catch (error) {
      console.error('Error during direct authentication:', error);
      setDirectAuthDialog({
        ...directAuthDialog,
        error: 'Error connecting to the server. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Twitter Authentication
      </Typography>
      
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TwitterIcon sx={{ color: '#1DA1F2', fontSize: 40 }} />
            <Box>
              <Typography variant="h6">Twitter</Typography>
              <Typography variant="body2" color="text.secondary">
                {isAuthenticated ? 'Connected' : 'Not connected'}
              </Typography>
            </Box>
          </Box>
          
          {isAuthenticated && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2">
                Connected as <strong>{userData.name}</strong> (@{userData.username})
              </Typography>
            </Box>
          )}
        </CardContent>
        
        <CardActions>
          {isAuthenticated ? (
            <Button 
              variant="outlined" 
              color="error" 
              onClick={handleDisconnect}
              disabled={isLoading}
              startIcon={<LogoutIcon />}
            >
              Disconnect
            </Button>
          ) : (
            <>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleConnect}
                disabled={isLoading}
                startIcon={<TwitterIcon />}
              >
                Connect with Twitter
              </Button>
              <Button 
                variant="outlined" 
                color="primary" 
                onClick={handleDirectAuthOpen}
                disabled={isLoading}
                startIcon={<LockIcon />}
              >
                Direct Auth
              </Button>
            </>
          )}
        </CardActions>
      </Card>
      
      {/* Error Dialog */}
      <Dialog 
        open={authError.show} 
        onClose={handleErrorClose}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Authentication Error</Typography>
          <IconButton onClick={handleErrorClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent>
          <DialogContentText>
            {authError.message}
          </DialogContentText>
          
          {authError.error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {authError.error}
            </Alert>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleErrorClose}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Direct Auth Dialog */}
      <Dialog 
        open={directAuthDialog.open} 
        onClose={handleDirectAuthClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TwitterIcon sx={{ color: '#1DA1F2' }} />
            <Typography variant="h6">Direct Twitter Authentication</Typography>
          </Box>
          <IconButton onClick={handleDirectAuthClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Enter your Twitter credentials to authenticate directly.
          </DialogContentText>
          
          {directAuthDialog.error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {directAuthDialog.error}
            </Alert>
          )}
          
          <TextField
            label="Username"
            name="username"
            value={directAuthDialog.username}
            onChange={handleDirectAuthInputChange}
            sx={{ mb: 2 }}
            fullWidth
          />
          
          <TextField
            label="Password"
            name="password"
            type="password"
            value={directAuthDialog.password}
            onChange={handleDirectAuthInputChange}
            sx={{ mb: 2 }}
            fullWidth
          />
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleDirectAuthClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleDirectAuth} 
            variant="contained" 
            color="primary"
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Authenticate'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TwitterAuth;
