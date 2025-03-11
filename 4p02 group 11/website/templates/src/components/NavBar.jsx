import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Box,
  Button
} from '@mui/material';
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  Home as HomeIcon,
  Info as InfoIcon,
  Contacts as ContactsIcon,
  PersonAdd as PersonAddIcon,
  Login as LoginIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import logo from '../assests/logo.png';

function NavBar({ user, onLogout }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const toggleSidebar = () => setOpen(!open);

  const handleNavigation = (path) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <>
      {/* Top Navbar */}
      <AppBar
        position="fixed"
        sx={{
          background: 'linear-gradient(135deg, #8B0000, #FF4C4C)',
          height: { xs: '56px', sm: '64px' },
          display: 'flex',
          justifyContent: 'center',
          border: 'none',
          boxShadow: 'none',
          zIndex: (theme) => theme.zIndex.drawer + 1
        }}
      >
        <Toolbar sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          width: '100%',
          minHeight: { xs: '56px', sm: '64px' },
          px: { xs: 1, sm: 2 }
        }}>
          {/* Left Side: Hamburger Menu + Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={toggleSidebar} sx={{ color: '#fff', mr: 1 }}>
              {open ? <CloseIcon /> : <MenuIcon />}
            </IconButton>
            <img 
                src={logo} 
                alt="Logo" 
                 style={{ height: '120px', width: 'auto', cursor: 'pointer' }} 
                onClick={() => handleNavigation('/home')} 
              />
          </Box>

          {/* Center: Navigation Links */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 3 }}>
            {[
              { label: 'Home', path: '/home' },
              { label: 'About Us', path: '/aboutus' },
              { label: 'Contact Us', path: '/contact' },
              { label: 'Pricing', path: '/pricing' }
            ].map((item) => (
              <Button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                sx={{
                  color: 'white',
                  fontWeight: 'bold',
                  textTransform: 'none',
                  transition: '0.3s',
                  '&:hover': { color: '#ffdd57' },
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>

          {/* Right Side: Sign Up & Login */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
            {!user && (
              <>
                <Button
                  onClick={() => handleNavigation('/register')}
                  sx={{
                    color: 'white',
                    fontWeight: 'bold',
                    border: '1px solid white',
                    borderRadius: '20px',
                    px: 2,
                    transition: '0.3s',
                    '&:hover': { background: '#fff', color: '#8B0000' },
                  }}
                >
                  Sign Up
                </Button>
                <Button
                  onClick={() => handleNavigation('/login')}
                  sx={{
                    color: 'white',
                    fontWeight: 'bold',
                    border: '1px solid white',
                    borderRadius: '20px',
                    px: 2,
                    transition: '0.3s',
                    '&:hover': { background: '#fff', color: '#8B0000' },
                  }}
                >
                  Login
                </Button>
              </>
            )}
            {user && (
              <Button
                onClick={onLogout}
                sx={{
                  color: 'white',
                  fontWeight: 'bold',
                  border: '1px solid white',
                  borderRadius: '20px',
                  px: 2,
                  transition: '0.3s',
                  '&:hover': { background: '#fff', color: '#8B0000' },
                }}
              >
                Logout
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer with Icons */}
      <Drawer
        anchor="left"
        open={open}
        onClose={toggleSidebar}
        sx={{
          '& .MuiDrawer-paper': {
            width: 250,
            background: '#8B0000',
            color: 'white',
            paddingTop: '10px',
          },
        }}
      >
        <List>
          {[
            { label: 'Home', path: '/home', icon: <HomeIcon /> },
            { label: 'About Us', path: '/aboutus', icon: <InfoIcon /> },
            { label: 'Contact Us', path: '/contact', icon: <ContactsIcon /> },
            { label: 'Pricing', path: '/pricing', icon: <ContactsIcon /> }
          ].map((item) => (
            <ListItem button key={item.path} onClick={() => handleNavigation(item.path)}>
              <ListItemIcon sx={{ color: 'white' }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItem>
          ))}

          {!user && (
            <>
              <ListItem button onClick={() => handleNavigation('/register')}>
                <ListItemIcon sx={{ color: 'white' }}><PersonAddIcon /></ListItemIcon>
                <ListItemText primary="Sign Up" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation('/login')}>
                <ListItemIcon sx={{ color: 'white' }}><LoginIcon /></ListItemIcon>
                <ListItemText primary="Login" />
              </ListItem>
            </>
          )}

          {user && (
            <ListItem button onClick={onLogout}>
              <ListItemIcon sx={{ color: 'white' }}><LogoutIcon /></ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          )}
        </List>
      </Drawer>
    </>
  );
}

export default NavBar;