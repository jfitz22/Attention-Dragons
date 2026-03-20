import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { type ThemeId, type Theme, DEFAULT_THEME_ID, getTheme } from '@/lib/themes';

const STORAGE_KEY = 'attention-dragons-theme';

interface ThemeContextValue {
  theme: Theme;
  themeId: ThemeId;
  setThemeId: (id: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: getTheme(DEFAULT_THEME_ID),
  themeId: DEFAULT_THEME_ID,
  setThemeId: () => {},
});

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  for (const [key, value] of Object.entries(theme.cssVars)) {
    root.style.setProperty(key, value);
  }
  root.setAttribute('data-theme', theme.id);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeIdState] = useState<ThemeId>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return stored as ThemeId;
    } catch {}
    return DEFAULT_THEME_ID;
  });

  const theme = getTheme(themeId);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setThemeId = (id: ThemeId) => {
    setThemeIdState(id);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {}
  };

  return (
    <ThemeContext.Provider value={{ theme, themeId, setThemeId }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
