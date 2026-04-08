"use client";

import { useEffect } from "react";
import { applySavedThemeOnLoad } from "@/lib/theme";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    applySavedThemeOnLoad();
  }, []);

  return children;
}

