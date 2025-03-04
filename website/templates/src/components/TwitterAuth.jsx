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
  IconButton
} from '@mui/material';
import { 
  Twitter as TwitterIcon, 
  Link as LinkIcon, 
  Check as CheckIcon,
  Close as CloseIcon,
  Logout as LogoutIcon
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
    
    // Check for OAuth callback parameters in URL
    const handleOAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const oauthToken = urlParams.get('oauth_token');
      const oauthVerifier = urlParams.get('oauth_verifier');
      
      if (oauthToken && oauthVerifier) {
        console.log('OAuth callback detected with token and verifier');
        setIsLoading(true);
        
        try {
          // Call backend to complete authentication
          const response = await fetch('http://localhost:5000/api/twitter/callback', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              oauth_token: oauthToken,
              oauth_verifier: oauthVerifier
            }),
            credentials: 'include'
          });
          
          const data = await response.json();
          
          if (response.ok && data.success) {
            // Store credentials
            const credentials = {
              username: data.username,
              name: data.name,
              access_token: data.access_token,
              access_token_secret: data.access_token_secret
            };
            
            localStorage.setItem('twitterAuthenticated', 'true');
            localStorage.setItem('twitterCredentials', JSON.stringify(credentials));
            
            setIsAuthenticated(true);
            setTwitterCredentials(credentials);
            setUserData({
              username: data.username || '',
              name: data.name || '',
              access_token: data.access_token,
              access_token_secret: data.access_token_secret
            });
            
            updateAuthStatus(true, credentials);
            
            // Clear the URL parameters without refreshing the page
            window.history.replaceState({}, document.title, window.location.pathname);
          } else {
            setAuthError({
              show: true,
              message: 'Failed to complete Twitter authentication',
              error: data.error || 'Unknown error'
            });
          }
        } catch (error) {
          console.error('Error completing Twitter authentication:', error);
          setAuthError({
            show: true,
            message: 'Error completing Twitter authentication',
            error: error.message || 'Unknown error'
          });
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    checkStoredCredentials();
    handleOAuthCallback();
  }, []);
  
  // Handle connect with Twitter (OAuth)
  const handleConnect = async () => {
    try {
      setIsLoading(true);
      
      // Redirect to the backend OAuth endpoint
      // Make sure this URL is accessible from your frontend
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
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleConnect}
              disabled={isLoading}
              startIcon={<TwitterIcon />}
            >
              Connect with Twitter
            </Button>
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
    </Box>
  );
};

export default TwitterAuth;
