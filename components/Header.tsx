"use client";

import Link from "next/link";
import { useApp } from "./AppProvider";
import { useWeb3 } from "./Web3Provider";
import { dict } from "@/lib/i18n";
import { ARBITRUM_SEPOLIA_EXPLORER } from "@/lib/contracts/bizproof";

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
    <>
      {/* Realtime Network Bar (Flat & Minimal) */}
      <div className="bn-ticker-bar">
        <div className="container bn-ticker-inner">
          <div className="bn-ticker-left">
            <span className="bn-pulse-dot" />
            <span>Arbitrum Sepolia (421614)</span>
            <span style={{ color: "rgba(255,255,255,0.2)" }}>|</span>
            <span style={{ color: "var(--muted)" }}>Avg Block: 0.25s</span>
            <span style={{ color: "rgba(255,255,255,0.2)" }}>|</span>
            <span style={{ color: "var(--muted)" }}>Gas: &lt; $0.001</span>
          </div>

          <div className="bn-ticker-metrics">
            <span className="bn-ticker-metric">
              Volume: Rp 48.2M+
            </span>
            <span className="bn-ticker-metric">
              Attestation: 1,420+
            </span>
            <a
              href={ARBITRUM_SEPOLIA_EXPLORER}
              target="_blank"
              rel="noreferrer"
              style={{ color: "var(--primary)", textDecoration: "none" }}
            >
              Arbiscan ↗
            </a>
          </div>
        </div>
      </div>

      <header className="header">
        <div className="container header-inner">
          <Link href="/" className="brand" aria-label="BizProof Home">
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
            {/* Web3 Wallet Connection Button (Solid Color, No Emojis, No Gradients) */}
            {!account ? (
              <button
                className="bn-btn-primary"
                style={{
                  fontSize: 13,
                  padding: "7px 16px",
                  borderRadius: 6,
                }}
                onClick={connectWallet}
                disabled={isConnecting}
              >
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
                  borderRadius: 6,
                }}
                onClick={switchToArbitrum}
                title="Beralih ke Arbitrum Sepolia"
              >
                Switch to Arbitrum Sepolia
              </button>
            ) : (
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  padding: "5px 10px",
                  borderRadius: 6,
                  fontSize: 12,
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    backgroundColor: "#10b981",
                  }}
                  title="Arbitrum Sepolia Connected"
                />
                <span style={{ color: "var(--muted)", fontSize: 11 }}>
                  {balance ? `${balance} ETH` : "Arb Sepolia"}
                </span>
                <span
                  style={{
                    fontFamily: "monospace",
                    fontWeight: 700,
                    color: "var(--text)",
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
                    color: "var(--muted)",
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
              {lang === "id" ? "ID" : "EN"}
            </button>

            <button
              className="btn-theme"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              aria-label="Toggle theme"
              title={theme === "light" ? "Mode Gelap" : "Mode Terang"}
              style={{ fontSize: 12, fontWeight: 600 }}
            >
              {theme === "light" ? "DARK" : "LIGHT"}
            </button>

            <Link href="/login" className="btn-cta">
              {t.nav_login}
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
