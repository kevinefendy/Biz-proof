"use client";

import Link from "next/link";
import { useApp } from "./AppProvider";
import { useWeb3 } from "./Web3Provider";
import { dict } from "@/lib/i18n";

export default function Header() {
  const { lang, setLang, theme, setTheme } = useApp();
  const {
    account,
    balance,
    isCorrectNetwork,
    isConnecting,
    connectWallet,
    disconnectWallet,
    switchToArbitrum,
    shortAddress,
  } = useWeb3();
  const t = dict[lang];

  return (
    <header className="header">
      <div className="container header-inner">
        <Link href="/" className="brand" aria-label="BizProof Home">
          <span className="brand-mark">◈</span> BizProof<span className="dot-cyan">.</span>
        </Link>

        <nav className="nav">
          <Link href="/verify">{t.nav_verify}</Link>
          <Link href="/passport/sup_karyawaha_001">{t.nav_passport}</Link>
          <Link href="/pricing">{t.nav_pricing}</Link>
          <Link href="/docs">{t.nav_docs}</Link>
          <Link href="/app/overview">{t.nav_dashboard}</Link>
        </nav>

        <div className="header-actions">
          {/* Web3 Wallet Connection Button */}
          {!account ? (
            <button
              className="btn sm"
              style={{
                background: "linear-gradient(135deg, #1b3574 0%, #2854b7 100%)",
                color: "#ffffff",
                border: "1px solid rgba(110, 168, 254, 0.4)",
                fontWeight: 600,
                fontSize: 13,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 14px",
                borderRadius: 8,
              }}
              onClick={connectWallet}
              disabled={isConnecting}
            >
              <span style={{ fontSize: 14 }}>🦊</span>
              {isConnecting ? "Menghubungkan…" : "Connect Wallet"}
            </button>
          ) : !isCorrectNetwork ? (
            <button
              className="btn sm"
              style={{
                backgroundColor: "#fff1f0",
                color: "#cf1322",
                border: "1px solid #ffa39e",
                fontWeight: 600,
                fontSize: 12,
                borderRadius: 8,
              }}
              onClick={switchToArbitrum}
              title="Klik untuk beralih ke Arbitrum Sepolia"
            >
              ⚠ Switch to Arb Sepolia
            </button>
          ) : (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                padding: "4px 8px 4px 10px",
                borderRadius: 8,
                fontSize: 12,
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: "#10b981",
                  boxShadow: "0 0 6px rgba(16, 185, 129, 0.6)",
                }}
                title="Arbitrum Sepolia Connected"
              />
              <span style={{ color: "var(--text-muted)", fontSize: 11 }}>
                {balance ? `${balance} ETH` : "Arb Sepolia"}
              </span>
              <span
                style={{
                  fontFamily: "monospace",
                  fontWeight: 600,
                  color: "var(--text-main)",
                }}
              >
                {shortAddress(account)}
              </span>
              <button
                type="button"
                onClick={disconnectWallet}
                title="Disconnect Wallet"
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                  padding: "0 2px",
                  fontSize: 13,
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>
          )}

          <button
            className="btn-lang"
            onClick={() => setLang(lang === "id" ? "en" : "id")}
            title="Ganti Bahasa / Switch Language"
          >
            {lang === "id" ? "ID | EN" : "EN | ID"}
          </button>

          <button
            className="btn-theme"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            aria-label="Toggle theme"
            title={theme === "light" ? "Mode Gelap" : "Mode Terang"}
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>

          <Link href="/login" className="btn-cta">
            {t.nav_login}
          </Link>
        </div>
      </div>
    </header>
  );
}
