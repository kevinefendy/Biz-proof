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

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("id");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [role, setRole] = useState<Role>("buyer");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <Ctx.Provider value={{ lang, setLang, theme, setTheme, role, setRole }}>{children}</Ctx.Provider>
  );
}

export function useApp(): AppState {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp must be used within AppProvider");
  return v;
}
