import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';

type Theme = 'light' | 'dark';

interface ThemeColors {
  background: string;
  surface: string;
  surfaceSecondary: string;
  text: string;
  textSecondary: string;
  primary: string;
  accent: string;
  border: string;
  danger: string;
  success: string;
  cardGradient: string[];
}

interface ThemeContextType {
  theme: Theme;
  colors: ThemeColors;
  toggleTheme: () => void;
}

const lightColors: ThemeColors = {
  background: '#F5F5F5',
  surface: '#FFFFFF',
  surfaceSecondary: '#F8F9FA',
  text: '#1A1A1A',
  textSecondary: '#666666',
  primary: '#4A90D9',
  accent: '#2196F3',
  border: '#E9ECEF',
  danger: '#DC3545',
  success: '#28A745',
  cardGradient: ['#4285F4', '#34A0F4'],
};

const darkColors: ThemeColors = {
  background: '#1A1A2E',
  surface: '#16213E',
  surfaceSecondary: '#0F3460',
  text: '#FFFFFF',
  textSecondary: '#AAAAAA',
  primary: '#5B8DEF',
  accent: '#7BA3F5',
  border: '#2A2A4A',
  danger: '#FF6B6B',
  success: '#4CAF50',
  cardGradient: ['#1A1A2E', '#16213E'],
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState<Theme>(systemColorScheme === 'dark' ? 'dark' : 'light');

  const colors = theme === 'dark' ? darkColors : lightColors;

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme debe usarse dentro de ThemeProvider');
  }
  return context;
}