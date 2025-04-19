import React, { useState } from "react";
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
  Button,
  Divider,
  Typography,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  Home as HomeIcon,
  Info as InfoIcon,
  Contacts as ContactsIcon,
  PersonAdd as PersonAddIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  Edit as EditIcon,
  Description as TemplateIcon,
  AutoFixHigh as AIIcon,
  Share as PostIcon,
  Star as FavoritesIcon,
  Email as NewsletterIcon,
  History as HistoryIcon,
  Translate as TranslateIcon,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assests/logo.png";
import "../styles/theme.css";
import LanguageToggle from "./LanguageToggle";

function NavBar({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const toggleSidebar = () => setOpen(!open);

  const handleNavigation = (path) => {
    navigate(path);
    setOpen(false);
  };

  // Define navigation items based on authentication status
  const publicNavItems = [
    { label: "Home", path: "/home", icon: <HomeIcon /> },
    { label: "About Us", path: "/aboutus", icon: <InfoIcon /> },
    { label: "Contact Us", path: "/contact", icon: <ContactsIcon /> },
    { label: "Pricing", path: "/pricing", icon: <ContactsIcon /> },
  ];

  const authenticatedNavItems = [
    { label: "Dashboard", path: "/dashboard", icon: <HomeIcon /> },
  ];

  const protectedNavItems = [
    { label: "Draft", path: "/templates", icon: <TemplateIcon /> },
    { label: "Editor", path: "/editor", icon: <EditIcon /> },
    { label: "AI Summary", path: "/ai-summary", icon: <AIIcon /> },
    { label: "Post HUB", path: "/post-hub", icon: <PostIcon /> },
    { label: "Articles", path: "/articles", icon: <FavoritesIcon /> },
    { label: "History", path: "/history", icon: <HistoryIcon /> },
    { label: "Translation", path: "/translation", icon: <TranslateIcon /> },
  ];

  // Get current navigation items based on auth status
  const currentNavItems = user ? authenticatedNavItems : publicNavItems;

  return (
    <>
      {/* Top Navbar */}
      <AppBar
        position="fixed"
        sx={{
          background: "var(--primary)",
          height: { xs: "var(--nav-height-mobile)", sm: "var(--nav-height)" },
          display: "flex",
          justifyContent: "center",
          border: "none",
          boxShadow: "var(--shadow-md)",
          zIndex: "var(--z-navbar)",
        }}
      >
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
            minHeight: {
              xs: "var(--nav-height-mobile)",
              sm: "var(--nav-height)",
            },
            px: { xs: "var(--spacing-sm)", sm: "var(--spacing-md)" },
          }}
        >
          {/* Left Side: Hamburger Menu + Logo */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton
              onClick={toggleSidebar}
              sx={{ color: "var(--text-light)", mr: "var(--spacing-sm)" }}
            >
              {open ? <CloseIcon /> : <MenuIcon />}
            </IconButton>
            <img
              src={logo}
              alt="Logo"
              style={{ height: "120px", width: "auto", cursor: "pointer" }}
              onClick={() => handleNavigation(user ? "/dashboard" : "/home")}
            />
          </Box>

          {/* Center: Navigation Links */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              gap: "var(--spacing-lg)",
            }}
          >
            {currentNavItems.map((item) => (
              <Button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                sx={{
                  color: "var(--text-light)",
                  fontWeight: "var(--font-weight-bold)",
                  textTransform: "none",
                  transition: "var(--transition-normal)",
                  "&:hover": { color: "var(--accent)" },
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>

          {/* Right Side: Auth Buttons */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              gap: "var(--spacing-md)",
            }}
          >
            {/* Language Toggle */}
            <LanguageToggle />

            {!user && (
              <>
                <Button
                  onClick={() => handleNavigation("/register")}
                  sx={{
                    color: "var(--text-light)",
                    fontWeight: "var(--font-weight-bold)",
                    border: "1px solid var(--text-light)",
                    borderRadius: "var(--border-radius-pill)",
                    px: "var(--spacing-md)",
                    transition: "var(--transition-normal)",
                    "&:hover": {
                      background: "var(--text-light)",
                      color: "var(--primary)",
                    },
                  }}
                >
                  Sign Up
                </Button>
                <Button
                  onClick={() => handleNavigation("/login")}
                  sx={{
                    color: "var(--text-light)",
                    fontWeight: "var(--font-weight-bold)",
                    border: "1px solid var(--text-light)",
                    borderRadius: "var(--border-radius-pill)",
                    px: "var(--spacing-md)",
                    transition: "var(--transition-normal)",
                    "&:hover": {
                      background: "var(--text-light)",
                      color: "var(--primary)",
                    },
                  }}
                >
                  Login
                </Button>
              </>
            )}
            {user && (
              <>
                <Typography
                  sx={{
                    color: "var(--text-light)",
                    alignSelf: "center",
                    fontWeight: "var(--font-weight-medium)",
                  }}
                >
                  Welcome, {user.firstName}
                </Typography>
                <Button
                  onClick={onLogout}
                  sx={{
                    color: "var(--text-light)",
                    fontWeight: "var(--font-weight-bold)",
                    border: "1px solid var(--text-light)",
                    borderRadius: "var(--border-radius-pill)",
                    px: "var(--spacing-md)",
                    transition: "var(--transition-normal)",
                    "&:hover": {
                      background: "var(--text-light)",
                      color: "var(--primary)",
                    },
                  }}
                >
                  Logout
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer */}
      <Drawer
        anchor="left"
        open={open}
        onClose={toggleSidebar}
        sx={{
          "& .MuiDrawer-paper": {
            width: "var(--drawer-width)",
            background: "var(--primary)",
            color: "var(--text-light)",
            paddingTop: {
              xs: "var(--nav-height-mobile)",
              sm: "var(--nav-height)",
            },
            zIndex: "var(--z-drawer)",
          },
        }}
      >
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            padding: "var(--spacing-md)",
            marginTop: "var(--spacing-lg)",
          }}
        >
          <img
            src={logo}
            alt="Logo"
            style={{
              height: "120px",
              width: "auto",
              marginBottom: "var(--spacing-md)",
            }}
          />
        </Box>
        <List>
          {/* Current Navigation Items */}
          {currentNavItems.map((item) => (
            <ListItem
              button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              selected={location.pathname === item.path}
              sx={{
                "&.Mui-selected": {
                  backgroundColor: "var(--bg-accent)",
                  "&:hover": {
                    backgroundColor: "var(--bg-accent-hover)",
                  },
                },
              }}
            >
              <ListItemIcon sx={{ color: "var(--text-light)" }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItem>
          ))}

          {/* Protected Navigation Items */}
          {user && (
            <>
              <Divider
                sx={{
                  my: "var(--spacing-sm)",
                  backgroundColor: "var(--border-light)",
                }}
              />
              {protectedNavItems.map((item) => (
                <ListItem
                  button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  selected={location.pathname === item.path}
                  sx={{
                    "&.Mui-selected": {
                      backgroundColor: "var(--bg-accent)",
                      "&:hover": {
                        backgroundColor: "var(--bg-accent-hover)",
                      },
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: "var(--text-light)" }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItem>
              ))}
            </>
          )}

          {/* Authentication Items */}
          <Divider
            sx={{
              my: "var(--spacing-sm)",
              backgroundColor: "var(--border-light)",
            }}
          />
          {!user ? (
            <>
              <ListItem button onClick={() => handleNavigation("/register")}>
                <ListItemIcon sx={{ color: "var(--text-light)" }}>
                  <PersonAddIcon />
                </ListItemIcon>
                <ListItemText primary="Sign Up" />
              </ListItem>
              <ListItem button onClick={() => handleNavigation("/login")}>
                <ListItemIcon sx={{ color: "var(--text-light)" }}>
                  <LoginIcon />
                </ListItemIcon>
                <ListItemText primary="Login" />
              </ListItem>
            </>
          ) : (
            <ListItem button onClick={onLogout}>
              <ListItemIcon sx={{ color: "var(--text-light)" }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          )}
        </List>
      </Drawer>
    </>
  );
}

export default NavBar;
