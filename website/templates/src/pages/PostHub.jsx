import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, Modal, IconButton } from '@mui/material';
import TwitterIcon from '@mui/icons-material/Twitter';
import EmailIcon from '@mui/icons-material/Email';
import GitHubIcon from '@mui/icons-material/GitHub';
import CloseIcon from '@mui/icons-material/Close';
import Newsletters from './Newsletters';
import PostSystem from './PostSystem';  // Import the PostSystem page

const PostHub = () => {
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleIconClick = (platform) => {
    if (platform === 'github-demo') return; // not clickable
    setSelectedPlatform(platform);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setSelectedPlatform('');
  };

  const platformIcons = [
    { platform: 'twitter', icon: <TwitterIcon sx={{ fontSize: 60, color: 'primary.main' }} />, label: 'Twitter' },
    { platform: 'email', icon: <EmailIcon sx={{ fontSize: 60, color: 'red' }} />, label: 'Newsletter' },
    {
      platform: 'github-demo',
      icon: <GitHubIcon sx={{ fontSize: 60, color: 'grey.500' }} />,
      label: 'GitHub Demo (Coming Soon)',
      clickable: false
    }
  ];

  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, backgroundColor: 'background.default', minHeight: '100vh' }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'text.primary' }}>
        Post Hub
      </Typography>
      <Typography variant="subtitle1" gutterBottom sx={{ color: 'text.secondary', mb: 3 }}>
        Select a platform to post your content:
      </Typography>
      <Grid container spacing={4}>
        {platformIcons.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.platform}>
            <Paper
              sx={{
                p: 3,
                textAlign: 'center',
                cursor: item.clickable === false ? 'default' : 'pointer',
                transition: 'box-shadow 0.3s ease, transform 0.3s ease',
                '&:hover': item.clickable === false ? {} : { boxShadow: 6, transform: 'translateY(-3px)' },
                borderRadius: 2
              }}
              onClick={() => handleIconClick(item.platform)}
              elevation={3}
            >
              {item.icon}
              <Typography variant="h6" sx={{ mt: 1, fontWeight: 'medium', color: 'text.primary' }}>
                {item.label}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Modal open={isModalOpen} onClose={handleClose}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '95%', sm: '90%', md: '80%' },
            height: { xs: '90%', sm: '80%', md: '80%' },
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            overflowY: 'auto',
            position: 'relative'
          }}
        >
          <IconButton onClick={handleClose} sx={{ position: 'absolute', top: 8, right: 8 }}>
            <CloseIcon />
          </IconButton>
          {selectedPlatform === 'twitter' ? (
            <>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Post Tweet
              </Typography>
              <PostSystem />  {/* Render the full PostSystem page */}
            </>
          ) : (
            <>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Send Newsletter
              </Typography>
              <Newsletters />
            </>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default PostHub;