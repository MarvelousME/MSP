import React, { createContext, useContext } from 'react';

export const CyberTheme = {
  colors: {
    background: '#020617',
    surface: '#0f172a',
    primary: '#10b981', // Emerald 500
    secondary: '#3b82f6', // Blue 500
    accent: '#8b5cf6', // Violet 500
    text: '#f8fafc',
    textMuted: '#94a3b8',
    border: '#1e293b',
    error: '#ef4444',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 20,
  }
};

const ThemeContext = createContext(CyberTheme);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => (
  <ThemeContext.Provider value={CyberTheme}>{children}</ThemeContext.Provider>
);

export const useTheme = () => useContext(ThemeContext);
