export type ThemeMode = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'quiz_pro_theme';

export function getThemePreference(): ThemeMode {
  if (typeof window === 'undefined') return 'system';
  const saved = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
  if (saved === 'light' || saved === 'dark' || saved === 'system') {
    return saved;
  }
  return 'system';
}

export function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function getEffectiveTheme(preference: ThemeMode = getThemePreference()): 'light' | 'dark' {
  if (preference === 'system') {
    return getSystemTheme();
  }
  return preference;
}

export function applyTheme(preference: ThemeMode): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  
  const effective = getEffectiveTheme(preference);
  const root = document.documentElement;

  if (effective === 'dark') {
    root.classList.add('dark');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.remove('dark');
    root.style.colorScheme = 'light';
  }

  return effective;
}

export function setThemePreference(preference: ThemeMode): 'light' | 'dark' {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, preference);
  }
  return applyTheme(preference);
}

export function setupThemeListener(onChange: (effective: 'light' | 'dark') => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handler = () => {
    if (getThemePreference() === 'system') {
      const effective = applyTheme('system');
      onChange(effective);
    }
  };

  mediaQuery.addEventListener('change', handler);
  return () => mediaQuery.removeEventListener('change', handler);
}
