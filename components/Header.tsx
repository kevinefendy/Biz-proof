"use client";
import Link from "next/link";
import { useApp } from "./AppProvider";
import { dict } from "@/lib/i18n";

export default function Header() {
  const { lang, setLang, theme, setTheme } = useApp();
  const t = dict[lang];
  return (
    <header className="header">
      <div className="container header-inner">
        <Link href="/" className="brand">
          <span className="brand-mark">◈</span> BizProof
        </Link>
        <nav className="nav">
          <Link href="/verify">{t.nav_verify}</Link>
          <Link href="/passport/sup_karyawaha_001">{t.nav_passport}</Link>
          <Link href="/pricing">{t.nav_pricing}</Link>
          <Link href="/docs">{t.nav_docs}</Link>
          <Link href="/app/overview">{t.nav_dashboard}</Link>
        </nav>
        <div className="header-actions">
          <button className="btn ghost sm" onClick={() => setLang(lang === "id" ? "en" : "id")}>
            {lang === "id" ? "ID | EN" : "EN | ID"}
          </button>
          <button className="btn ghost sm" onClick={() => setTheme(theme === "light" ? "dark" : "light")} aria-label="theme">
            {theme === "light" ? "🌙" : "☀️"}
          </button>
          <Link href="/login" className="btn primary sm">
            {t.nav_login}
          </Link>
        </div>
      </div>
    </header>
  );
}
