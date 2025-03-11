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
            
            // Redirect to post-system page instead of just clearing URL parameters
            window.location.href = 'http://localhost:3000/post-system';
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
    <Box sx={{ 
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      {isAuthenticated ? (
        <Box sx={{ 
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          p: 1
        }}>
          <TwitterIcon sx={{ fontSize: 24, color: '#ffdd57' }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 'bold' }}>
              {userData.name}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              @{userData.username}
            </Typography>
          </Box>
          <Button
            size="small"
            variant="outlined"
            onClick={handleDisconnect}
            disabled={isLoading}
            sx={{
              color: 'white',
              borderColor: 'white',
              minWidth: 'auto',
              px: 2,
              '&:hover': {
                borderColor: '#ffdd57',
                color: '#ffdd57'
              }
            }}
          >
            Disconnect
          </Button>
        </Box>
      ) : (
        <Box sx={{ 
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          p: 1
        }}>
          <Button
            variant="contained"
            startIcon={<TwitterIcon />}
            onClick={handleConnect}
            disabled={isLoading}
            size="medium"
            sx={{
              background: 'linear-gradient(135deg, #ffdd57, #FFD700)',
              color: '#8B0000',
              fontWeight: 'bold',
              borderRadius: '30px',
              px: 3,
              '&:hover': { 
                background: '#fff',
                color: '#8B0000'
              }
            }}
          >
            {isLoading ? 'Connecting...' : 'Connect with Twitter'}
          </Button>
        </Box>
      )}

      <Dialog
        open={authError.show}
        onClose={handleErrorClose}
        PaperProps={{
          sx: {
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '15px'
          }
        }}
      >
        <DialogTitle>Authentication Error</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {authError.message}
            {authError.error && (
              <Typography color="error" sx={{ mt: 1 }}>
                Error details: {authError.error}
              </Typography>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleErrorClose} sx={{ color: '#8B0000' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {isLoading && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          mt: 1
        }}>
          <CircularProgress size={20} sx={{ color: '#ffdd57' }} />
        </Box>
      )}
    </Box>
  );
};

export default TwitterAuth;
