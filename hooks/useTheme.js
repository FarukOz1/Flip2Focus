import { useSessionStore } from '../store/sessionStore';
import { THEMES, DEFAULT_THEME } from '../constants/themes';

export function useTheme() {
  const activeTheme = useSessionStore((s) => s.activeTheme);
  return THEMES[activeTheme] ?? DEFAULT_THEME;
}
