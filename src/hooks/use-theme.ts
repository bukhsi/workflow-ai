import { useEffect, useState } from "react";

type Theme = "light" | "dark";
const KEY = "wpa-theme";

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
}

function readInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  try {
    const stored = window.localStorage.getItem(KEY) as Theme | null;
    if (stored === "dark" || stored === "light") return stored;
  } catch {}
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(readInitialTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = (next: Theme) => {
    setThemeState(next);
    try {
      localStorage.setItem(KEY, next);
    } catch {}
    applyTheme(next);
  };

  const toggle = () => setTheme(theme === "dark" ? "light" : "dark");

  return { theme, setTheme, toggle };
}