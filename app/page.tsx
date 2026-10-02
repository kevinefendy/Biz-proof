"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useApp } from "@/components/AppProvider";
import { dict } from "@/lib/i18n";
import VerifyInputBox from "@/components/VerifyInputBox";
import { mockAttestations, ARBISCAN_BASE } from "@/lib/mock";
import { ARBITRUM_SEPOLIA_EXPLORER } from "@/lib/contracts/bizproof";
import type { InvoiceStatus } from "@/lib/types";

type LedgerFilter = "ALL" | "CONFIRMED" | "FINANCED" | "MISMATCH" | "REVOKED";

export default function Home() {
  const { lang } = useApp();
  const t = dict[lang];

  const [ledgerFilter, setLedgerFilter] = useState<LedgerFilter>("ALL");
  const [searchLedger, setSearchLedger] = useState("");

  // Filter attestation ledger data
  const filteredAttestations = useMemo(() => {
    return mockAttestations.filter((a) => {
      // Filter tab
      if (ledgerFilter === "CONFIRMED" && a.status !== "CONFIRMED") return false;
      if (ledgerFilter === "FINANCED" && a.status !== "FINANCED") return false;
      if (ledgerFilter === "MISMATCH" && !a.payeeMismatch) return false;
      if (ledgerFilter === "REVOKED" && a.status !== "REVOKED") return false;

      // Filter search
      if (searchLedger.trim()) {
        const query = searchLedger.toLowerCase();
        const matchUid = a.uid.toLowerCase().includes(query);
        const matchRef = a.refNo.toLowerCase().includes(query);
        const matchBuyer = a.issuer.toLowerCase().includes(query);
        const matchSupplier = a.supplierName.toLowerCase().includes(query);
        const matchHash = a.invoiceHash.toLowerCase().includes(query);
        return matchUid || matchRef || matchBuyer || matchSupplier || matchHash;
      }
      return true;
    });
  }, [ledgerFilter, searchLedger]);

  return (
    <div className="full-bleed">
      {/* 1. BINANCE-STYLE HERO SECTION */}
      <section className="bn-hero-section">
        <div className="bn-hero-glow-orb" />
        <div className="container bn-hero-content">
          <div className="bn-hero-badge">
            <span className="bn-pulse-dot" />
            <span>Arbitrum Sepolia L2 • Zero Raw Upload • Anti Double-Financing</span>
          </div>

          <h1 className="bn-hero-title">
            Protokol <span className="gradient-text">Konfirmasi Invoice</span>
            <br />
            Terdesentralisasi.
          </h1>

          <p className="bn-hero-desc">
            Verifikasi keabsahan piutang bisnis dalam hitungan detik. Lindungi perbankan dan korporasi dari
            risiko <strong>invoice fiktif</strong>, <strong>double financing</strong>, dan pengalihan rekening sales secara instan.
          </p>

          <div className="bn-hero-actions">
            <a href="#verify-sandbox" className="bn-btn-primary">
              ⚡ Coba Verifikasi Gratis
            </a>
            <Link href="/app/overview" className="bn-btn-outline">
              🏢 Jelajahi Portal Buyer →
            </Link>
          </div>

          {/* 24h Stats / KPI Ticker Strip */}
          <div className="bn-stats-grid">
            <div className="bn-stat-card">
              <div className="bn-stat-header">
                <span className="bn-stat-title">Attestation Aktif</span>
                <span className="bn-stat-trend">+18.4%</span>
              </div>
              <div className="bn-stat-value">1,420+</div>
              <div className="bn-stat-sub">Tercatat di Arbitrum Sepolia</div>
            </div>

            <div className="bn-stat-card">
              <div className="bn-stat-header">
                <span className="bn-stat-title">Volume Terverifikasi</span>
                <span className="bn-stat-trend">Live</span>
              </div>
              <div className="bn-stat-value">Rp 48.2 M</div>
              <div className="bn-stat-sub">Total nilai tagihan terkonfirmasi</div>
            </div>

            <div className="bn-stat-card">
              <div className="bn-stat-header">
                <span className="bn-stat-title">Pencegahan Double-Financing</span>
                <span className="bn-stat-trend">100%</span>
              </div>
              <div className="bn-stat-value">0 Insiden</div>
              <div className="bn-stat-sub">Registry hash unik on-chain</div>
            </div>

            <div className="bn-stat-card">
              <div className="bn-stat-header">
                <span className="bn-stat-title">Kecepatan Verifikasi</span>
                <span className="bn-stat-trend">&lt; $0.001</span>
              </div>
              <div className="bn-stat-value">&lt; 1 Detik</div>
              <div className="bn-stat-sub">Client hashing + Arbitrum RPC</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. UNIFIED SEARCH & VERIFICATION SANDBOX */}
      <section className="lexi-verify-section" id="verify-sandbox">
        <div className="container">
          <div className="center" style={{ marginBottom: 32 }}>
            <span className="pill" style={{ marginBottom: 12 }}>
              Mesin Verifikasi Bebas Hambatan
            </span>
            <h2 style={{ fontSize: "clamp(26px, 3vw, 36px)", margin: "0 0 10px", fontWeight: 800 }}>
              Cek Keaslian Tagihan & Rekening<span className="dot-cyan">.</span>
            </h2>
            <p className="muted" style={{ maxWidth: 600, margin: "0 auto" }}>
              Masukkan UID attestation atau uji file invoice Anda secara aman. File tidak pernah meninggalkan peramban.
            </p>
          </div>

          <div className="lexi-verify-box-wrapper">
            <VerifyInputBox />
          </div>
        </div>
      </section>

      {/* 3. BINANCE-STYLE "LIVE ATTESTATION LEDGER" (MARKETS TABLE) */}
      <section className="bn-ledger-section">
        <div className="container">
          <div className="bn-ledger-container">
            {/* Table Header & Tabs */}
            <div className="bn-ledger-header">
              <div className="bn-ledger-title-group">
                <h2>
                  Buku Besar Attestation Terkonfirmasi<span className="dot-cyan">.</span>
                </h2>
                <p>Data transaksi on-chain tersinkronisasi dengan Arbitrum Sepolia Testnet.</p>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                {/* Search in Ledger */}
                <input
                  type="text"
                  placeholder="Cari UID, Buyer, Supplier…"
                  value={searchLedger}
                  onChange={(e) => setSearchLedger(e.target.value)}
                  style={{
                    background: "var(--surface-sub)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    padding: "6px 12px",
                    fontSize: 13,
                    color: "var(--text)",
                    outline: "none",
                  }}
                />

                {/* Filter Tabs */}
                <div className="bn-tabs-nav">
                  <button
                    className={`bn-tab-button ${ledgerFilter === "ALL" ? "active" : ""}`}
                    onClick={() => setLedgerFilter("ALL")}
                  >
                    Semua
                  </button>
                  <button
                    className={`bn-tab-button ${ledgerFilter === "CONFIRMED" ? "active" : ""}`}
                    onClick={() => setLedgerFilter("CONFIRMED")}
                  >
                    ✓ Valid
                  </button>
                  <button
                    className={`bn-tab-button ${ledgerFilter === "FINANCED" ? "active" : ""}`}
                    onClick={() => setLedgerFilter("FINANCED")}
                  >
                    ◆ Financed
                  </button>
                  <button
                    className={`bn-tab-button ${ledgerFilter === "MISMATCH" ? "active" : ""}`}
                    onClick={() => setLedgerFilter("MISMATCH")}
                  >
                    ⚠ Mismatch
                  </button>
                  <button
                    className={`bn-tab-button ${ledgerFilter === "REVOKED" ? "active" : ""}`}
                    onClick={() => setLedgerFilter("REVOKED")}
                  >
                    ✕ Revoked
                  </button>
                </div>
              </div>
            </div>

            {/* Binance-style Ledger Table */}
            <div className="bn-table-responsive">
              <table className="bn-table">
                <thead>
                  <tr>
                    <th>Dokumen / UID</th>
                    <th>Pembeli (Issuer)</th>
                    <th>Supplier (Subjek)</th>
                    <th>Invoice Hash (SHA-256)</th>
                    <th>Status On-Chain</th>
                    <th>Waktu</th>
                    <th style={{ textAlign: "right" }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttestations.map((a) => (
                    <tr key={a.uid}>
                      {/* Document Ref & UID */}
                      <td>
                        <div style={{ fontWeight: 700, color: "var(--text)" }}>{a.refNo}</div>
                        <div style={{ fontFamily: "monospace", fontSize: 11, color: "var(--muted)" }}>
                          {a.uid.slice(0, 14)}…
                        </div>
                      </td>

                      {/* Buyer */}
                      <td>
                        <div className="bn-org-cell">
                          <div className="bn-org-icon">🏢</div>
                          <div>
                            <div style={{ fontWeight: 600 }}>{a.issuer}</div>
                            <div style={{ fontFamily: "monospace", fontSize: 11, color: "var(--muted)" }}>
                              {a.issuerWallet.slice(0, 6)}…{a.issuerWallet.slice(-4)}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Supplier */}
                      <td>
                        <div style={{ fontWeight: 600 }}>{a.supplierName}</div>
                        <Link
                          href={`/passport/${encodeURIComponent(a.subjectId)}`}
                          style={{ fontSize: 11, color: "var(--blue)" }}
                        >
                          Lihat Passport →
                        </Link>
                      </td>

                      {/* Hash */}
                      <td>
                        <code
                          className="mono small"
                          title={a.invoiceHash}
                          style={{
                            background: "var(--surface-sub)",
                            padding: "2px 6px",
                            borderRadius: 4,
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            navigator.clipboard?.writeText(a.invoiceHash);
                            alert("Hash tersalin!");
                          }}
                        >
                          {a.invoiceHash.slice(0, 10)}…{a.invoiceHash.slice(-8)} 📋
                        </code>
                      </td>

                      {/* Status */}
                      <td>
                        {a.payeeMismatch ? (
                          <span className="bn-badge bn-badge-mismatch">⚠ PAYEE MISMATCH</span>
                        ) : a.status === "CONFIRMED" ? (
                          <span className="bn-badge bn-badge-valid">✓ CONFIRMED</span>
                        ) : a.status === "FINANCED" ? (
                          <span className="bn-badge bn-badge-financed">◆ FINANCED</span>
                        ) : a.status === "REVOKED" ? (
                          <span className="bn-badge bn-badge-revoked">✕ REVOKED</span>
                        ) : (
                          <span className="bn-badge">{a.status}</span>
                        )}
                      </td>

                      {/* Date */}
                      <td style={{ color: "var(--muted)", whiteSpace: "nowrap" }}>
                        {a.issuedAt}
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                        <Link
                          href={`/verify/${encodeURIComponent(a.uid)}`}
                          className="btn sm"
                          style={{ marginRight: 6, fontSize: 12, padding: "4px 10px" }}
                        >
                          Verifikasi
                        </Link>
                        <a
                          href={`${ARBITRUM_SEPOLIA_EXPLORER}/tx/${a.txHash}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: "var(--blue)", fontSize: 12, textDecoration: "none" }}
                          title="Lihat Transaksi di Arbiscan Sepolia"
                        >
                          Arbiscan ↗
                        </a>
                      </td>
                    </tr>
                  ))}
                  {filteredAttestations.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ textAlign: "center", padding: "36px", color: "var(--muted)" }}>
                        Tidak ada attestation yang sesuai dengan kriteria filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* 4. BINANCE-STYLE PRODUCT ECOSYSTEM GRID */}
      <section className="lexi-two-products">
        <div className="container">
          <div className="center" style={{ marginBottom: 48 }}>
            <span className="pill" style={{ marginBottom: 12 }}>
              Ekosistem Solusi Terintegrasi
            </span>
            <h2 style={{ fontSize: "clamp(26px, 3vw, 36px)", margin: "0 0 10px", fontWeight: 800 }}>
              Satu Protokol<span className="dot-cyan">,</span> Seluruh Pemangku Kepentingan Bisnis
            </h2>
            <p className="muted" style={{ maxWidth: 640, margin: "0 auto" }}>
              Tidak perlu mengubah format invoice atau ERP Anda — BizProof menyematkan verifikasi kriptografis portabel
              pada tagihan harian.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
            {/* Card 1: Enterprise Buyer */}
            <div className="bn-step-card">
              <div style={{ fontSize: 28, marginBottom: 12 }}>🏢</div>
              <div className="bn-step-title">Enterprise Buyer Portal</div>
              <div className="bn-step-desc" style={{ marginBottom: 16 }}>
                Alur persetujuan tagihan multi-tier, zero gas fee via relayer otomatis, dan log audit anti-manipulasi
                yang melindungi korporasi dari vendor fiktif.
              </div>
              <Link href="/app/overview" style={{ color: "var(--blue)", fontWeight: 600, fontSize: 13 }}>
                Buka Portal Buyer →
              </Link>
            </div>

            {/* Card 2: Lender Engine */}
            <div className="bn-step-card">
              <div style={{ fontSize: 28, marginBottom: 12 }}>🏦</div>
              <div className="bn-step-title">Lender Verifier Engine</div>
              <div className="bn-step-desc" style={{ marginBottom: 16 }}>
                Mesin verifikasi massal, webhook status konfirmasi, dan registry FINANCED yang melindungi bank
                dari penipuan double-pledge invoice.
              </div>
              <Link href="/lender/verify" style={{ color: "var(--blue)", fontWeight: 600, fontSize: 13 }}>
                Portal Bank & Fintek →
              </Link>
            </div>

            {/* Card 3: Supplier Passport */}
            <div className="bn-step-card">
              <div style={{ fontSize: 28, marginBottom: 12 }}>📈</div>
              <div className="bn-step-title">Supplier Passport</div>
              <div className="bn-step-desc" style={{ marginBottom: 16 }}>
                Rekam jejak performa pembayaran terkonfirmasi yang portabel untuk membuka akses pembiayaan SCF
                dengan bunga lebih murah dan pencairan lebih cepat.
              </div>
              <Link href="/passport/sup_karyawaha_001" style={{ color: "var(--blue)", fontWeight: 600, fontSize: 13 }}>
                Lihat Contoh Passport →
              </Link>
            </div>

            {/* Card 4: Payee Lock */}
            <div className="bn-step-card">
              <div style={{ fontSize: 28, marginBottom: 12 }}>🔒</div>
              <div className="bn-step-title">Payee Lock Protection</div>
              <div className="bn-step-desc" style={{ marginBottom: 16 }}>
                Mengunci salted hash rekening bank tujuan pembayaran ke dalam smart contract untuk mendeteksi
                upaya pengalihan dana ke rekening pribadi sales.
              </div>
              <Link href="/docs" style={{ color: "var(--blue)", fontWeight: 600, fontSize: 13 }}>
                Pelajari Mekanisme →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. 4-STEP PROCESS (HOW IT WORKS) */}
      <section className="bn-process-section">
        <div className="container">
          <div className="center" style={{ marginBottom: 48 }}>
            <span className="pill" style={{ marginBottom: 12 }}>
              Alur Kerja 4 Langkah
            </span>
            <h2 style={{ fontSize: "clamp(26px, 3vw, 36px)", margin: "0 0 10px", fontWeight: 800 }}>
              Dari Dokumen Menjadi Bukti Sah di Blockchain<span className="dot-cyan">.</span>
            </h2>
          </div>

          <div className="bn-process-grid">
            <div className="bn-step-card">
              <div className="bn-step-number">1</div>
              <div className="bn-step-title">Hash Dokumen</div>
              <div className="bn-step-desc">
                Supplier menghitung salted hash SHA-256 invoice di browser. File fisik tetap berada di perangkat lokal.
              </div>
            </div>

            <div className="bn-step-card">
              <div className="bn-step-number">2</div>
              <div className="bn-step-title">Konfirmasi Pembeli</div>
              <div className="bn-step-desc">
                Enterprise Buyer memvalidasi penerimaan barang dan rekening bank, lalu menyetujui invoice.
              </div>
            </div>

            <div className="bn-step-card">
              <div className="bn-step-number">3</div>
              <div className="bn-step-title">Pencatatan Arbitrum</div>
              <div className="bn-step-desc">
                Attestation terdaftar secara permanen di smart contract Arbitrum Sepolia dengan EAS standard.
              </div>
            </div>

            <div className="bn-step-card">
              <div className="bn-step-number">4</div>
              <div className="bn-step-title">Pencairan Dana</div>
              <div className="bn-step-desc">
                Lender/Bank memverifikasi attestation secara instan dan menandai status FINANCED untuk cegah double-financing.
              </div>
            </div>
          </div>

          {/* SAFU Security & Cryptographic Trust Banner */}
          <div className="bn-safu-card">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 24 }}>🛡️</span>
              <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>
                Arsitektur Keamanan & Privasi Kriptografis
              </h3>
            </div>
            <p style={{ color: "#94a3b8", margin: "8px 0 0", maxWidth: 700, fontSize: 14 }}>
              BizProof dirancang dengan standar privasi ketat untuk memenuhi regulasi UU PDP dan kepatuhan perbankan.
            </p>

            <div className="bn-safu-grid">
              <div className="bn-safu-item">
                <h4>Zero Raw File Storage</h4>
                <p>Dokumen fisik invoice tidak pernah dikirim ke blockchain atau server publik. Privasi bisnis 100% terjaga.</p>
              </div>

              <div className="bn-safu-item">
                <h4>Salted SHA-256 Hashing</h4>
                <p>Setiap dokumen dan rekening bayar di-hash dengan random salt untuk mencegah serangan brute force pada nominal tagihan.</p>
              </div>

              <div className="bn-safu-item">
                <h4>Independen & Abadi</h4>
                <p>Bukti konfirmasi tercatat di Arbitrum L2. Verifikasi tetap dapat dilakukan independen meski platform BizProof offline.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
