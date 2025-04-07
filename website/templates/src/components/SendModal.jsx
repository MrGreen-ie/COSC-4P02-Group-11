import React, { useState, useEffect } from 'react';
import { Modal, Box, Typography, TextField, Button, List, ListItem, FormControlLabel, Checkbox, IconButton, Snackbar, Alert } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

const SendModal = ({ open, handleClose, newsletter, onSend }) => {
  const [subscribers, setSubscribers] = useState([]);
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [manualEmail, setManualEmail] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // Reset manualEmail and selectedEmails when modal opens.
  useEffect(() => {
    if (open) {
      setManualEmail('');
      setSelectedEmails([]);
      axios.get('/api/subscribers')
        .then(response => {
          setSubscribers(response.data.subscribers || []);
        })
        .catch(error => {
          console.error('Error fetching subscribers:', error);
        });
    }
  }, [open]);

  const handleCheckboxChange = (email) => {
    setSelectedEmails(prev => {
      if (prev.includes(email)) {
        return prev.filter(e => e !== email);
      } else {
        return [...prev, email];
      }
    });
  };

  const handleDeleteSubscriber = async (subscriberId) => {
    try {
      await axios.delete(`/api/subscribers/${subscriberId}`);
      // Update local state by filtering out the deleted subscriber.
      setSubscribers(prev => prev.filter(sub => sub.id !== subscriberId));
      // Also remove from selectedEmails if present.
      setSelectedEmails(prev => prev.filter(email => {
        const sub = subscribers.find(s => s.id === subscriberId);
        return sub ? sub.email !== email : true;
      }));
    } catch (error) {
      console.error('Error deleting subscriber:', error);
    }
  };

  const handleSend = async () => {
    try {
      let recipients = [...selectedEmails];
      if (manualEmail.trim() !== '') {
        recipients.push(manualEmail.trim());
      }
      recipients = [...new Set(recipients)];

      await axios.post('/api/newsletter/subscribe', {
        recipients,
        subject: newsletter.headline,
        body: newsletter.summary,
        newsletter_id: newsletter.id,
      });
      
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
        <Box sx={{ p: 4, backgroundColor: 'white', margin: 'auto', mt: 40, width: 400 }}>
          <Typography variant="h6" component="h2">
            Send Newsletter
          </Typography>
          <TextField
            fullWidth
            label="Recipient Email (manual entry)"
            value={manualEmail}
            onChange={(e) => setManualEmail(e.target.value)}
            sx={{ mt: 2 }}
          />
          <Typography variant="subtitle1" sx={{ mt: 2 }}>
            Or select from your subscriber list:
          </Typography>
          <List sx={{ maxHeight: 200, overflowY: 'auto' }}>
            {subscribers.map((subscriber) => (
              <ListItem key={subscriber.id} disablePadding
                secondaryAction={
                  <IconButton edge="end" onClick={() => handleDeleteSubscriber(subscriber.id)}>
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedEmails.includes(subscriber.email)}
                      onChange={() => handleCheckboxChange(subscriber.email)}
                    />
                  }
                  label={subscriber.email}
                />
              </ListItem>
            ))}
          </List>
          <Button variant="contained" color="primary" onClick={handleSend} sx={{ mt: 2 }}>
            Send
          </Button>
        </Box>
      </Modal>
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={1500}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ bottom: 30 }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
          Email sent successfully!
        </Alert>
      </Snackbar>
    </>
  );
};

export default SendModal;