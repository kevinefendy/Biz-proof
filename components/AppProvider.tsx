"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Lang, Role } from "@/lib/types";

interface AppState {
  lang: Lang;
  setLang: (l: Lang) => void;
  theme: "light" | "dark";
  setTheme: (t: "light" | "dark") => void;
  role: Role;
  setRole: (r: Role) => void;
}

const Ctx = createContext<AppState | null>(null);

function initialLang(): Lang {
  try {
    return window.localStorage.getItem("bp-lang") === "en" ? "en" : "id";
  } catch {
    return "id";
  }
}

function initialTheme(): "light" | "dark" {
  try {
    const saved = window.localStorage.getItem("bp-theme");
    if (saved === "light" || saved === "dark") return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  } catch {
    return "light";
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("id");
  const [theme, setThemeState] = useState<"light" | "dark">("light");
  const [role, setRole] = useState<Role>("buyer");

  useEffect(() => {
    setLangState(initialLang());
    setThemeState(initialTheme());
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      window.localStorage.setItem("bp-theme", theme);
    } catch {
      /* storage unavailable — theme still applies for this session */
    }
  }, [theme]);

  function setLang(l: Lang) {
    setLangState(l);
    try {
      window.localStorage.setItem("bp-lang", l);
    } catch {
      /* ignore */
    }
  }

  function setTheme(t: "light" | "dark") {
    setThemeState(t);
  }

  return (
    <Ctx.Provider value={{ lang, setLang, theme, setTheme, role, setRole }}>{children}</Ctx.Provider>
  );
}

export function useApp(): AppState {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp must be used within AppProvider");
  return v;
}
