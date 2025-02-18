import React, { useState, useEffect } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  IconButton,
  Typography,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Edit as EditorIcon,
  Description as TemplateIcon,
  AutoStories as AISummaryIcon,
  PostAdd as PostSystemIcon,
  Favorite as FavoriteIcon,
  MailOutline as MailOutlineIcon,
  Logout as LogoutIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

function NavBar({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(true);

  // Redirect to login if user is not authenticated and trying to access protected routes
  useEffect(() => {
    const protectedRoutes = ['/dashboard', '/editor', '/templates', '/ai-summary', '/post-system', '/favourites', '/newsletters', '/history'];
    if (!user && protectedRoutes.includes(location.pathname)) {
      navigate('/login');
    }
  }, [user, location.pathname, navigate]);

  const toggleSidebar = () => {
    setOpen(!open);
  };

  const handleMenuItemClick = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Editor', icon: <EditorIcon />, path: '/editor' },
    { text: 'Templates', icon: <TemplateIcon />, path: '/templates' },
    { text: 'AI Summary', icon: <AISummaryIcon />, path: '/ai-summary' },
    { text: 'Post System', icon: <PostSystemIcon />, path: '/post-system' },
    { text: 'Favourites', icon: <FavoriteIcon />, path: '/favourites' },
    { text: 'Newsletters', icon: <MailOutlineIcon />, path: '/newsletters' },
    { text: 'History', icon: <HistoryIcon />, path: '/history' },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? 240 : 80,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: open ? 240 : 80,
          boxSizing: 'border-box',
          backgroundColor: '#121212',
          color: 'white',
          transition: 'width 0.3s',
        },
      }}
    >
      {/* Sidebar Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          p: 2,
          justifyContent: open ? 'space-between' : 'center',
        }}
      >
        {open && <Typography variant="h6">Content Generator</Typography>}
        <IconButton onClick={toggleSidebar} sx={{ color: 'white' }}>
          <DashboardIcon />
        </IconButton>
      </Box>

      <Divider />

      {/* Main Navigation Items */}
      <List>
        {user ? (
          menuItems.map((item) => (
            <ListItem
              button
              key={item.path}
              onClick={() => handleMenuItemClick(item.path)}
              selected={location.pathname === item.path}
              sx={{
                '&:hover': {
                  backgroundColor: '#444',
                },
                '&.Mui-selected': {
                  backgroundColor: '#333',
                  '&:hover': {
                    backgroundColor: '#444',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ color: 'white' }}>{item.icon}</ListItemIcon>
              {open && <ListItemText primary={item.text} />}
            </ListItem>
          ))
        ) : (
          <>
            <ListItem
              button
              onClick={() => navigate('/login')}
              selected={location.pathname === '/login'}
              sx={{
                '&:hover': {
                  backgroundColor: '#444',
                },
                '&.Mui-selected': {
                  backgroundColor: '#333',
                },
              }}
            >
              <ListItemIcon sx={{ color: 'white' }}>
                <DashboardIcon />
              </ListItemIcon>
              {open && <ListItemText primary="Login" />}
            </ListItem>
            <ListItem
              button
              onClick={() => navigate('/register')}
              selected={location.pathname === '/register'}
              sx={{
                '&:hover': {
                  backgroundColor: '#444',
                },
                '&.Mui-selected': {
                  backgroundColor: '#333',
                },
              }}
            >
              <ListItemIcon sx={{ color: 'white' }}>
                <DashboardIcon />
              </ListItemIcon>
              {open && <ListItemText primary="Register" />}
            </ListItem>
          </>
        )}
      </List>

      {user && (
        <>
          <Divider sx={{ marginTop: 'auto' }} />
          {/* Account Settings and Logout */}
          <List>
            <ListItem button>
              <ListItemIcon sx={{ color: 'white' }}>
                <DashboardIcon />
              </ListItemIcon>
              {open && (
                <ListItemText 
                  primary="Account" 
                  secondary={user.email}
                  sx={{ '& .MuiListItemText-secondary': { color: '#aaa' } }}
                />
              )}
            </ListItem>
            <ListItem button onClick={handleLogout}>
              <ListItemIcon sx={{ color: 'white' }}>
                <LogoutIcon />
              </ListItemIcon>
              {open && <ListItemText primary="Logout" />}
            </ListItem>
          </List>
        </>
      )}
    </Drawer>
  );
}

export default NavBar;