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

  useEffect(() => {
    // Fetch summaries from the backend
    const fetchSummaries = async () => {
      try {
        const response = await axios.get('/api/newsletter');
        setNewsletters(response.data.summaries);
      } catch (error) {
        console.error('Error fetching summaries:', error);
      }
    };

    // Fetch sent newsletters count for this month
    const fetchSentThisMonth = async () => {
      try {
        const response = await axios.get('/api/newsletter/sent-this-month');
        setSentThisMonth(response.data.sent_this_month);
      } catch (error) {
        console.error('Error fetching sent newsletters count:', error);
      }
    };

    fetchSummaries();
    fetchSentThisMonth();
  }, []);

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
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Newsletters
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
        >
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
              <Typography variant="h4">{sentThisMonth}</Typography>
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
            <Paper sx={{ p: 4, textAlign:"center" }}>
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
                    {newsletter.headline}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Created At: {new Date(newsletter.created_at).toLocaleString()}
                  </Typography>
                  <Typography variant="body2" noWrap>
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
