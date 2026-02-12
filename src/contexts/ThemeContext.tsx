import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { ThemePreference } from '../types';

type AppliedTheme = 'light' | 'dark';

interface ThemeContextType {
  theme: AppliedTheme;
  themePreference: ThemePreference;
  setThemePreference: (nextPreference: ThemePreference) => void;
}

const THEME_PREFERENCE_STORAGE_KEY = 'themePreference';
const LEGACY_THEME_STORAGE_KEY = 'theme';
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function isThemePreference(value: string | null): value is ThemePreference {
  return value === 'LIGHT' || value === 'DARK' || value === 'SYSTEM';
}

function resolveTheme(preference: ThemePreference, systemPrefersDark: boolean): AppliedTheme {
  if (preference === 'LIGHT') {
    return 'light';
  }
  if (preference === 'DARK') {
    return 'dark';
  }
  return systemPrefersDark ? 'dark' : 'light';
}

function readInitialThemePreference(): ThemePreference {
  const stored = localStorage.getItem(THEME_PREFERENCE_STORAGE_KEY);
  if (isThemePreference(stored)) {
    return stored;
  }

  const legacyStored = localStorage.getItem(LEGACY_THEME_STORAGE_KEY);
  if (legacyStored === 'light') {
    return 'LIGHT';
  }
  if (legacyStored === 'dark') {
    return 'DARK';
  }

  return 'SYSTEM';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>(readInitialThemePreference);
  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  const theme = useMemo(
    () => resolveTheme(themePreference, systemPrefersDark),
    [themePreference, systemPrefersDark]
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleSystemThemeChange = (event: MediaQueryListEvent) => {
      setSystemPrefersDark(event.matches);
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_PREFERENCE_STORAGE_KEY, themePreference);
    localStorage.setItem(LEGACY_THEME_STORAGE_KEY, theme);
  }, [theme, themePreference]);

  const value = useMemo<ThemeContextType>(
    () => ({
      theme,
      themePreference,
      setThemePreference: setThemePreferenceState,
    }),
    [theme, themePreference]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
