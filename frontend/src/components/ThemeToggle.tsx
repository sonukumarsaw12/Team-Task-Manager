"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface ThemeToggleProps {
  variant?: "default" | "sidebar";
}

export function ThemeToggle({ variant = "default" }: ThemeToggleProps) {
  const { setTheme, resolvedTheme, theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";

  if (variant === "sidebar") {
    return (
      <div className="flex items-center gap-1 bg-foreground/5 backdrop-blur-xl border border-foreground/10 rounded-2xl p-1.5 w-full relative overflow-hidden shadow-inner">
        {/* Active Pill */}
        <motion.div
          className="absolute h-[calc(100%-12px)] w-[calc(50%-6px)] bg-primary/20 border border-primary/20 rounded-xl z-0"
          initial={false}
          animate={{
            x: isDark ? "100%" : "0%",
            marginLeft: isDark ? "2px" : "0px"
          }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 30
          }}
        />

        {/* Light Option */}
        <button
          onClick={() => setTheme("light")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-colors relative z-10 ${
            !isDark ? "text-primary" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Sun className={`h-4 w-4 ${!isDark ? "fill-primary/20" : ""}`} />
          <span>Light</span>
        </button>

        {/* Dark Option */}
        <button
          onClick={() => setTheme("dark")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-colors relative z-10 ${
            isDark ? "text-primary" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Moon className={`h-4 w-4 ${isDark ? "fill-primary/20" : ""}`} />
          <span>Dark</span>
        </button>
      </div>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative rounded-full hover:bg-foreground/5 transition-colors duration-300"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
