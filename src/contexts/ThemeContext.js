

import React, { createContext, useState, useEffect, useContext } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const ThemeContext = createContext();

export const useTheme = () => {
  return useContext(ThemeContext);
};

export const ThemeProvider = ({ children }) => {
  const getInitialMode = () => {
    const savedMode = localStorage.getItem('themeMode');
    return savedMode ? savedMode : 'light';
  };

  const [mode, setMode] = useState(getInitialMode);

  useEffect(() => {
    localStorage.setItem('themeMode', mode);
    document.documentElement.setAttribute('data-theme', mode);
    
  }, [mode]);


  const toggleTheme = () => {
    setMode(prevMode => (prevMode === 'light' ? 'dark' : 'light'));
  };


const theme = createTheme({
  palette: {
    mode,
    primary: {
      main: mode === 'light' ? '#1f4287' : '#5da9e9',
    },
    secondary: {
      main: mode === 'light' ? '#5da9e9' : '#a8d0e6',
    },
    background: {
      default: mode === 'light' ? '#e9ecef' : '#0a192f',
      paper: mode === 'light' ? '#ffffff' : '#112240',
    },
    text: {
      primary: mode === 'light' ? '#121212' : '#f8f9fa',
      secondary: mode === 'light' ? '#1f4287' : '#a8d0e6',
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