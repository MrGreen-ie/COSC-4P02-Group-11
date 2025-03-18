import React, { useState, useEffect } from 'react';
import { Modal, Box, Typography, TextField, Button } from '@mui/material';
import axios from 'axios';

const EditModal = ({ open, handleClose, newsletter, onSave }) => {
  const [headline, setHeadline] = useState(newsletter.headline);
  const [summary, setSummary] = useState(newsletter.summary);

  useEffect(() => {
    setHeadline(newsletter.headline);
    setSummary(newsletter.summary);
  }, [newsletter]);

  const handleSave = async () => {
    try {
      const response = await axios.put(`/api/newsletter/${newsletter.id}`, {
        headline,
        summary,
      });
      onSave(response.data);
      handleClose();
    } catch (error) {
      console.error('Error updating newsletter:', error);
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={{ 
        p: 4, 
        backgroundColor: 'white', 
        margin: 'auto', 
        mt: 20, 
        width: '80%', 
        maxWidth: '800px', 
        height: '60%', 
        overflowY: 'auto' 
      }}>
        <Typography variant="h6" component="h2">
          Edit Newsletter
        </Typography>
        <TextField
          fullWidth
          label="Headline"
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
          sx={{ mt: 2, mb: 6 }} // Add margin bottom
        />
        <TextField
          fullWidth
          label="Summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          multiline
          rows={10}
          sx={{ mt: 6 }} // Add margin top
        />
        <Button variant="contained" color="primary" onClick={handleSave} sx={{ mt: 2 }}>
          Save
        </Button>
      </Box>
    </Modal>
  );
};

export default EditModal;