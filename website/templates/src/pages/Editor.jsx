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
    return <div>Loading editor...</div>;
  }

  return (
    <Box 
      sx={{ 
        display: 'flex',
        minHeight: '100vh',
      }}
    >
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          marginLeft: '240px', // Match the width of the expanded NavBar
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Content Editor
            </Typography>
            
            <Paper 
              sx={{ 
                p: 2,
                minHeight: '300px',
                mb: 2,
                border: '1px solid #ccc',
                '& .DraftEditor-root': {
                  height: '100%',
                  minHeight: '280px',
                  padding: '10px',
                  cursor: 'text'
                },
                '& .DraftEditor-editorContainer': {
                  height: '100%',
                  minHeight: '280px'
                },
                '& .public-DraftEditor-content': {
                  minHeight: '280px'
                }
              }}
            >
              <DraftEditor
                editorState={editorState}
                onChange={handleEditorChange}
                placeholder="Start typing your content here..."
              />
            </Paper>

            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleSave}
            >
              Save Content
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

export default Editor; 