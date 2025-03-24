import React, { useEffect, useState } from 'react';
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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material';
import axios from 'axios';
import EditModal from '../components/EditModal';
import SendModal from '../components/SendModal';

const Newsletters = () => {
  const [newsletters, setNewsletters] = useState([]);
  const [sentThisMonth, setSentThisMonth] = useState(0);
  const [selectedNewsletter, setSelectedNewsletter] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [plan, setPlan] = useState('Free'); // Default to 'Free', update based on user session

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch('/api/user-info'); // Backend API to fetch user info
        const data = await response.json();
        if (response.ok) {
          setPlan(data.role); // Update the plan state (e.g., 'Free', 'Pro', 'Admin')
        } else {
          console.error('Failed to fetch user plan:', data.error);
        }
      } catch (error) {
        console.error('Error fetching user plan:', error);
      }
    };

    fetchUserInfo();
    fetchNewsletters();
    fetchSentThisMonth();
    console.log("Detected user plan/role:", plan);

  }, []);


  const fetchNewsletters = async () => {
    try {
      const response = await axios.get('/api/newsletter');
      setNewsletters(response.data.summaries);
    } catch (error) {
      console.error('Error fetching newsletters:', error);
    }
  };

  const fetchSentThisMonth = async () => {
    try {
      const response = await axios.get('/api/newsletter/sent-this-month');
      setSentThisMonth(response.data.sent_this_month);
    } catch (error) {
      console.error('Error fetching sent newsletters count:', error);
    }
  };

  const handleAddNewsletter = async () => {
    try {
      console.log("Current role:", plan);
      
      // Check if user is on the Free plan
      const isFreeUser = String(plan).toLowerCase() === 'free';

      if (isFreeUser && newsletters.length >= 7) {
        const oldestNewsletter = newsletters[0];
        await axios.delete(`/api/newsletter/${oldestNewsletter.id}`);
        setNewsletters(prev => prev.slice(1));
      }

  
      // Create new newsletter
      const newNewsletter = {
        id: Date.now(), // Temporary ID
        headline: 'New Newsletter',
        summary: 'This is a new newsletter summary.',
        created_at: new Date().toISOString(),
      };
  
      const response = await axios.post('/api/newsletter', newNewsletter);
      setNewsletters(prev => [...prev, response.data]);
  
    } catch (error) {
      console.error('Error adding newsletter:', error);
    }
  };
  

  const handleEdit = (newsletter) => {
    setSelectedNewsletter(newsletter);
    setIsEditModalOpen(true);
  };

  const handleSend = (newsletter) => {
    setSelectedNewsletter(newsletter);
    setIsSendModalOpen(true);
  };

  const handleSave = (updatedNewsletter) => {
    setNewsletters((prevNewsletters) =>
      prevNewsletters.map((newsletter) =>
        newsletter.id === updatedNewsletter.id ? updatedNewsletter : newsletter
      )
    );
    setIsEditModalOpen(false);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/newsletter/${id}`);
      setNewsletters((prevNewsletters) => prevNewsletters.filter((newsletter) => newsletter.id !== id));
    } catch (error) {
      console.error('Error deleting newsletter:', error);
    }
  };

  const handleSendComplete = async () => {
    try {
      const response = await axios.get('/api/newsletter/sent-this-month');
      setSentThisMonth(response.data.sent_this_month);
    } catch (error) {
      console.error('Error fetching sent newsletters count:', error);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 'var(--spacing-xl)', mb: 'var(--spacing-xl)' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb="var(--spacing-xl)">
        <Typography variant="h4" component="h1" className="heading-primary">
          Newsletters
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddNewsletter}
          sx={{
            background: 'var(--primary)',
            '&:hover': {
              background: 'var(--primary-light)',
            },
          }}
        >
          Create Newsletter
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Stats Overview */}
        <Grid item xs={12}>
          <Paper
            sx={{
              p: 'var(--spacing-md)',
              display: 'flex',
              gap: 'var(--spacing-md)',
              boxShadow: 'var(--shadow-md)',
              borderRadius: 'var(--border-radius-lg)',
            }}
          >
            <Box flex={1} textAlign="center">
              <Typography variant="h6">Total Newsletters</Typography>
              <Typography variant="h4">{newsletters.length}</Typography>
            </Box>
            <Divider orientation="vertical" flexItem />
            <Box flex={1} textAlign="center">
              <Typography variant="h6">Sent This Month</Typography>
              <Typography variant="h4">{sentThisMonth}</Typography>
            </Box>
            <Divider orientation="vertical" flexItem />
            <Box flex={1} textAlign="center">
              <Typography variant="h6">Current Plan</Typography>
              <Typography variant="h4">{plan}</Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Newsletter List */}
        {newsletters.length === 0 ? (
          <Grid item xs={12}>
            <Paper sx={{ p: 4, textAlign: 'center' }}>
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
              <Card className="card">
                <CardContent>
                  <Typography variant="h6" component="h2" noWrap className="heading-secondary">
                    {newsletter.headline}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom className="text-secondary">
                    Created At: {new Date(newsletter.created_at).toLocaleString()}
                  </Typography>
                  <Typography variant="body2" noWrap className="text-primary">
                    {newsletter.summary}
                  </Typography>
                </CardContent>
                <CardActions>
                  <IconButton size="small" title="Edit" onClick={() => handleEdit(newsletter)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small" title="Send" onClick={() => handleSend(newsletter)}>
                    <SendIcon />
                  </IconButton>
                  <IconButton size="small" title="View Stats">
                    <AnalyticsIcon />
                  </IconButton>
                  <IconButton size="small" title="Delete" onClick={() => handleDelete(newsletter.id)}>
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* Modals */}
      {selectedNewsletter && (
        <EditModal
          open={isEditModalOpen}
          handleClose={() => setIsEditModalOpen(false)}
          newsletter={selectedNewsletter}
          onSave={handleSave}
        />
      )}

      {selectedNewsletter && (
        <SendModal
          open={isSendModalOpen}
          handleClose={() => setIsSendModalOpen(false)}
          newsletter={selectedNewsletter}
          onSend={handleSendComplete}
        />
      )}
    </Container>
  );
};

export default Newsletters;
