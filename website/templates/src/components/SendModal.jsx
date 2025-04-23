import React, { useState, useEffect } from 'react';
import { Modal, Box, Typography, TextField, Button, Snackbar, Alert, Checkbox, FormControlLabel, List, ListItem, ListItemText } from '@mui/material';
import axios from 'axios';
import TranslatedText from './TranslatedText';

const SendModal = ({ open, handleClose, newsletter, onSend }) => {
  const [manualEmail, setManualEmail] = useState('');
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    if (open) {
      fetchSubscribers();
    }
  }, [open]);

  const fetchSubscribers = async () => {
    try {
      const response = await axios.get('/api/subscribers');
      if (response.data && response.data.subscribers) {
        setSubscribers(response.data.subscribers);
      }
    } catch (error) {
      console.error('Error fetching subscribers:', error);
    }
  };

  const handleToggleSubscriber = (email) => {
    setSelectedEmails((prev) => {
      if (prev.includes(email)) {
        return prev.filter((e) => e !== email);
      } else {
        return [...prev, email];
      }
    });
  };

  const handleSend = async () => {
    try {
      let recipients = [...selectedEmails];
      if (manualEmail.trim() !== '') {
        recipients.push(manualEmail.trim());
      }
      recipients = [...new Set(recipients)];

      // Prepare the payload
      const payload = {
        recipients,
        subject: newsletter.headline,
        body: newsletter.content,
        newsletter_id: newsletter.id,
      };
      
      // Add section data for Template3
      if (newsletter.template_id === 2) {
        payload.isTemplate3 = true;
        payload.section1 = newsletter.section1 || '';
        payload.section2 = newsletter.section2 || '';
        payload.section3 = newsletter.section3 || '';
      }
      
      // Send the newsletter
      await axios.post('/api/newsletter/send', payload);
      
      // Show success notification
      setSnackbarOpen(true);
      
      // Update parent state if needed.
      onSend();
      handleClose();
    } catch (error) {
      console.error('Error sending newsletter:', error);
    }
  };

  return (
    <>
      <Modal open={open} onClose={handleClose}>
        <Box sx={{ 
          p: 4, 
          backgroundColor: 'white', 
          margin: 'auto', 
          mt: '10%', 
          width: '80%', 
          maxWidth: '600px',
          maxHeight: '80vh',
          overflowY: 'auto',
          borderRadius: 1,
        }}>
          <Typography variant="h6" component="h2" gutterBottom>
            <TranslatedText>Send Newsletter</TranslatedText>
          </Typography>
          
          <TextField
            fullWidth
            label={<TranslatedText>Recipient Email (manual entry)</TranslatedText>}
            value={manualEmail}
            onChange={(e) => setManualEmail(e.target.value)}
            sx={{ mt: 2, mb: 2 }}
          />
          
          {subscribers.length > 0 ? (
            <>
              <Typography variant="subtitle1" gutterBottom>
                <TranslatedText>Select from your subscriber list:</TranslatedText>
              </Typography>
              <List sx={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #eee', borderRadius: 1 }}>
                {subscribers.map((subscriber) => (
                  <ListItem key={subscriber.email} dense>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedEmails.includes(subscriber.email)}
                          onChange={() => handleToggleSubscriber(subscriber.email)}
                        />
                      }
                      label={<ListItemText primary={subscriber.email} />}
                    />
                  </ListItem>
                ))}
              </List>
            </>
          ) : (
            <Typography variant="body2" color="textSecondary" sx={{ mt: 2, mb: 2 }}>
              <TranslatedText>No subscribers found. Add some subscribers first or use manual entry.</TranslatedText>
            </Typography>
          )}
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Button variant="outlined" onClick={handleClose}>
              <TranslatedText>Cancel</TranslatedText>
            </Button>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleSend}
              disabled={selectedEmails.length === 0 && manualEmail.trim() === ''}
            >
              <TranslatedText>Send Newsletter</TranslatedText>
            </Button>
          </Box>
        </Box>
      </Modal>
      
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={6000} 
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" variant="filled">
          <TranslatedText>Newsletter sent successfully!</TranslatedText>
        </Alert>
      </Snackbar>
    </>
  );
};

export default SendModal;