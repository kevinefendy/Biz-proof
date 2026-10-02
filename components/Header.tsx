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
      {/* Binance-style Realtime Ticker Bar */}
      <div className="bn-ticker-bar">
        <div className="container bn-ticker-inner">
          <div className="bn-ticker-left">
            <span className="bn-pulse-dot" />
            <span>
              <span className="bn-ticker-tag">LIVE TESTNET</span> Arbitrum Sepolia (421614)
            </span>
            <span style={{ color: "rgba(255,255,255,0.2)" }}>|</span>
            <span style={{ color: "#94a3b8" }}>Avg Block: <strong>0.25s</strong></span>
            <span style={{ color: "rgba(255,255,255,0.2)" }}>|</span>
            <span style={{ color: "#94a3b8" }}>Gas: <strong>&lt; $0.001</strong></span>
          </div>

          <div className="bn-ticker-metrics">
            <span className="bn-ticker-metric">
              Volume: <strong>Rp 48.2M+</strong>
            </span>
            <span className="bn-ticker-metric">
              Attestation: <strong>1,420+</strong>
            </span>
            <a
              href={ARBITRUM_SEPOLIA_EXPLORER}
              target="_blank"
              rel="noreferrer"
              style={{ color: "#60a5fa", textDecoration: "none" }}
            >
              Arbiscan ↗
            </a>
          </div>
        </div>
      </div>

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
                className="bn-btn-primary"
                style={{
                  fontSize: 13,
                  padding: "7px 16px",
                  borderRadius: 8,
                }}
                onClick={connectWallet}
                disabled={isConnecting}
              >
                <span>🦊</span>
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
                  background: "rgba(15, 23, 42, 0.8)",
                  border: "1px solid rgba(59, 130, 246, 0.3)",
                  padding: "5px 10px",
                  borderRadius: 8,
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
                    boxShadow: "0 0 6px #10b981",
                  }}
                  title="Arbitrum Sepolia Connected"
                />
                <span style={{ color: "#94a3b8", fontSize: 11 }}>
                  {balance ? `${balance} ETH` : "Arb Sepolia"}
                </span>
                <span
                  style={{
                    fontFamily: "monospace",
                    fontWeight: 700,
                    color: "#ffffff",
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
                    color: "#94a3b8",
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
    </>
  );
}
