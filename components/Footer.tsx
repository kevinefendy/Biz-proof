"use client";
import Link from "next/link";
import { useApp } from "./AppProvider";
import { dict } from "@/lib/i18n";

export default function Footer() {
  const { lang } = useApp();
  const t = dict[lang];

  return (
    <footer className="hw-foot">
      <div className="container hw-foot-inner">
        <span className="hw-foot-brand">◈ BizProof — Buyer-confirmed records.</span>
        <nav className="hw-foot-links" aria-label="Footer">
          <Link href="/verify">{t.nav_verify}</Link>
          <Link href="/pricing">{t.nav_pricing}</Link>
          <Link href="/docs">{t.nav_docs}</Link>
          <a href="https://sepolia.arbiscan.io" target="_blank" rel="noreferrer">
            Arbiscan ↗
          </a>
          <a href="https://attest.org" target="_blank" rel="noreferrer">
            EAS ↗
          </a>
          <Link href="/login">{t.auth_to_login}</Link>
        </nav>
        <span className="hw-foot-meta">© 2026 · Arbitrum Sepolia 421614</span>
      </div>
    </footer>
  );
}
