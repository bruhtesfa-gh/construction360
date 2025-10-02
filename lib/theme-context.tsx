"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { Theme, ThemeColors, PRESET_THEMES, hexToHSL } from "./theme-config";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  customThemes: Theme[];
  addCustomTheme: (theme: Theme) => void;
  deleteCustomTheme: (themeId: string) => void;
  updateCustomTheme: (theme: Theme) => void;
  applyTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = "c360-theme";
const CUSTOM_THEMES_STORAGE_KEY = "c360-custom-themes";
const DARK_MODE_STORAGE_KEY = "c360-dark-mode";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(PRESET_THEMES[0]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [customThemes, setCustomThemes] = useState<Theme[]>([]);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    const savedDarkMode = localStorage.getItem(DARK_MODE_STORAGE_KEY);
    const savedCustomThemes = localStorage.getItem(CUSTOM_THEMES_STORAGE_KEY);

    if (savedDarkMode !== null) {
      setIsDarkMode(savedDarkMode === "true");
    } else {
      // Check system preference
      setIsDarkMode(window.matchMedia("(prefers-color-scheme: light)").matches);
    }

    if (savedCustomThemes) {
      try {
        setCustomThemes(JSON.parse(savedCustomThemes));
      } catch (e) {
        console.error("Failed to parse custom themes:", e);
      }
    }

    if (savedTheme) {
      try {
        const parsedTheme = JSON.parse(savedTheme);
        // Check if it's a preset theme
        const presetTheme = PRESET_THEMES.find((t) => t.id === parsedTheme.id);
        if (presetTheme && !parsedTheme.isCustom) {
          setThemeState(presetTheme);
        } else {
          // It's a custom theme or modified preset
          setThemeState(parsedTheme);
        }
      } catch (e) {
        console.error("Failed to parse saved theme:", e);
      }
    }
  }, []);

  // Apply theme to CSS variables
  const applyTheme = useCallback(
    (theme: Theme) => {
      const root = document.documentElement;
      const colors = isDarkMode ? theme.colors.dark : theme.colors.light;

      // Apply each color as a CSS variable
      Object.entries(colors).forEach(([key, value]) => {
        const cssVarName = `--${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`;
        root.style.setProperty(cssVarName, value);
      });

      // Apply dark mode class
      if (isDarkMode) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    },
    [isDarkMode]
  );

  // Apply theme whenever it changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme, isDarkMode, applyTheme]);

  // Save theme to localStorage
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(newTheme));
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem(DARK_MODE_STORAGE_KEY, String(newDarkMode));
  };

  // Add custom theme
  const addCustomTheme = (newTheme: Theme) => {
    const updatedThemes = [...customThemes, { ...newTheme, isCustom: true }];
    setCustomThemes(updatedThemes);
    localStorage.setItem(
      CUSTOM_THEMES_STORAGE_KEY,
      JSON.stringify(updatedThemes)
    );
  };

  // Delete custom theme
  const deleteCustomTheme = (themeId: string) => {
    const updatedThemes = customThemes.filter((t) => t.id !== themeId);
    setCustomThemes(updatedThemes);
    localStorage.setItem(
      CUSTOM_THEMES_STORAGE_KEY,
      JSON.stringify(updatedThemes)
    );

    // If the deleted theme was active, switch to default
    if (theme.id === themeId) {
      setTheme(PRESET_THEMES[0]);
    }
  };

  // Update custom theme
  const updateCustomTheme = (updatedTheme: Theme) => {
    const updatedThemes = customThemes.map((t) =>
      t.id === updatedTheme.id ? { ...updatedTheme, isCustom: true } : t
    );
    setCustomThemes(updatedThemes);
    localStorage.setItem(
      CUSTOM_THEMES_STORAGE_KEY,
      JSON.stringify(updatedThemes)
    );

    // If the updated theme is active, apply changes
    if (theme.id === updatedTheme.id) {
      setTheme(updatedTheme);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        isDarkMode,
        toggleDarkMode,
        customThemes,
        addCustomTheme,
        deleteCustomTheme,
        updateCustomTheme,
        applyTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
