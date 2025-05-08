// Add this to your ThemeContext.js file or where your theme logic is implemented

import React, { createContext, useState, useEffect, useContext } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const ThemeContext = createContext();

export const useTheme = () => {
  return useContext(ThemeContext);
};

export const ThemeProvider = ({ children }) => {
  // Check if user has previously set a theme preference
  const getInitialMode = () => {
    const savedMode = localStorage.getItem('themeMode');
    return savedMode ? savedMode : 'light';
  };

  const [mode, setMode] = useState(getInitialMode);

  // Update localStorage and HTML attribute when mode changes
  useEffect(() => {
    localStorage.setItem('themeMode', mode);
    
    // Update the data-theme attribute on the document to enable CSS variables switching
    document.documentElement.setAttribute('data-theme', mode);
    
  }, [mode]);

  // Toggle between light and dark mode
  const toggleTheme = () => {
    setMode(prevMode => (prevMode === 'light' ? 'dark' : 'light'));
  };

  // Create MUI theme based on current mode
  const theme = createTheme({
    palette: {
      mode,
      primary: {
        main: mode === 'light' ? '#1f4287' : '#5da9e9', // ocean-blue in light mode, light-blue in dark mode
      },
      secondary: {
        main: mode === 'light' ? '#5da9e9' : '#a8d0e6', // light-blue in light mode, pale-blue in dark mode
      },
      background: {
        default: mode === 'light' ? '#e9ecef' : '#0a192f', // off-white in light mode, deep-blue in dark mode
        paper: mode === 'light' ? '#ffffff' : '#112240', // white in light mode, midnight-blue in dark mode
      },
      text: {
        primary: mode === 'light' ? '#121212' : '#f8f9fa', // black in light mode, white in dark mode
        secondary: mode === 'light' ? '#1f4287' : '#a8d0e6', // ocean-blue in light mode, pale-blue in dark mode
      },
    },
  });

  const value = {
    mode,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeContext;