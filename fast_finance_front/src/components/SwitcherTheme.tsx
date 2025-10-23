"use client";
import { useTheme } from "next-themes";
import React, { use, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import Cookies from "js-cookie";

const SwitcherTheme = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Evita hidration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const savedTheme = Cookies.get("theme");
    if (savedTheme) {
      setTheme(savedTheme as "light" | "dark");
    }
    setTheme(Cookies.get("theme") as "light" | "dark");
  }, []);

  if (!mounted) {
    return null; // ou um skeleton
  }

  return (
    <div className="flex items-center justify-center rounded-2xl">
      <Button
        id="theme-toggle"
        onClick={() => {
          const newTheme = theme === "dark" ? "light" : "dark";
          setTheme(newTheme);
          Cookies.set("theme", newTheme);
        }}
        variant="outline"
        size="icon"
        className="rounded-full p-2"
        aria-label="Toggle theme"
      >
        {theme === "dark" ? <Sun /> : <Moon />}
      </Button>
    </div>
  );
};

export default SwitcherTheme;
