import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  FormControlLabel,
  Checkbox,
  IconButton,
  Snackbar,
  Alert,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

const SendModal = ({ open, handleClose, newsletter, onSend }) => {
  const [subscribers, setSubscribers] = useState([]);
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [manualEmail, setManualEmail] = useState('');
  const [scheduleDate, setScheduleDate] = useState(new Date());
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: '' });

  useEffect(() => {
    if (open) {
      setManualEmail('');
      setSelectedEmails([]);
      axios
        .get('/api/subscribers')
        .then((response) => {
          setSubscribers(response.data.subscribers || []);
        })
        .catch((error) => {
          console.error('Error fetching subscribers:', error);
        });
    }
  }, [open]);

  const handleCheckboxChange = (email) => {
    setSelectedEmails((prev) =>
      prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email]
    );
  };

  const handleDeleteSubscriber = async (subscriberId) => {
    try {
      await axios.delete(`/api/subscribers/${subscriberId}`);
      setSubscribers((prev) => prev.filter((sub) => sub.id !== subscriberId));
      setSelectedEmails((prev) =>
        prev.filter((email) => {
          const sub = subscribers.find((s) => s.id === subscriberId);
          return sub ? sub.email !== email : true;
        })
      );
    } catch (error) {
      console.error('Error deleting subscriber:', error);
    }
  };

  const handleSendNow = async () => {
    try {
      const recipients = [...new Set([...selectedEmails, manualEmail.trim()])];
      await axios.post('/api/newsletter/subscribe', {
        recipients,
        subject: newsletter.headline,
        body: newsletter.summary,
        newsletter_id: newsletter.id,
      });
      setSnackbarOpen(true);
      onSend();
      handleClose();
    } catch (error) {
      console.error('Error sending newsletter:', error);
    }
  };

  const handleSchedule = async () => {
    try {
      // Check if the selected date is in the past
      if (scheduleDate < new Date()) {
        setNotification({
          open: true,
          message: 'Cannot schedule a time in the past. Please select a valid time.',
          severity: 'error',
        });
        return;
      }

      // Combine selected emails and manual email
      const recipients = [...new Set([...selectedEmails, manualEmail.trim()])].filter((email) => email);

      if (recipients.length === 0) {
        setNotification({
          open: true,
          message: 'Please select at least one recipient or enter a valid email.',
          severity: 'error',
        });
        return;
      }

      console.log('Recipients:', recipients); // Debugging log
      console.log('Scheduled Date:', scheduleDate.toISOString()); // Debugging log

      // Send the schedule request to the backend
      const response = await axios.post('/api/newsletter/schedule', {
        newsletter_id: newsletter.id,
        scheduled_time: scheduleDate.toISOString(),
        recipients,
      });

      console.log('Schedule response:', response.data); // Debugging log
      setNotification({
        open: true,
        message: 'Newsletter scheduled successfully!',
        severity: 'success',
      });
      handleClose();
    } catch (error) {
      console.error('Error scheduling newsletter:', error);
      setNotification({
        open: true,
        message: 'Failed to schedule newsletter. Please try again.',
        severity: 'error',
      });
    }
  };

  return (
    <>
      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            p: 4,
            backgroundColor: 'white',
            margin: 'auto',
            mt: 40,
            width: 500,
            maxHeight: '80vh',
            overflowY: 'auto',
            borderRadius: 2,
            boxShadow: 24,
          }}
        >
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
          <List sx={{ maxHeight: 300, overflowY: 'auto' }}>
            {subscribers.map((subscriber) => (
              <ListItem
                key={subscriber.id}
                disablePadding
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

          {/* Add DateTimePicker for scheduling */}
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateTimePicker
              label="Schedule Date & Time"
              value={scheduleDate}
              onChange={(newValue) => {
                console.log('Selected Date & Time:', newValue); // Debugging log
                setScheduleDate(newValue);
              }}
              minDateTime={new Date()} // Disable past dates and times
              minutesStep={1} // Allow all 60 minutes
              renderInput={(params) => <TextField {...params} fullWidth sx={{ mt: 2 }} />}
            />
          </LocalizationProvider>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button variant="contained" color="primary" onClick={handleSendNow}>
              Send Now
            </Button>
            <Button variant="outlined" color="secondary" onClick={handleSchedule}>
              Schedule
            </Button>
          </Box>
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
          Newsletter {scheduleDate ? 'scheduled' : 'sent'} successfully!
        </Alert>
      </Snackbar>

      {notification.open && (
        <Snackbar
          open={notification.open}
          autoHideDuration={3000}
          onClose={() => setNotification({ open: false, message: '', severity: '' })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setNotification({ open: false, message: '', severity: '' })}
            severity={notification.severity}
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      )}
    </>
  );
};

export default SendModal;