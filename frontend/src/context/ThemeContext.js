import { createContext, useContext, useState, useEffect } from 'react';
import { preferencesAPI } from '../utils/api';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const defaultTheme = {
  name: 'Default',
  colors: {
    primary: '#3b82f6',      // Blue
    secondary: '#8b5cf6',    // Purple
    background: '#f9fafb',   // Light gray
    card: '#ffffff',         // White
    textPrimary: '#111827',  // Dark gray
    textSecondary: '#6b7280', // Medium gray
    success: '#10b981',      // Green
    warning: '#f59e0b',      // Amber
    error: '#ef4444',        // Red
    border: '#e5e7eb',       // Light gray
  }
};

const presetThemes = {
  default: defaultTheme,
  dark: {
    name: 'Dark',
    colors: {
      primary: '#60a5fa',
      secondary: '#a78bfa',
      background: '#111827',
      card: '#1f2937',
      textPrimary: '#f9fafb',
      textSecondary: '#d1d5db',
      success: '#34d399',
      warning: '#fbbf24',
      error: '#f87171',
      border: '#374151',
    }
  },
  green: {
    name: 'Green',
    colors: {
      primary: '#10b981',
      secondary: '#14b8a6',
      background: '#f0fdf4',
      card: '#ffffff',
      textPrimary: '#111827',
      textSecondary: '#6b7280',
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
      border: '#d1fae5',
    }
  },
  purple: {
    name: 'Purple',
    colors: {
      primary: '#8b5cf6',
      secondary: '#a78bfa',
      background: '#faf5ff',
      card: '#ffffff',
      textPrimary: '#111827',
      textSecondary: '#6b7280',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      border: '#e9d5ff',
    }
  },
  ocean: {
    name: 'Ocean',
    colors: {
      primary: '#0ea5e9',
      secondary: '#06b6d4',
      background: '#f0f9ff',
      card: '#ffffff',
      textPrimary: '#0c4a6e',
      textSecondary: '#475569',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      border: '#bae6fd',
    }
  },
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(defaultTheme);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      // Try to load from localStorage first for immediate application
      const savedTheme = localStorage.getItem('customTheme');
      if (savedTheme) {
        const parsedTheme = JSON.parse(savedTheme);
        applyTheme(parsedTheme);
        setTheme(parsedTheme);
      }

      // Then load from backend for sync
      const response = await preferencesAPI.get();
      const customTheme = response.data.data?.custom_theme;
      if (customTheme && typeof customTheme === 'object') {
        applyTheme(customTheme);
        setTheme(customTheme);
        localStorage.setItem('customTheme', JSON.stringify(customTheme));
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
      applyTheme(defaultTheme);
    } finally {
      setLoading(false);
    }
  };

  const applyTheme = (themeData) => {
    const root = document.documentElement;
    Object.entries(themeData.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
  };

  const updateTheme = async (newTheme) => {
    try {
      setTheme(newTheme);
      applyTheme(newTheme);
      localStorage.setItem('customTheme', JSON.stringify(newTheme));
      
      await preferencesAPI.update({ custom_theme: newTheme });
    } catch (error) {
      console.error('Failed to save theme:', error);
      throw error;
    }
  };

  const selectPreset = (presetName) => {
    const preset = presetThemes[presetName] || defaultTheme;
    updateTheme(preset);
  };

  const resetTheme = () => {
    updateTheme(defaultTheme);
  };

  const exportTheme = () => {
    const dataStr = JSON.stringify(theme, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mai-finances-theme-${theme.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importTheme = (themeData) => {
    try {
      if (themeData.colors) {
        updateTheme(themeData);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to import theme:', error);
      return false;
    }
  };

  const value = {
    theme,
    updateTheme,
    selectPreset,
    resetTheme,
    exportTheme,
    importTheme,
    presets: Object.keys(presetThemes),
    loading,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

