import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';

const ThemeContext = createContext();

const lightColors = {
  primary: '#6366f1', // Indigo 500
  primaryDark: '#4f46e5', // Indigo 600
  background: '#fcfcfd', 
  card: '#ffffff',
  text: '#0f172a', // Slate 900
  textSecondary: '#64748b', // Slate 500
  border: '#f1f5f9',
  error: '#ef4444',
  success: '#10b981',
  accent: '#eef2ff',
  glass: 'rgba(255, 255, 255, 0.8)',
};

const darkColors = {
  primary: '#818cf8', // Indigo 400
  primaryDark: '#6366f1', // Indigo 500
  background: '#020617', // Slate 950
  card: '#0f172a', // Slate 900
  text: '#f8fafc', // Slate 50
  textSecondary: '#94a3b8', // Slate 400
  border: '#1e293b',
  error: '#f87171',
  success: '#34d399',
  accent: '#1e1b4b',
  glass: 'rgba(15, 23, 42, 0.8)',
};

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === 'dark');

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const theme = {
    dark: isDarkMode,
    colors: isDarkMode ? darkColors : lightColors,
    radius: {
      s: 8,
      m: 12,
      l: 20,
      xl: 30,
    },
    shadow: isDarkMode ? {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 5,
    } : {
      shadowColor: '#6366f1',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.08,
      shadowRadius: 20,
      elevation: 8,
    },
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
