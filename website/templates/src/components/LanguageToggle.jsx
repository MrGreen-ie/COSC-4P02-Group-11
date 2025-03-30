import React, { useContext } from 'react';
import { 
  Button, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  ListItemText,
  Typography
} from '@mui/material';
import { LanguageContext } from '../contexts/LanguageContext';
import { Language as LanguageIcon } from '@mui/icons-material';

/**
 * A component that provides a dropdown menu for language selection
 * @returns {React.ReactElement} - The language toggle component
 */
const LanguageToggle = () => {
  const { language, availableLanguages, changeLanguage } = useContext(LanguageContext);
  const [anchorEl, setAnchorEl] = React.useState(null);
  
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleLanguageChange = (langCode) => {
    changeLanguage(langCode);
    handleClose();
  };
  
  // Get the current language name
  const currentLanguage = availableLanguages.find(lang => lang.code === language);
  
  return (
    <>
      <Button
        color="inherit"
        startIcon={<LanguageIcon />}
        onClick={handleClick}
        sx={{
          color: 'var(--text-light)',
          fontWeight: 'var(--font-weight-bold)',
          textTransform: 'none',
          transition: 'var(--transition-normal)',
          '&:hover': { color: 'var(--accent)' },
        }}
      >
        <Typography variant="body1">
          {currentLanguage ? currentLanguage.name : 'English'}
        </Typography>
      </Button>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          elevation: 3,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {availableLanguages.map((lang) => (
          <MenuItem 
            key={lang.code}
            selected={lang.code === language}
            onClick={() => handleLanguageChange(lang.code)}
            sx={{
              '&.Mui-selected': {
                backgroundColor: 'rgba(255, 221, 87, 0.15)',
              },
              '&.Mui-selected:hover': {
                backgroundColor: 'rgba(255, 221, 87, 0.25)',
              },
            }}
          >
            <ListItemText primary={lang.name} />
            {lang.code === language && (
              <ListItemIcon sx={{ minWidth: 'auto', ml: 1 }}>
                <span>✓</span>
              </ListItemIcon>
            )}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default LanguageToggle;
