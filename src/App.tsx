
import React, { useState } from 'react';
import {
  createTheme,
  ThemeProvider,
  CssBaseline,
} from '@mui/material'

import './App.css';

import MainPage from './pages/MainPage';
import AppHeader from './components/AppHeader';
import { StorageHelper } from './util/StorageHelper';

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(false);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
    },
  });

  function toggleMode() {
    if (darkMode) {
      if (StorageHelper.isLocalStorageAvailable) {
        localStorage.setItem('useDarkMode', 'false');
      }
      setDarkMode(false);

      return;
    }

    if (StorageHelper.isLocalStorageAvailable) {
      localStorage.setItem('useDarkMode', 'true');
    }
    setDarkMode(true);
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppHeader
        darkModeEnabled={darkMode}
        toggleVisualMode={toggleMode}
        />
      <MainPage
        useDarkMode={darkMode}
        toggleVisualMode={toggleMode}
        />
    </ThemeProvider>
  );
};
