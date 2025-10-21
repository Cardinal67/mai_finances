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
  const [balanceMasked, setBalanceMasked] = useState(true); // Default to hidden
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      // Load balance preference from localStorage first
      const savedBalanceMasked = localStorage.getItem('balanceMasked');
      if (savedBalanceMasked !== null) {
        setBalanceMasked(savedBalanceMasked === 'true');
      }

      // Try to load theme from localStorage first for immediate application
      const savedTheme = localStorage.getItem('customTheme');
      if (savedTheme) {
        const parsedTheme = JSON.parse(savedTheme);
        applyTheme(parsedTheme);
        setTheme(parsedTheme);
      }

      // Only try to load from backend if user is authenticated
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      // Then load from backend for sync
      const response = await preferencesAPI.get();
      const preferences = response.data.data;
      
      // Load balance masked preference
      if (typeof preferences.balance_masked === 'boolean') {
        setBalanceMasked(preferences.balance_masked);
        localStorage.setItem('balanceMasked', preferences.balance_masked.toString());
      }
      
      // Load custom theme
      const customTheme = preferences.custom_theme;
      if (customTheme) {
        // Parse if it's a string, otherwise use as-is
        const themeData = typeof customTheme === 'string' ? JSON.parse(customTheme) : customTheme;
        if (themeData && themeData.colors) {
          applyTheme(themeData);
          setTheme(themeData);
          localStorage.setItem('customTheme', JSON.stringify(themeData));
        }
      }
    } catch (error) {
      // Silently fail if user is not authenticated (401)
      if (error.response?.status === 401) {
        console.log('Theme load skipped - user not authenticated');
      } else {
        console.error('Failed to load theme:', error);
      }
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
      
      // Convert theme to JSON string for backend storage
      const themeString = JSON.stringify(newTheme);
      console.log('Saving theme:', themeString);
      await preferencesAPI.update({ custom_theme: themeString });
    } catch (error) {
      console.error('Failed to save theme:', error);
      console.error('Error details:', error.response?.data);
      throw error;
    }
  };

  const selectPreset = async (presetName) => {
    const preset = presetThemes[presetName] || defaultTheme;
    try {
      await updateTheme(preset);
    } catch (error) {
      console.error('Failed to select preset:', presetName, error);
      // Revert to previous theme on error
      applyTheme(theme);
    }
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

  const toggleBalanceMask = async () => {
    const newValue = !balanceMasked;
    console.log('[BalanceMask] Toggling from', balanceMasked, 'to', newValue);
    setBalanceMasked(newValue);
    localStorage.setItem('balanceMasked', newValue.toString());
    
    try {
      console.log('[BalanceMask] Saving to backend:', newValue);
      await preferencesAPI.update({ balance_masked: newValue });
      console.log('[BalanceMask] Successfully saved to backend');
    } catch (error) {
      console.error('[BalanceMask] Failed to save balance preference:', error);
      // Revert on error
      setBalanceMasked(!newValue);
      localStorage.setItem('balanceMasked', (!newValue).toString());
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
    balanceMasked,
    toggleBalanceMask,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

