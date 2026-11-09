export type ThemeMode = 'ice' | 'dark' | 'custom';

export interface CustomPalette {
  canvas: string;   // Nền chính
  card: string;     // Mặt thẻ câu hỏi
  header: string;   // Header & Footer
  button: string;   // Nút bấm chính
  border: string;   // Khung viền & Bảng
  text: string;     // Màu chữ chính
  hover: string;    // Màu rê chuột (hover)
}

export interface PaletteColor {
  id: string;
  name: string;
  hex: string;
  isDark: boolean;
}

export const PALETTE_COLORS: PaletteColor[] = [
  { id: 'navy', name: 'Deep Navy', hex: '#2F4860', isDark: true },
  { id: 'white', name: 'Clean White', hex: '#FFFFFF', isDark: false },
  { id: 'cobalt', name: 'Soft Cobalt', hex: '#7DA7D9', isDark: false },
  { id: 'butter', name: 'Butter Yellow', hex: '#FFF7CC', isDark: false },
  { id: 'ice', name: 'Ice Blue', hex: '#DCEEFF', isDark: false }
];

export const DEFAULT_CUSTOM_PALETTE: CustomPalette = {
  canvas: '#DCEEFF', // Ice Blue
  card: '#FFFFFF',   // Clean White
  header: '#FFFFFF', // Clean White
  button: '#7DA7D9', // Soft Cobalt
  border: '#DCEEFF', // Ice Blue
  text: '#2F4860',   // Deep Navy
  hover: '#FFF7CC'   // Butter Yellow
};

const STORAGE_KEY = 'quiz_pro_theme';
const PALETTE_KEY = 'quiz_pro_custom_palette';

export function getCustomPalette(): CustomPalette {
  if (typeof window === 'undefined') return DEFAULT_CUSTOM_PALETTE;
  try {
    const raw = localStorage.getItem(PALETTE_KEY);
    if (!raw) return DEFAULT_CUSTOM_PALETTE;
    const parsed = JSON.parse(raw);
    return {
      canvas: parsed.canvas || DEFAULT_CUSTOM_PALETTE.canvas,
      card: parsed.card || DEFAULT_CUSTOM_PALETTE.card,
      header: parsed.header || DEFAULT_CUSTOM_PALETTE.header,
      button: parsed.button || DEFAULT_CUSTOM_PALETTE.button,
      border: parsed.border || DEFAULT_CUSTOM_PALETTE.border,
      text: parsed.text || DEFAULT_CUSTOM_PALETTE.text,
      hover: parsed.hover || DEFAULT_CUSTOM_PALETTE.hover
    };
  } catch {
    return DEFAULT_CUSTOM_PALETTE;
  }
}

export function saveCustomPalette(palette: CustomPalette): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(PALETTE_KEY, JSON.stringify(palette));
  }
}

export function getThemePreference(): ThemeMode {
  if (typeof window === 'undefined') return 'ice';
  const saved = localStorage.getItem(STORAGE_KEY) as any;
  if (saved === 'ice' || saved === 'dark' || saved === 'custom') {
    return saved;
  }
  return 'ice';
}

export function getContrastingText(hex: string): string {
  const normalized = hex.toUpperCase();
  if (normalized === '#2F4860' || normalized === '#152230') {
    return '#FFFFFF';
  }
  if (normalized === '#7DA7D9') {
    return '#152230';
  }
  return '#2F4860';
}

export function applyTheme(preference: ThemeMode, customPalette: CustomPalette = getCustomPalette()): ThemeMode {
  if (typeof window === 'undefined') return 'ice';

  let effective: ThemeMode = preference;
  if (effective !== 'ice' && effective !== 'dark' && effective !== 'custom') {
    effective = 'ice';
  }

  const root = document.documentElement;

  // Clear previous theme indicators and inline overrides
  root.classList.remove('dark', 'theme-butter', 'theme-ice', 'theme-cobalt', 'theme-custom');
  root.removeAttribute('data-theme');
  root.style.removeProperty('--bg-canvas');
  root.style.removeProperty('--card-surface');
  root.style.removeProperty('--bg-header');
  root.style.removeProperty('--btn-primary');
  root.style.removeProperty('--btn-primary-text');
  root.style.removeProperty('--border-subtle');
  root.style.removeProperty('--text-primary');
  root.style.removeProperty('--hover-bg');

  if (effective === 'dark') {
    root.classList.add('dark');
    root.setAttribute('data-theme', 'dark');
    root.style.colorScheme = 'dark';
  } else if (effective === 'custom') {
    root.classList.add('theme-custom');
    root.setAttribute('data-theme', 'custom');

    root.style.setProperty('--bg-canvas', customPalette.canvas);
    root.style.setProperty('--card-surface', customPalette.card);
    root.style.setProperty('--bg-header', customPalette.header);
    root.style.setProperty('--btn-primary', customPalette.button);
    root.style.setProperty('--btn-primary-text', getContrastingText(customPalette.button));
    root.style.setProperty('--border-subtle', customPalette.border);
    root.style.setProperty('--text-primary', customPalette.text);
    root.style.setProperty('--hover-bg', customPalette.hover);

    const isDarkCanvas = customPalette.canvas.toUpperCase() === '#2F4860' || customPalette.canvas.toUpperCase() === '#152230';
    root.style.colorScheme = isDarkCanvas ? 'dark' : 'light';
  } else {
    // ice (default)
    root.classList.add('theme-ice');
    root.setAttribute('data-theme', 'ice');
    root.style.colorScheme = 'light';
  }

  return effective;
}

export function setThemePreference(preference: ThemeMode, customPalette?: CustomPalette): ThemeMode {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, preference);
  }
  return applyTheme(preference, customPalette);
}
