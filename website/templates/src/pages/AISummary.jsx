import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
  Divider
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

const AISummary = () => {
  // State management
  const [length, setLength] = useState(50);
  const [tone, setTone] = useState('professional');
  const [originalContent, setOriginalContent] = useState('Your original content will appear here...');
  const [summary, setSummary] = useState('AI summary will be generated here...');

  // Handlers
  const handleLengthChange = (event, newValue) => {
    setLength(newValue);
  };

  const handleToneChange = (event) => {
    setTone(event.target.value);
  };

  const handleRegenerate = () => {
    // TODO: Implement regeneration logic
    console.log('Regenerating with:', { length, tone });
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Configuration Panel */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Summary Configuration
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography gutterBottom>Summary Length</Typography>
            <Slider
              value={length}
              onChange={handleLengthChange}
              valueLabelDisplay="auto"
              step={10}
              marks
              min={10}
              max={100}
              sx={{ mt: 2 }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Tone</InputLabel>
              <Select
                value={tone}
                label="Tone"
                onChange={handleToneChange}
              >
                <MenuItem value="professional">Professional</MenuItem>
                <MenuItem value="casual">Casual</MenuItem>
                <MenuItem value="academic">Academic</MenuItem>
                <MenuItem value="friendly">Friendly</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Side-by-Side Display */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, height: '400px', overflow: 'auto' }}>
            <Typography variant="h6" gutterBottom>
              Original Content
            </Typography>
            <Typography variant="body1">
              {originalContent}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, height: '400px', overflow: 'auto' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                AI Summary
              </Typography>
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={handleRegenerate}
                size="small"
              >
                Regenerate
              </Button>
            </Box>
            <Typography variant="body1">
              {summary}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AISummary;
