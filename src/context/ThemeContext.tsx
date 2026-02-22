"use client"
import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { ThemeProvider, createTheme, useTheme } from '@mui/material';

// Extend the theme to include custom palette properties
declare module '@mui/material/styles' {
  interface PaletteColor {
    gradient?: string;
  }
  
  interface TypeBackground {
    gradient?: string;
  }
}

interface ThemeContextProps {
  mode: 'light';
}

const ThemeContext = createContext<ThemeContextProps>({ mode: 'light' });

export const useThemeContext = () => useContext(ThemeContext);

const getDesignTokens = () => ({
  palette: {
    mode: 'light' as const,
    background: {
      default: '#f5f7fa',
      paper: '#ffffff',
      gradient: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    },
    primary: {
      main: '#6366f1',
      light: '#8b5cf6',
      dark: '#4f46e5',
      contrastText: '#ffffff',
      gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    },
    secondary: {
      main: '#22d3ee',
      light: '#67e8f9',
      dark: '#0891b2',
      contrastText: '#ffffff',
      gradient: 'linear-gradient(135deg, #22d3ee 0%, #67e8f9 100%)',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
      contrastText: '#ffffff',
      gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
      contrastText: '#ffffff',
      gradient: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
      contrastText: '#ffffff',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
    },
    info: {
      main: '#06b6d4',
      light: '#67e8f9',
      dark: '#0891b2',
      contrastText: '#ffffff',
      gradient: 'linear-gradient(135deg, #06b6d4 0%, #67e8f9 100%)',
    },
    text: {
      primary: '#1f2937',
      secondary: '#6b7280',
      disabled: '#9ca3af',
    },
    divider: 'rgba(0, 0, 0, 0.05)',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '3rem',
      fontWeight: 800,
      lineHeight: 1.2,
      letterSpacing: '-0.025em',
    },
    h2: {
      fontSize: '2.25rem',
      fontWeight: 700,
      lineHeight: 1.3,
      letterSpacing: '-0.025em',
    },
    h3: {
      fontSize: '1.875rem',
      fontWeight: 700,
      lineHeight: 1.4,
      letterSpacing: '-0.025em',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: '-0.025em',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.5,
      letterSpacing: '-0.025em',
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.5,
      letterSpacing: '-0.025em',
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.6,
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 600,
      textTransform: 'none' as const,
      letterSpacing: '0.025em',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          backgroundAttachment: 'fixed',
          minHeight: '100vh',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundImage: 'none',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none' as const,
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            transform: 'translateY(-1px)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundImage: 'none',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            },
            '&.Mui-focused': {
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)',
            },
          },
        },
      },
    },
  },
});

export const CustomThemeProvider = ({ children }: { children: ReactNode }) => {
  const theme = useMemo(() => createTheme(getDesignTokens()), []);

  return (
    <ThemeContext.Provider value={{ mode: 'light' }}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeContext.Provider>
  );
};

export { useTheme };
