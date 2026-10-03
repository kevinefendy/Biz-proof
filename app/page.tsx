"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useApp } from "@/components/AppProvider";
import { dict } from "@/lib/i18n";
import VerifyInputBox from "@/components/VerifyInputBox";
import { mockAttestations } from "@/lib/mock";
import { ARBITRUM_SEPOLIA_EXPLORER } from "@/lib/contracts/bizproof";

type LedgerFilter = "ALL" | "CONFIRMED" | "FINANCED" | "MISMATCH" | "REVOKED";

const TYPED_LINE = "GET /v1/attestations/0x7f3a…9c2e  HTTP/1.1";

export default function Home() {
  const { lang } = useApp();
  const t = dict[lang];

  const [ledgerFilter, setLedgerFilter] = useState<LedgerFilter>("ALL");
  const [searchLedger, setSearchLedger] = useState("");
  const [typed, setTyped] = useState(TYPED_LINE);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setTyped("");
    let i = 0;
    const id = window.setInterval(() => {
      i += 2;
      setTyped(TYPED_LINE.slice(0, i));
      if (i >= TYPED_LINE.length) window.clearInterval(id);
    }, 24);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const els = Array.from(document.querySelectorAll(".hw-reveal"));
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const counts = useMemo(() => {
    const all = mockAttestations;
    return {
      total: all.length,
      confirmed: all.filter((a) => a.status === "CONFIRMED").length,
      financed: all.filter((a) => a.status === "FINANCED").length,
      mismatch: all.filter((a) => a.payeeMismatch).length,
      revoked: all.filter((a) => a.status === "REVOKED").length,
    };
  }, []);

  const filteredAttestations = useMemo(() => {
    return mockAttestations.filter((a) => {
      if (ledgerFilter === "CONFIRMED" && a.status !== "CONFIRMED") return false;
      if (ledgerFilter === "FINANCED" && a.status !== "FINANCED") return false;
      if (ledgerFilter === "MISMATCH" && !a.payeeMismatch) return false;
      if (ledgerFilter === "REVOKED" && a.status !== "REVOKED") return false;
      if (searchLedger.trim()) {
        const query = searchLedger.toLowerCase();
        return (
          a.uid.toLowerCase().includes(query) ||
          a.refNo.toLowerCase().includes(query) ||
          a.issuer.toLowerCase().includes(query) ||
          a.supplierName.toLowerCase().includes(query) ||
          a.invoiceHash.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [ledgerFilter, searchLedger]);

  const steps = [
    { n: "1.0", t: t.step1t, d: t.step1d },
    { n: "2.0", t: t.step2t, d: t.step2d },
    { n: "3.0", t: t.step3t, d: t.step3d },
    { n: "4.0", t: t.step4t, d: t.step4d },
  ];
  const trust = [
    { n: "01", t: t.trust1t, d: t.trust1d },
    { n: "02", t: t.trust2t, d: t.trust2d },
    { n: "03", t: t.trust3t, d: t.trust3d },
    { n: "04", t: t.trust4t, d: t.trust4d },
  ];

  return (
    <div className="full-bleed hw-wrap">
      <link
        href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap"
        rel="stylesheet"
      />

      {/* 1. HERO — H2 split diptych, title kiri, code-card kanan */}
      <section className="container hw-hero">
        <div>
          <h1>
            {t.hero_t1}
            <br />
            {t.hero_t2}
          </h1>
          <p className="hw-lede">{t.hero_lede}</p>
          <div className="hw-hero-actions">
            <a href="#verify-sandbox" className="hw-btn hw-btn-primary">
              {t.hero_cta_main}
            </a>
            <Link href="/docs" className="hw-link">
              {t.hero_cta_docs}
            </Link>
          </div>
          <p className="hw-lede" style={{ fontSize: 13, marginTop: 20, fontFamily: "var(--font-mono)" }}>
            {t.hero_facts}
          </p>
        </div>
        <figure className="hw-code hw-reveal" aria-label="Contoh respons API attestation">
          <div className="hw-code-head">
            <span>api.bizproof.id — production</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>JSON · GET</span>
          </div>
          <pre className="hw-code-body">
            <code>
              <span className="hw-tok-key">{typed}</span>
              {"\n\nhost: api.bizproof.id\n\n"}
              <span className="hw-status-ok">200 OK</span>
              {"\n{\n"}
              {'  "uid": "0x7f3a…9c2e",\n'}
              {'  "issuer": "PT Sumber Diri Sembilan",\n'}
              {'  "subject": "PT Karyawaha Ekamulya",\n'}
              {'  "schema": "INVOICE_CONFIRMED",\n'}
              {'  "status": "CONFIRMED",\n'}
              {'  "payeeMatch": true\n}'}
            </code>
          </pre>
        </figure>
      </section>

      {/* 2. VERIFY SANDBOX — C2 inline form (fungsional, bukan CTA email) */}
      <section className="container hw-section hw-reveal" id="verify-sandbox">
        <h2>{t.s_verify_t}</h2>
        <p className="hw-lede">{t.s_verify_d}</p>
        <div style={{ maxWidth: 780, marginTop: 20 }}>
          <VerifyInputBox />
        </div>
      </section>

      {/* 3. LEDGER — F3 tabular spec sheet, angka jujur dari data sandbox */}
      <section className="container hw-section hw-reveal">
        <h2>{t.s_ledger_t}</h2>
        <p className="hw-lede">
          {counts.total} {t.s_ledger_samples} · {counts.confirmed} confirmed · {counts.financed}{" "}
          financed · {counts.mismatch} payee mismatch · {counts.revoked} revoked.{" "}
          {t.s_ledger_suffix} <span className="hw-ph">{t.metric_pending}</span>.
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
          <input
            type="text"
            className="hw-ledger-search"
            placeholder={t.ledger_search_ph}
            value={searchLedger}
            onChange={(e) => setSearchLedger(e.target.value)}
            aria-label={t.ledger_search_ph}
            style={{
              background: "var(--color-paper)",
              border: "1px solid var(--color-rule-2)",
              borderRadius: 6,
              padding: "10px 12px",
              fontSize: 13,
              color: "var(--color-ink)",
              outline: "2px solid transparent",
              minHeight: 44,
              minWidth: 240,
            }}
          />
          {(["ALL", "CONFIRMED", "FINANCED", "MISMATCH", "REVOKED"] as LedgerFilter[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setLedgerFilter(f)}
              aria-pressed={ledgerFilter === f}
              className="hw-btn"
              style={{
                padding: "8px 14px",
                background: ledgerFilter === f ? "var(--color-ink)" : "transparent",
                color: ledgerFilter === f ? "var(--color-paper)" : "var(--color-ink)",
                borderColor: "var(--color-rule-2)",
              }}
            >
              {f === "ALL" ? t.f_all : f === "MISMATCH" ? "Mismatch" : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <div style={{ overflowX: "auto", marginTop: 8 }}>
          <table className="hw-spec">
            <thead>
              <tr>
                <th>{t.th_doc}</th>
                <th>{t.th_buyer}</th>
                <th>{t.th_supplier}</th>
                <th>{t.th_hash}</th>
                <th>{t.th_status}</th>
                <th>{t.th_time}</th>
                <th style={{ textAlign: "right" }}>{t.th_action}</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttestations.map((a) => (
                <tr key={a.uid}>
                  <td>
                    <div style={{ fontWeight: 600, color: "var(--color-ink)" }}>{a.refNo}</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>{a.uid.slice(0, 14)}…</div>
                  </td>
                  <td>{a.issuer}</td>
                  <td>
                    <div>{a.supplierName}</div>
                    <Link href={`/passport/${encodeURIComponent(a.subjectId)}`} className="hw-link" style={{ fontSize: 12 }}>
                      {t.link_passport}
                    </Link>
                  </td>
                  <td>
                    <code style={{ fontFamily: "var(--font-mono)", fontSize: 12 }} title={a.invoiceHash}>
                      {a.invoiceHash.slice(0, 10)}…{a.invoiceHash.slice(-8)}
                    </code>
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>
                    {a.payeeMismatch ? "PAYEE MISMATCH" : a.status}
                  </td>
                  <td style={{ whiteSpace: "nowrap" }}>{a.issuedAt.slice(0, 10)}</td>
                  <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                    <Link href={`/verify/${encodeURIComponent(a.uid)}`} className="hw-link" style={{ fontSize: 12 }}>
                      {t.link_verify}
                    </Link>{" "}
                    <a
                      href={`${ARBITRUM_SEPOLIA_EXPLORER}/tx/${a.txHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="hw-link"
                      style={{ fontSize: 12 }}
                    >
                      Arbiscan ↗
                    </a>
                  </td>
                </tr>
              ))}
              {filteredAttestations.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: 32 }}>
                    {t.ledger_empty}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. WORKFLOW — F4 step sequence, satu-satunya bagian bernomor (ordinal, wajib berurutan) */}
      <section className="container hw-section hw-reveal">
        <h2>{t.s_flow_t}</h2>
        <p className="hw-lede">{t.s_flow_d}</p>
        <ol className="hw-steps">
          {steps.map((s) => (
            <li key={s.n}>
              <span className="hw-stage">{s.n}</span>
              <div>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* 5. TRUST — daftar baris, bukan tabel kedua */}
      <section className="container hw-section hw-reveal">
        <h2>{t.s_trust_t}</h2>
        <p className="hw-lede">{t.s_trust_d}</p>
        <div className="hw-trust" style={{ marginTop: 12 }}>
          {trust.map((r) => (
            <div className="hw-trust-row" key={r.n}>
              <span className="hw-trust-num">{r.n}</span>
              <div>
                <h3 style={{ margin: "0 0 4px", fontSize: 16 }}>{r.t}</h3>
                <p style={{ margin: 0, fontSize: 14 }}>{r.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. FINAL CTA — satu tombol */}
      <section className="container hw-cta-final hw-reveal">
        <h2 style={{ fontSize: "clamp(1.5rem, 2vw + 1rem, 2rem)" }}>{t.final_t}</h2>
        <p className="hw-lede">{t.final_d}</p>
        <div className="hw-hero-actions">
          <Link href="/verify" className="hw-btn hw-btn-primary">
            {t.verify_btn}
          </Link>
        </div>
        <div className="hw-foot-line">
          <span>BizProof · Buyer-confirmed records · Arbitrum Sepolia 421614</span>
          <a href={ARBITRUM_SEPOLIA_EXPLORER} target="_blank" rel="noreferrer">
            Arbiscan ↗
          </a>
        </div>
      </section>
    </div>
  );
}
