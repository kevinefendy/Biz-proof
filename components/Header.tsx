"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
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
  const router = useRouter();
  const [cmdkOpen, setCmdkOpen] = useState(false);
  const [cmdkQuery, setCmdkQuery] = useState("");
  const [cmdkActive, setCmdkActive] = useState(0);
  const cmdkInputRef = useRef<HTMLInputElement>(null);

  const cmdkGroups = useMemo(
    () => [
      { label: t.g_verify, items: [{ label: t.c_verify_pub, href: "/verify" }, { label: t.c_lender_bulk, href: "/lender/verify" }] },
      { label: t.g_buyer, items: [{ label: t.c_overview, href: "/app/overview" }, { label: t.c_queue, href: "/app/confirmations" }, { label: t.c_all_att, href: "/app/attestations" }] },
      { label: t.g_supplier, items: [{ label: t.c_inv_list, href: "/supplier/invoices" }, { label: t.c_inv_new, href: "/supplier/invoices/new" }] },
      { label: t.g_other, items: [{ label: t.nav_pricing, href: "/pricing" }, { label: t.nav_docs, href: "/docs" }, { label: t.nav_login, href: "/login" }] },
    ],
    [t]
  );
  const cmdkResults = useMemo(() => {
    const q = cmdkQuery.trim().toLowerCase();
    const flat = cmdkGroups.flatMap((g) => g.items.map((it) => ({ ...it, group: g.label })));
    if (!q) return flat;
    return flat.filter((it) => `${it.label} ${it.href}`.toLowerCase().includes(q));
  }, [cmdkGroups, cmdkQuery]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdkOpen((v) => !v);
      } else if (e.key === "Escape") {
        setCmdkOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (cmdkOpen) {
      setCmdkQuery("");
      setCmdkActive(0);
      document.body.style.overflow = "hidden";
      window.setTimeout(() => cmdkInputRef.current?.focus(), 30);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [cmdkOpen]);

  function goCmdk(href: string) {
    setCmdkOpen(false);
    router.push(href);
  }

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

          <nav className="nav" aria-label="Utama">
            <Link href="/verify">{t.nav_verify}</Link>
            <Link href="/pricing">{t.nav_pricing}</Link>
            <Link href="/docs">{t.nav_docs}</Link>
          </nav>

          <div className="header-actions">
            <button type="button" className="hw-cmdk-pill" onClick={() => setCmdkOpen(true)} aria-label={`${t.search_title} (Command K)`}>
              <span>{t.search_ph}</span>
              <kbd>⌘K</kbd>
            </button>
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

            <div className="hw-seg" role="group" aria-label="Bahasa / Language">
              <button type="button" aria-pressed={lang === "id"} onClick={() => setLang("id")}>
                ID
              </button>
              <button type="button" aria-pressed={lang === "en"} onClick={() => setLang("en")}>
                EN
              </button>
            </div>

            <button
              className="btn-lang"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              aria-label={theme === "light" ? "Aktifkan mode gelap / Enable dark mode" : "Aktifkan mode terang / Enable light mode"}
              title="Mode Gelap / Mode Terang · Dark / Light mode"
              style={{ minWidth: 64 }}
            >
              {theme === "light" ? t.theme_light : t.theme_dark}
            </button>

            <Link href="/login" className="btn-cta">
              {t.nav_login}
            </Link>
          </div>
        </div>
      </header>

      {cmdkOpen && (
        <div className="hw-cmdk is-open" role="presentation">
          <div className="hw-cmdk-backdrop" onClick={() => setCmdkOpen(false)} />
          <div className="hw-cmdk-panel" role="dialog" aria-modal="true" aria-label={t.search_title}>
            <input
              ref={cmdkInputRef}
              className="hw-cmdk-input"
              value={cmdkQuery}
              onChange={(e) => {
                setCmdkQuery(e.target.value);
                setCmdkActive(0);
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setCmdkActive((i) => Math.min(i + 1, Math.max(cmdkResults.length - 1, 0)));
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setCmdkActive((i) => Math.max(i - 1, 0));
                } else if (e.key === "Enter") {
                  e.preventDefault();
                  const pick = cmdkResults[cmdkActive];
                  if (pick) goCmdk(pick.href);
                }
              }}
              placeholder={t.search_input_ph}
            />
            <div className="hw-cmdk-list" role="listbox" aria-label="Hasil">
              {cmdkResults.length === 0 && (
                <div style={{ padding: "16px", fontSize: 13, color: "var(--muted)" }}>
                  {t.search_empty}
                </div>
              )}
              {cmdkResults.map((r, i) => (
                <button
                  key={`${r.group}-${r.href}`}
                  type="button"
                  role="option"
                  aria-selected={i === cmdkActive}
                  className={`hw-cmdk-item ${i === cmdkActive ? "is-active" : ""}`}
                  onMouseEnter={() => setCmdkActive(i)}
                  onClick={() => goCmdk(r.href)}
                >
                  <span style={{ color: "var(--muted)", fontSize: 11 }}>{r.group}</span>
                  <span>{r.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
