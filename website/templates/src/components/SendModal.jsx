import React, { useState } from 'react';
import { Modal, Box, Typography, TextField, Button } from '@mui/material';
import axios from 'axios';

const SendModal = ({ open, handleClose, newsletter, onSend }) => {
  const [email, setEmail] = useState('');

  const handleSend = async () => {
    try {
      await axios.post('/api/newsletter/subscribe', {
        recipient: email,
        subject: newsletter.headline,
        body: newsletter.summary,
        newsletter_id: newsletter.id,
      });
      onSend();
      handleClose();
    } catch (error) {
      console.error('Error sending newsletter:', error);
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={{ p: 4, backgroundColor: 'white', margin: 'auto', mt: 40, width: 400 }}>
        <Typography variant="h6" component="h2">
          Send Newsletter
        </Typography>
        <TextField
          fullWidth
          label="Recipient's Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{ mt: 2 }}
        />
        <Button variant="contained" color="primary" onClick={handleSend} sx={{ mt: 2 }}>
          Send
        </Button>
      </Box>
    </Modal>
  );
};

export default SendModal;