export type ColorMode = "light" | "dark" | "system";

const MODE_KEY = "ptc.colorMode";

function applyEffectiveDarkClass(isDark: boolean) {
  document.documentElement.classList.toggle("dark", isDark);
}

export function setColorMode(mode: ColorMode) {
  // UI is locked to dark mode for now.
  localStorage.setItem(MODE_KEY, "dark");
  applyEffectiveDarkClass(true);
}

export function getSavedColorMode(): ColorMode | null {
  const saved = localStorage.getItem(MODE_KEY) as ColorMode | null;
  return saved ?? "dark";
}

export function applySavedThemeOnLoad() {
  setColorMode("dark");
}

