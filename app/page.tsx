"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useApp } from "@/components/AppProvider";
import { dict } from "@/lib/i18n";
import VerifyInputBox from "@/components/VerifyInputBox";
import { mockAttestations, ARBISCAN_BASE } from "@/lib/mock";
import { ARBITRUM_SEPOLIA_EXPLORER } from "@/lib/contracts/bizproof";

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
      {/* 1. HERO SECTION WITH FLAT STATS RIBBON (NO CARDS) */}
      <section className="bn-hero-section">
        <div className="bn-hero-glow-orb" />
        <div className="container bn-hero-content">
          <div className="bn-hero-badge">
            <span className="bn-pulse-dot" />
            <span>Arbitrum Sepolia L2 • Zero Raw Upload • Anti Double-Financing</span>
          </div>

          <h1 className="bn-hero-title">
            Bukti <span className="gradient-text">Konfirmasi Pembeli</span>
            <br />
            untuk Tagihan Bisnis.
          </h1>

          <p className="bn-hero-desc">
            Cek keabsahan piutang usaha langsung di blockchain dalam hitungan detik. Tanpa telepon bolak-balik ke
            purchasing buyer, dan invoice yang sama terkunci dari upaya penjaminan ganda ke bank lain.
          </p>

          <div className="bn-hero-actions">
            <a href="#verify-sandbox" className="bn-btn-primary">
              Cek Tagihan Sekarang
            </a>
            <Link href="/app/overview" className="bn-btn-outline">
              Portal Pembeli Enterprise →
            </Link>
          </div>

          {/* Clean Flat Stats Ribbon (Border-separated, no card boxes) */}
          <div className="bn-stats-ribbon">
            <div className="bn-stat-col">
              <div className="bn-stat-label">
                Attestation Aktif <span className="bn-stat-trend">+18.4%</span>
              </div>
              <div className="bn-stat-number">1,420+</div>
              <div className="bn-stat-note">Tercatat di Arbitrum Sepolia</div>
            </div>

            <div className="bn-stat-col">
              <div className="bn-stat-label">
                Volume Terverifikasi <span className="bn-stat-trend">Live</span>
              </div>
              <div className="bn-stat-number">Rp 48.2 M</div>
              <div className="bn-stat-note">Nilai invoice yang disetujui pembeli</div>
            </div>

            <div className="bn-stat-col">
              <div className="bn-stat-label">
                Insiden Double-Pledge <span className="bn-stat-trend">0</span>
              </div>
              <div className="bn-stat-number">Nol Kasus</div>
              <div className="bn-stat-note">Dicegah registry hash unik on-chain</div>
            </div>

            <div className="bn-stat-col">
              <div className="bn-stat-label">
                Waktu Cek <span className="bn-stat-trend">&lt; $0.001</span>
              </div>
              <div className="bn-stat-number">&lt; 1 Detik</div>
              <div className="bn-stat-note">Query RPC node tanpa biaya gas</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. UNIFIED SEARCH & VERIFICATION SANDBOX */}
      <section className="lexi-verify-section" id="verify-sandbox">
        <div className="container">
          <div className="center" style={{ marginBottom: 28 }}>
            <span className="pill" style={{ marginBottom: 10 }}>
              Verifikasi Publik Terbuka
            </span>
            <h2 style={{ fontSize: "clamp(24px, 3vw, 32px)", margin: "0 0 8px", fontWeight: 800 }}>
              Periksa Keabsahan Tagihan & Rekening Bayar<span className="dot-cyan">.</span>
            </h2>
            <p className="muted" style={{ maxWidth: 640, margin: "0 auto" }}>
              Ketik UID attestation atau uji dokumen invoice Anda. File fisik tetap tersimpan di laptop Anda; browser hanya
              mencocokkan sidik jari SHA-256 yang sudah dibubuhi salt acak.
            </p>
          </div>

          <div className="lexi-verify-box-wrapper">
            <VerifyInputBox />
          </div>
        </div>
      </section>

      {/* 3. ATTESTATION LEDGER TABLE */}
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

              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                {/* Search in Ledger */}
                <input
                  type="text"
                  placeholder="Cari UID, Buyer, Supplier…"
                  value={searchLedger}
                  onChange={(e) => setSearchLedger(e.target.value)}
                  style={{
                    background: "var(--surface-sub)",
                    border: "1px solid var(--border)",
                    borderRadius: 6,
                    padding: "5px 12px",
                    fontSize: 12,
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

            {/* Table */}
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
                          style={{ fontSize: 11, color: "var(--primary)" }}
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
                          style={{ marginRight: 6, fontSize: 12, padding: "3px 8px" }}
                        >
                          Verifikasi
                        </Link>
                        <a
                          href={`${ARBITRUM_SEPOLIA_EXPLORER}/tx/${a.txHash}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: "var(--primary)", fontSize: 12, textDecoration: "none" }}
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

      {/* 4. TOOLS BY ROLE (MINIMAL ROW LAYOUT, NO CHUNKY BOXES) */}
      <section style={{ padding: "64px 0", background: "var(--surface)" }}>
        <div className="container">
          <div className="center" style={{ marginBottom: 36 }}>
            <span className="pill" style={{ marginBottom: 10 }}>
              Alat Kerja Menurut Peran
            </span>
            <h2 style={{ fontSize: "clamp(24px, 3vw, 32px)", margin: "0 0 8px", fontWeight: 800 }}>
              Satu Bukti Konfirmasi<span className="dot-cyan">,</span> Beda Kebutuhan Akses
            </h2>
            <p className="muted" style={{ maxWidth: 640, margin: "0 auto" }}>
              Anda tidak perlu mengganti software akuntansi atau format PDF invoice. Kami hanya menyematkan bukti
              persetujuan pembeli ke jaringan Arbitrum.
            </p>
          </div>

          <div className="bn-roles-grid">
            {/* Role 1: Enterprise Buyer */}
            <div className="bn-role-row">
              <div className="bn-role-icon">🏢</div>
              <div>
                <div className="bn-role-title">Portal Pembeli Enterprise</div>
                <div className="bn-role-desc">
                  Atur kewenangan approver berdasarkan limit tagihan. Konfirmasi berjalan gasless via relayer, sementara
                  seluruh jejak persetujuan tersimpan permanen.
                </div>
                <Link href="/app/overview" style={{ color: "var(--primary)", fontWeight: 600, fontSize: 13 }}>
                  Buka Portal Pembeli →
                </Link>
              </div>
            </div>

            {/* Role 2: Lender Engine */}
            <div className="bn-role-row">
              <div className="bn-role-icon">🏦</div>
              <div>
                <div className="bn-role-title">Mesin Verifier Bank & SCF</div>
                <div className="bn-role-desc">
                  Pemeriksaan massal via REST API. Begitu pinjaman disetujui, tandai status FINANCED agar invoice yang
                  sama tidak bisa dijaminkan ke bank lain.
                </div>
                <Link href="/lender/verify" style={{ color: "var(--primary)", fontWeight: 600, fontSize: 13 }}>
                  Portal Bank & Fintek →
                </Link>
              </div>
            </div>

            {/* Role 3: Supplier Passport */}
            <div className="bn-role-row">
              <div className="bn-role-icon">📈</div>
              <div>
                <div className="bn-role-title">Supplier Passport</div>
                <div className="bn-role-desc">
                  Portofolio rekam jejak pembayaran yang sudah diakui pembeli resmi. Tunjukkan link ini ke calon klien baru
                  atau lembaga pembiayaan piutang.
                </div>
                <Link href="/passport/sup_karyawaha_001" style={{ color: "var(--primary)", fontWeight: 600, fontSize: 13 }}>
                  Lihat Contoh Passport →
                </Link>
              </div>
            </div>

            {/* Role 4: Payee Lock */}
            <div className="bn-role-row">
              <div className="bn-role-icon">🔒</div>
              <div>
                <div className="bn-role-title">Payee Lock Protection</div>
                <div className="bn-role-desc">
                  Kunci nomor rekening bank penerima dalam hash sebelum dicatat. Jika tagihan dialihkan ke rekening pribadi
                  sales, sistem langsung memunculkan tanda bahaya.
                </div>
                <Link href="/docs" style={{ color: "var(--primary)", fontWeight: 600, fontSize: 13 }}>
                  Pelajari Mekanisme →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. WORKFLOW TIMELINE (PURE FLOW, NO BOX CARDS) */}
      <section style={{ padding: "64px 0", background: "var(--bg)", borderTop: "1px solid var(--border)" }}>
        <div className="container">
          <div className="center" style={{ marginBottom: 36 }}>
            <span className="pill" style={{ marginBottom: 10 }}>
              Alur Kerja Nyata
            </span>
            <h2 style={{ fontSize: "clamp(24px, 3vw, 32px)", margin: "0 0 8px", fontWeight: 800 }}>
              Dari Faktur Fisik Sampai Pencairan Dana<span className="dot-cyan">.</span>
            </h2>
          </div>

          <div className="bn-flow-strip">
            <div className="bn-flow-col">
              <div className="bn-flow-idx">01 / SUBMIT</div>
              <div className="bn-flow-heading">Hitung Hash di Browser</div>
              <div className="bn-flow-text">
                Supplier membuat komitmen SHA-256 dan salt acak dari berkas tagihan. File fisik tetap di laptop; tidak ada data mentah yang diunggah.
              </div>
            </div>

            <div className="bn-flow-col">
              <div className="bn-flow-idx">02 / APPROVAL</div>
              <div className="bn-flow-heading">Persetujuan Pembeli</div>
              <div className="bn-flow-text">
                Tim purchasing atau keuangan pembeli memvalidasi penerimaan barang, memastikan nomor rekening tujuan, lalu menandatangani attestation.
              </div>
            </div>

            <div className="bn-flow-col">
              <div className="bn-flow-idx">03 / ARBITRUM</div>
              <div className="bn-flow-heading">Catat ke Arbitrum L2</div>
              <div className="bn-flow-text">
                Bukti tersimpan permanen di smart contract Arbitrum Sepolia dengan format EAS. Dokumen ini tidak bisa dihapus atau diedit sepihak.
              </div>
            </div>

            <div className="bn-flow-col">
              <div className="bn-flow-idx">04 / FUNDING</div>
              <div className="bn-flow-heading">Verifikasi & Cairkan Dana</div>
              <div className="bn-flow-text">
                Bank mengecek keabsahan klaim dalam satu detik dan mengunci status FINANCED on-chain sebelum mencairkan kredit SCF.
              </div>
            </div>
          </div>

          {/* 6. OPEN 2-COLUMN TRUST SECTION (ZERO CARD-IN-CARD) */}
          <div className="bn-trust-section">
            <div className="bn-trust-intro">
              <span className="pill" style={{ marginBottom: 12 }}>Keamanan Tanpa Kompromi</span>
              <h3>Prinsip Privasi & Batasan Teknis yang Jujur</h3>
              <p>
                Kami percaya transparansi arsitektur jauh lebih berguna daripada sekadar janji pemasaran.
                Berikut jaminan kriptografis dan batasan nyata protokol BizProof.
              </p>
            </div>

            <div className="bn-trust-list">
              <div className="bn-trust-row">
                <div className="bn-trust-num">01</div>
                <div className="bn-trust-body">
                  <h4>Nol Berkas Mentah di Server</h4>
                  <p>BizProof tidak menyimpan salinan PDF atau rincian item barang. Kami hanya mencatat sidik jari hash kriptografis.</p>
                </div>
              </div>

              <div className="bn-trust-row">
                <div className="bn-trust-num">02</div>
                <div className="bn-trust-body">
                  <h4>Salt Acak per Dokumen</h4>
                  <p>Nominal invoice dan nomor rekening dilindungi salt acak unik agar tidak bisa ditebak melalui brute-force rainbow table.</p>
                </div>
              </div>

              <div className="bn-trust-row">
                <div className="bn-trust-num">03</div>
                <div className="bn-trust-body">
                  <h4>Bebas Ketergantungan Server</h4>
                  <p>Bila server BizProof padam, bukti konfirmasi tetap ada di Arbitrum dan bisa diverifikasi mandiri lewat node blockchain.</p>
                </div>
              </div>

              <div className="bn-trust-row">
                <div className="bn-trust-num">04</div>
                <div className="bn-trust-body">
                  <h4>Batasan Kasus Kolusi</h4>
                  <p>Jika pembeli dan supplier sengaja bersekongkol membuat faktur fiktif bersama, attestation tetap tercatat valid. Protokol membuktikan siapa yang menyetujui, bukan kebenaran mutlak isi transaksi.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
