import React, { useState } from 'react';
import { 
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Tooltip,
  Container,
  useMediaQuery,
  styled
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  DarkMode as DarkModeIcon, 
  LightMode as LightModeIcon,
  Home as HomeIcon,
  Favorite as FavoriteIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountCircleIcon,
  Theaters as TheatersIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom'; // Added useLocation
import { useAuth } from '../contexts/AuthContext';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { useTheme as useCustomTheme } from '../contexts/ThemeContext';

const GradientText = styled(Typography)(({ theme }) => ({
  background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, #00e5ff 90%)`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  fontWeight: 800,
  letterSpacing: '-0.5px',
  position: 'relative',
  '&:after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 0,
    height: '2px',
    background: theme.palette.primary.main,
    transition: 'width 0.3s ease',
  },
  '&:hover:after': {
    width: '100%'
  }
}));

const Navbar = () => {
  const theme = useMuiTheme();
  const { currentUser, logout } = useAuth();
  const { mode, toggleTheme } = useCustomTheme();
  const navigate = useNavigate();
  const location = useLocation(); // Get current location
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      handleClose();
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const toggleDrawer = (open) => (event) => {
    if (
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return;
    }
    setDrawerOpen(open);
  };

  const navLinks = [
    { title: 'Home', path: '/home', icon: <HomeIcon /> },
    { title: 'Favorites', path: '/favorites', icon: <FavoriteIcon /> }
  ];

  const drawerContent = (
    <Box sx={{ width: 280 }}>
      {currentUser && (
        <Box
          sx={{
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, #00e5ff 90%)`,
            color: 'common.white',
          }}
        >
          <Avatar
            sx={{
              width: 64,
              height: 64,
              mb: 1,
              bgcolor: 'background.paper',
              color: 'primary.main',
            }}
          >
            {currentUser.name?.charAt(0) || <AccountCircleIcon />}
          </Avatar>
          <Typography variant="h6" sx={{ mt: 1 }}>
            {currentUser.name || 'User'}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            {currentUser.email}
          </Typography>
        </Box>
      )}
      <List sx={{ pt: 1 }}>
        {navLinks.map((link) => (
          <ListItem key={link.title} disablePadding>
            <ListItemButton
              component={RouterLink}
              to={link.path}
              sx={{
                py: 1.5,
                borderRadius: 1,
                mx: 1,
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{link.icon}</ListItemIcon>
              <ListItemText primary={link.title} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider sx={{ my: 2 }} />
      <List>
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              py: 1.5,
              borderRadius: 1,
              mx: 1,
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <IconButton
          onClick={toggleDrawer(false)}
          color="inherit"
          sx={{ 
            color: theme.palette.primary.main,
            '&:hover': { color: theme.palette.primary.light }
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>
    </Box>
  );

  // Conditionally render buttons based on current route
  const shouldShowAuthButtons = !currentUser && !['/register', '/login'].includes(location.pathname);

  return (
    <AppBar 
      position="sticky" 
      elevation={0}
      sx={{
        backdropFilter: 'blur(12px)',
        backgroundColor: theme.palette.mode === 'dark' 
          ? 'rgba(18, 18, 18, 0.85)' 
          : 'rgba(255, 255, 255, 0.85)',
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Container maxWidth="xl">
        <Toolbar 
          disableGutters={isMobile ? false : true} // Enable gutters on mobile for padding
          sx={{ px: isMobile ? 1 : 0 }} // Add padding on mobile
        >
          {currentUser && isMobile && (
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              onClick={toggleDrawer(true)}
              sx={{ 
                mr: 1,
                color: mode === 'light' ? theme.palette.primary.main : theme.palette.text.primary
              }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <TheatersIcon sx={{ 
              mr: 1, 
              fontSize: 32,
              color: mode === 'dark' ? 'primary.main' : 'text.primary' 
            }} />
            <GradientText
              variant="h5"
              component={RouterLink}
              to={currentUser ? '/home' : '/login'}
              sx={{
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                fontSize: isMobile ? '1.2rem' : '1.5rem', // Smaller logo text on mobile
              }}
            >
              OceansFlixx
            </GradientText>
          </Box>

          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            flexDirection: isMobile ? 'column' : 'row', // Stack vertically on mobile
            gap: isMobile ? 1 : 0, // Add spacing between stacked buttons
          }}>
            {currentUser && !isMobile && (
              <Box sx={{ display: 'flex', mr: 2 }}>
                {navLinks.map((link) => (
                  <Button
                    key={link.title}
                    component={RouterLink}
                    to={link.path}
                    startIcon={link.icon}
                    sx={{
                      mx: 0.5,
                      py: 1,
                      textTransform: 'none',
                      fontWeight: 500,
                    }}
                  >
                    {link.title}
                  </Button>
                ))}
              </Box>
            )}

            <Tooltip title={mode === 'dark' ? 'Light mode' : 'Dark mode'}>
              <IconButton 
                onClick={toggleTheme} 
                color="inherit" 
                sx={{ 
                  mr: isMobile ? 0 : 1, // Remove margin-right on mobile to save space
                  ...(mode === 'light' && {
                    color: 'primary.main',
                  })
                }}
              >
                {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>

            {currentUser ? (
              <>
                <Tooltip title="Account settings">
                  <IconButton
                    onClick={handleMenu}
                    size="small"
                    sx={{ 
                      ml: 1,
                      ...(open && {
                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                      }),
                    }}
                    aria-controls={open ? 'account-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                  >
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                      }}
                    >
                      {currentUser.name?.charAt(0) || <AccountCircleIcon fontSize="small" />}
                    </Avatar>
                  </IconButton>
                </Tooltip>
                <Menu
                  id="account-menu"
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleClose}
                  onClick={handleClose}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  PaperProps={{
                    elevation: 3,
                    sx: {
                      overflow: 'visible',
                      mt: 1.5,
                      width: 220,
                      '&:before': {
                        content: '""',
                        display: 'block',
                        position: 'absolute',
                        top: 0,
                        right: 14,
                        width: 10,
                        height: 10,
                        transform: 'translateY(-50%) rotate(45deg)',
                        bgcolor: 'background.paper',
                        zIndex: 0,
                      },
                    },
                  }}
                >
                  <Box sx={{ px: 2, py: 1.5 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                      {currentUser.name || 'User'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
                      {currentUser.email}
                    </Typography>
                  </Box>
                  <Divider />
                  <MenuItem onClick={handleLogout} sx={{ py: 1.5 }}>
                    <ListItemIcon>
                      <LogoutIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Logout" />
                  </MenuItem>
                </Menu>
              </>
            ) : shouldShowAuthButtons && (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: isMobile ? 'column' : 'row', // Stack buttons vertically on mobile
                alignItems: 'center',
                gap: isMobile ? 1 : 0, // Add spacing between stacked buttons
              }}>
                <Button
                  variant="text"
                  component={RouterLink}
                  to="/login"
                  sx={{
                    textTransform: 'none',
                    fontWeight: 500,
                    px: isMobile ? 1 : 2, // Reduce padding on mobile
                    fontSize: isMobile ? '0.85rem' : '0.875rem', // Smaller font on mobile
                    minWidth: isMobile ? 'auto' : '64px', // Allow button to shrink on mobile
                  }}
                >
                  Login
                </Button>
                <Button
                  variant="contained"
                  component={RouterLink}
                  to="/register"
                  sx={{
                    ml: isMobile ? 0 : 1, // Remove margin-left on mobile since stacked
                    textTransform: 'none',
                    fontWeight: 500,
                    px: isMobile ? 1 : 2, // Reduce padding on mobile
                    fontSize: isMobile ? '0.85rem' : '0.875rem', // Smaller font on mobile
                    boxShadow: 'none',
                    '&:hover': {
                      boxShadow: 'none',
                    },
                    minWidth: isMobile ? 'auto' : '64px', // Allow button to shrink on mobile
                  }}
                >
                  Register
                </Button>
              </Box>
            )}
          </Box>
        </Toolbar>
      </Container>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        sx={{
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            background: theme.palette.mode === 'dark' 
              ? 'rgba(18, 18, 18, 0.9)' 
              : 'rgba(255, 255, 255, 0.9)',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </AppBar>
  );
};

export default Navbar;