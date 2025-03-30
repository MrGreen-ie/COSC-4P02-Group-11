import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Switch,
  FormControlLabel,
} from '@mui/material';
import axios from 'axios';
import TranslatedText from '../components/TranslatedText';

const Translation = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState('fr');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [autoDetect, setAutoDetect] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState('');

  const API_KEY = 'AIzaSyDqkyW03Bw4A5rK1ZlJCzgkYvo0dMzDxjM';
  const API_URL = 'https://translation.googleapis.com/language/translate/v2';
  const DETECT_URL = 'https://translation.googleapis.com/language/translate/v2/detect';

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'French' },
    { code: 'es', name: 'Spanish' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ru', name: 'Russian' },
    { code: 'ar', name: 'Arabic' },
    { code: 'hi', name: 'Hindi' },
    { code: 'pt', name: 'Portuguese' },
  ];

  const detectLanguage = async (text) => {
    if (!text.trim()) return;
    
    try {
      const response = await axios.post(
        `${DETECT_URL}?key=${API_KEY}`,
        {
          q: text
        }
      );

      if (response.data && response.data.data && response.data.data.detections && response.data.data.detections.length > 0) {
        const detected = response.data.data.detections[0][0].language;
        setDetectedLanguage(detected);
        if (autoDetect) {
          setSourceLanguage(detected);
        }
        return detected;
      }
    } catch (error) {
      console.error('Language detection error:', error);
      // Don't set error state here to avoid disrupting the UI
    }
    return null;
  };

  const handleInputChange = (e) => {
    const text = e.target.value;
    setInputText(text);
    
    // Debounce language detection to avoid too many API calls
    if (text.trim().length > 5 && autoDetect) {
      const timeoutId = setTimeout(() => {
        detectLanguage(text);
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  };

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      setError('Please enter text to translate');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // If auto-detect is enabled, detect the language first
      let sourceLang = sourceLanguage;
      if (autoDetect) {
        const detected = await detectLanguage(inputText);
        if (detected) {
          sourceLang = detected;
        }
      }

      const requestBody = {
        q: inputText,
        target: targetLanguage,
        format: 'text'
      };
      
      // Only include source parameter if not using auto-detect
      if (!autoDetect) {
        requestBody.source = sourceLang;
      }

      const response = await axios.post(
        `${API_URL}?key=${API_KEY}`,
        requestBody
      );

      if (response.data && response.data.data && response.data.data.translations) {
        setOutputText(response.data.data.translations[0].translatedText);
        
        // If the translation included detected language info, update the UI
        if (response.data.data.translations[0].detectedSourceLanguage) {
          setDetectedLanguage(response.data.data.translations[0].detectedSourceLanguage);
        }
      } else {
        setError('Translation failed. Please try again.');
      }
    } catch (error) {
      console.error('Translation error:', error);
      setError(error.response?.data?.error?.message || 'An error occurred during translation');
    } finally {
      setLoading(false);
    }
  };

  const handleSwapLanguages = () => {
    if (!autoDetect) {
      setSourceLanguage(targetLanguage);
      setTargetLanguage(sourceLanguage);
      setInputText(outputText);
      setOutputText(inputText);
    } else {
      // If auto-detect is on, just swap the output to input
      setTargetLanguage(sourceLanguage);
      setInputText(outputText);
      setOutputText('');
      setAutoDetect(false); // Turn off auto-detect when swapping
    }
  };

  const handleAutoDetectChange = (e) => {
    setAutoDetect(e.target.checked);
    if (e.target.checked && inputText.trim()) {
      detectLanguage(inputText);
    }
  };

  // Helper function to get language name from code
  const getLanguageName = (code) => {
    const language = languages.find(lang => lang.code === code);
    return language ? language.name : code;
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        background: 'linear-gradient(135deg, #8B0000, #FF4C4C)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 3,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          padding: 4,
          maxWidth: 900,
          width: '100%',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          color: 'white',
          borderRadius: '15px',
        }}
      >
        <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ textAlign: 'center', mb: 4 }}>
          <TranslatedText>Text Translation</TranslatedText>
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            <TranslatedText>{error}</TranslatedText>
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 3 }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <FormControl sx={{ width: autoDetect ? '60%' : '100%' }}>
                <InputLabel id="source-language-label" sx={{ color: 'white' }}>
                  <TranslatedText>Source Language</TranslatedText>
                </InputLabel>
                <Select
                  labelId="source-language-label"
                  value={sourceLanguage}
                  onChange={(e) => setSourceLanguage(e.target.value)}
                  disabled={autoDetect}
                  sx={{
                    color: 'white',
                    '.MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#ffdd57' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#ffdd57' },
                    '.MuiSvgIcon-root': { color: 'white' }
                  }}
                >
                  {languages.map((lang) => (
                    <MenuItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControlLabel
                control={
                  <Switch 
                    checked={autoDetect}
                    onChange={handleAutoDetectChange}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#ffdd57',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 221, 87, 0.08)',
                        },
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#ffdd57',
                      },
                    }}
                  />
                }
                label={<TranslatedText>Auto Detect</TranslatedText>}
                sx={{ 
                  color: 'white',
                  ml: 1,
                  display: { xs: 'none', sm: 'flex' }
                }}
              />
            </Box>
            
            {autoDetect && detectedLanguage && (
              <Typography variant="body2" sx={{ mb: 1, color: '#ffdd57', textAlign: 'left' }}>
                <TranslatedText>Detected:</TranslatedText> {getLanguageName(detectedLanguage)}
              </Typography>
            )}
            
            <TextField
              fullWidth
              multiline
              rows={6}
              placeholder="Enter text to translate"
              value={inputText}
              onChange={handleInputChange}
              sx={{
                textarea: { color: 'white' },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'white' },
                  '&:hover fieldset': { borderColor: '#ffdd57' },
                  '&.Mui-focused fieldset': { borderColor: '#ffdd57' },
                },
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 1 }}>
            <Button
              onClick={handleSwapLanguages}
              sx={{
                minWidth: { xs: '100%', md: 'auto' },
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                '&:hover': { background: 'rgba(255, 255, 255, 0.3)' },
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                p: 0,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              ⇄
            </Button>
          </Box>

          <Box sx={{ flex: 1 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="target-language-label" sx={{ color: 'white' }}>
                <TranslatedText>Target Language</TranslatedText>
              </InputLabel>
              <Select
                labelId="target-language-label"
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                sx={{
                  color: 'white',
                  '.MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#ffdd57' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#ffdd57' },
                  '.MuiSvgIcon-root': { color: 'white' }
                }}
              >
                {languages.map((lang) => (
                  <MenuItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              multiline
              rows={6}
              placeholder="Translation will appear here"
              value={outputText}
              InputProps={{
                readOnly: true,
              }}
              sx={{
                textarea: { color: 'white' },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'white' },
                  '&:hover fieldset': { borderColor: '#ffdd57' },
                  '&.Mui-focused fieldset': { borderColor: '#ffdd57' },
                },
              }}
            />
          </Box>
        </Box>

        <Button
          onClick={handleTranslate}
          disabled={loading}
          fullWidth
          variant="contained"
          sx={{
            mt: 2,
            mb: 2,
            background: 'linear-gradient(135deg, #ffdd57, #FFD700)',
            color: '#8B0000',
            fontWeight: 'bold',
            borderRadius: '30px',
            '&:hover': { background: '#fff', color: '#8B0000' },
            height: '50px',
          }}
        >
          {loading ? <CircularProgress size={24} /> : <TranslatedText>Translate</TranslatedText>}
        </Button>

        <Typography variant="caption" sx={{ display: 'block', mt: 2, color: 'rgba(255, 255, 255, 0.7)' }}>
          <TranslatedText>Powered by Google Translate API</TranslatedText>
        </Typography>
      </Paper>
    </Box>
  );
};

export default Translation;
