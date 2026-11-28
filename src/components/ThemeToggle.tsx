"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Moon, Sun, SunMoon } from "lucide-react";

type Mode = "light" | "dark" | "system";
const KEY = "j999-theme";

function apply(mode: Mode) {
  const dark = mode === "dark" || (mode === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
}

export default function ThemeToggle() {
  const t = useTranslations("theme");
  const [mode, setMode] = useState<Mode>("system");

  useEffect(() => {
    let m: Mode = "system";
    try { const v = localStorage.getItem(KEY); if (v === "light" || v === "dark") m = v; } catch {}
    setMode(m);
    const mq = matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => { if ((localStorage.getItem(KEY) || "system") === "system") apply("system"); };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const cycle = () => {
    const next: Mode = mode === "system" ? "light" : mode === "light" ? "dark" : "system";
    setMode(next);
    try { next === "system" ? localStorage.removeItem(KEY) : localStorage.setItem(KEY, next); } catch {}
    apply(next);
  };
  const Icon = mode === "light" ? Sun : mode === "dark" ? Moon : SunMoon;
  return (
    <button className="icon-btn" onClick={cycle} title={t(mode)} aria-label={t(mode)}>
      <Icon className="h-4 w-4" />
    </button>
  );
}
