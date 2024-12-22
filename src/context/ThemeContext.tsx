import React, { createContext, useContext, useState, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import baseTheme from '../theme/theme';

interface ThemeContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  darkMode: false,
  toggleDarkMode: () => {},
});

export const useThemeMode = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const theme = useMemo(
    () =>
      createTheme({
        ...baseTheme,
        palette: {
          mode: darkMode ? 'dark' : 'light',
          primary: baseTheme.palette.primary,
          secondary: baseTheme.palette.secondary,
          background: {
            default: darkMode ? '#0A0A0A' : '#F5F1EA',
            paper: darkMode ? '#1A1A1A' : '#FAF7F2',
          },
          text: {
            primary: darkMode ? '#FFFFFF' : '#2D3748',
            secondary: darkMode ? '#A0AEC0' : '#4A5568',
          },
        },
      }),
    [darkMode]
  );

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
