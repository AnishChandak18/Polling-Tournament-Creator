"use client";

import { useEffect, useState } from "react";
import type { ColorMode } from "@/lib/theme";
import { getSavedColorMode, setColorMode } from "@/lib/theme";
import { Button } from "@/components/ui/button";

export default function TeamThemeSwitcher() {
  const [mode, setMode] = useState<ColorMode>("system");

  useEffect(() => {
    const savedMode = getSavedColorMode();
    if (savedMode) setMode(savedMode);
  }, []);

  return (
    <div className="mt-8 rounded-2xl border bg-black/20 p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-xs font-black uppercase tracking-widest text-text/70">Theme</div>
          <div className="mt-1 text-lg font-black uppercase tracking-tight">{mode}</div>
          <div className="mt-2 text-sm text-text/70">Team-based theming has been removed.</div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={mode === "light" ? "default" : "outline"}
            onClick={() => {
              setMode("light");
              setColorMode("light");
            }}
          >
            Light
          </Button>
          <Button
            variant={mode === "dark" ? "default" : "outline"}
            onClick={() => {
              setMode("dark");
              setColorMode("dark");
            }}
          >
            Dark
          </Button>
          <Button
            variant={mode === "system" ? "default" : "outline"}
            onClick={() => {
              setMode("system");
              setColorMode("system");
            }}
          >
            System
          </Button>
        </div>
      </div>
    </div>
  );
}

