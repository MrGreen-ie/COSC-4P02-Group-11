import React, { useState, useEffect } from 'react';
import { Editor as DraftEditor } from 'draft-js';
import { EditorState } from 'draft-js';
import 'draft-js/dist/Draft.css';
import { 
  Box, 
  Container, 
  Paper, 
  Typography,
  Button
} from '@mui/material';
import '../styles/theme.css';
import TranslatedText from '../components/TranslatedText';

function Editor() {
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Ensure the editor is initialized after the component mounts
    if (!isLoaded) {
      setIsLoaded(true);
      console.log('Editor component mounted');
    }
  }, [isLoaded]);

  const handleEditorChange = (newEditorState) => {
    setEditorState(newEditorState);
    console.log('Editor state changed');
  };

  const handleSave = () => {
    console.log('Content saved!');
    const contentState = editorState.getCurrentContent();
    console.log('Content:', contentState.getPlainText());
  };

  if (!isLoaded) {
    return <div><TranslatedText>Loading editor...</TranslatedText></div>;
  }

  return (
    <Box 
      sx={{ 
        display: 'flex',
        minHeight: '100vh',
        width: '100%'
      }}
    >
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 'var(--spacing-lg)',
          width: { 
            xs: '100%',
            md: `calc(100% - var(--drawer-width))`
          },
          ml: { 
            xs: 0,
            md: 'var(--drawer-width)'
          }
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ mt: 'var(--spacing-xl)', mb: 'var(--spacing-xl)' }}>
            <Typography 
              variant="h4" 
              component="h1" 
              gutterBottom
              sx={{
                color: 'var(--text-primary)',
                fontWeight: 'var(--font-weight-bold)'
              }}
            >
              <TranslatedText>Content Editor</TranslatedText>
            </Typography>
            
            <Paper 
              sx={{ 
                p: 'var(--spacing-md)',
                minHeight: '300px',
                mb: 'var(--spacing-md)',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--border-radius-lg)',
                boxShadow: 'var(--shadow-md)',
                '& .DraftEditor-root': {
                  height: '100%',
                  minHeight: '280px',
                  padding: 'var(--spacing-sm)',
                  cursor: 'text'
                },
                '& .DraftEditor-editorContainer': {
                  height: '100%',
                  minHeight: '280px'
                },
                '& .public-DraftEditor-content': {
                  minHeight: '280px',
                  color: 'var(--text-primary)'
                }
              }}
            >
              <DraftEditor
                editorState={editorState}
                onChange={handleEditorChange}
                placeholder={<TranslatedText>Start typing your content here...</TranslatedText>}
              />
            </Paper>

            <Button 
              variant="contained" 
              sx={{
                background: 'var(--primary)',
                color: 'var(--text-light)',
                fontWeight: 'var(--font-weight-medium)',
                px: 'var(--spacing-lg)',
                py: 'var(--spacing-sm)',
                borderRadius: 'var(--border-radius-md)',
                transition: 'var(--transition-normal)',
                '&:hover': {
                  background: 'var(--primary-light)',
                  boxShadow: 'var(--shadow-lg)',
                  transform: 'translateY(-2px)'
                }
              }}
              onClick={handleSave}
            >
              <TranslatedText>Save Content</TranslatedText>
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

export default Editor; 