import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Divider,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material';

const Newsletters = () => {
  const [newsletters, setNewsletters] = useState([]);
  const [open, setOpen] = useState(false);
  const [emailDetails, setEmailDetails] = useState({
    recipient: '',
    subject: '',
    body: '',
  });
  const [createOpen, setCreateOpen] = useState(false);
  const [newNewsletter, setNewNewsletter] = useState({
    title: '',
    description: '',
  });
  const [editOpen, setEditOpen] = useState(false);
  const [currentNewsletter, setCurrentNewsletter] = useState(null);

  useEffect(() => {
    // Fetch newsletters data from backend or use mock data
    const fetchNewsletters = async () => {
      // Replace with actual API call
      const mockData = [
        {
          id: 1,
          title: 'Newsletter 1',
          lastModified: '2025-03-01',
          description: 'Description of Newsletter 1',
        },
        {
          id: 2,
          title: 'Newsletter 2',
          lastModified: '2025-03-01',
          description: 'Description of Newsletter 2',
        },
      ];
      setNewsletters(mockData);
    };

    fetchNewsletters();
  }, []);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmailDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleSendEmail = async () => {
    if (!emailDetails.recipient || !emailDetails.subject || !emailDetails.body) {
      alert('Please fill in all fields.');
      return;
    }

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailDetails),
      });

      if (response.ok) {
        alert('Email sent successfully');
        handleClose();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Error sending email');
    }
  };

  const handleCreateOpen = () => {
    setCreateOpen(true);
  };

  const handleCreateClose = () => {
    setCreateOpen(false);
  };

  const handleCreateChange = (e) => {
    const { name, value } = e.target;
    setNewNewsletter((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateNewsletter = async () => {
    // Add logic to create a new newsletter (e.g., API call)
    // For now, we'll just add it to the mock data
    const newId = newsletters.length + 1;
    const newNewsletterData = {
      id: newId,
      title: newNewsletter.title,
      lastModified: new Date().toISOString().split('T')[0],
      description: newNewsletter.description,
    };
    setNewsletters((prev) => [...prev, newNewsletterData]);
    handleCreateClose();
  };

  const handleEditOpen = (newsletter) => {
    setCurrentNewsletter(newsletter);
    setEditOpen(true);
  };

  const handleEditClose = () => {
    setEditOpen(false);
    setCurrentNewsletter(null);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setCurrentNewsletter((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditNewsletter = async () => {
    // Add logic to edit the newsletter (e.g., API call)
    // For now, we'll just update the mock data
    setNewsletters((prev) =>
      prev.map((newsletter) =>
        newsletter.id === currentNewsletter.id ? currentNewsletter : newsletter
      )
    );
    handleEditClose();
  };

  const handleDeleteNewsletter = (id) => {
    // Add logic to delete the newsletter (e.g., API call)
    // For now, we'll just remove it from the mock data
    setNewsletters((prev) => prev.filter((newsletter) => newsletter.id !== id));
  };

  const handleViewStats = (newsletter) => {
    // Add logic to view stats for the newsletter (e.g., navigate to a stats page)
    console.log('Viewing stats for:', newsletter);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Newsletters
        </Typography>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleCreateOpen}>
          Create Newsletter
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Stats Overview */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', gap: 2 }}>
            <Box flex={1} textAlign="center">
              <Typography variant="h6">Total Newsletters</Typography>
              <Typography variant="h4">{newsletters.length}</Typography>
            </Box>
            <Divider orientation="vertical" flexItem />
            <Box flex={1} textAlign="center">
              <Typography variant="h6">Sent This Month</Typography>
              <Typography variant="h4">0</Typography>
            </Box>
            <Divider orientation="vertical" flexItem />
            <Box flex={1} textAlign="center">
              <Typography variant="h6">Average Open Rate</Typography>
              <Typography variant="h4">0%</Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Newsletter List */}
        {newsletters.length === 0 ? (
          <Grid item xs={12}>
            <Paper sx={{ p: 4, textAlign: "center" }}>
              <Typography variant="h6" color="textSecondary">
                No newsletters created yet
              </Typography>
              <Typography variant="body1" color="textSecondary" sx={{ mt: 1 }}>
                Create your first newsletter to get started
              </Typography>
            </Paper>
          </Grid>
        ) : (
          newsletters.map((newsletter) => (
            <Grid item xs={12} md={6} lg={4} key={newsletter.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="h2" noWrap>
                    {newsletter.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Last modified: {newsletter.lastModified}
                  </Typography>
                  <Typography variant="body2" noWrap>
                    {newsletter.description}
                  </Typography>
                </CardContent>
                <CardActions>
                  <IconButton size="small" title="Edit" onClick={() => handleEditOpen(newsletter)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small" title="Send" onClick={handleClickOpen}>
                    <SendIcon />
                  </IconButton>
                  <IconButton size="small" title="View Stats" onClick={() => handleViewStats(newsletter)}>
                    <AnalyticsIcon />
                  </IconButton>
                  <IconButton size="small" title="Delete" onClick={() => handleDeleteNewsletter(newsletter.id)}>
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* Email Dialog */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Send Newsletter</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="recipient"
            label="Recipient"
            type="email"
            fullWidth
            variant="outlined"
            value={emailDetails.recipient}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="subject"
            label="Subject"
            type="text"
            fullWidth
            variant="outlined"
            value={emailDetails.subject}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="body"
            label="Body"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={4}
            value={emailDetails.body}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSendEmail} color="primary">
            Send
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Newsletter Dialog */}
      <Dialog open={createOpen} onClose={handleCreateClose}>
        <DialogTitle>Create Newsletter</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="title"
            label="Title"
            type="text"
            fullWidth
            variant="outlined"
            value={newNewsletter.title}
            onChange={handleCreateChange}
          />
          <TextField
            margin="dense"
            name="description"
            label="Description"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={4}
            value={newNewsletter.description}
            onChange={handleCreateChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCreateClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleCreateNewsletter} color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Newsletter Dialog */}
      <Dialog open={editOpen} onClose={handleEditClose}>
        <DialogTitle>Edit Newsletter</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="title"
            label="Title"
            type="text"
            fullWidth
            variant="outlined"
            value={currentNewsletter?.title || ''}
            onChange={handleEditChange}
          />
          <TextField
            margin="dense"
            name="description"
            label="Description"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={4}
            value={currentNewsletter?.description || ''}
            onChange={handleEditChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleEditNewsletter} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Newsletters;
