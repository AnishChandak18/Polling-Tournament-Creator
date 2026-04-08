"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { setColorMode } from "@/lib/theme";

export default function ThemeToggle({ className = "" }) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const nextDark = !isDark;
    setIsDark(nextDark);
    setColorMode(nextDark ? "dark" : "light");
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={[
        "inline-flex items-center justify-center rounded-xl border border-brand-border-light bg-brand-surface-light p-2.5 text-brand-text-light shadow-sm",
        "dark:border-brand-border/20 dark:bg-brand-surface dark:text-brand-primary dark:shadow-2xl",
        "hover:opacity-90 active:scale-95 transition",
        className,
      ].join(" ")}
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}

