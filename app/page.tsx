"use client";
import { useState } from "react";
import Link from "next/link";
import { useApp } from "@/components/AppProvider";
import { dict } from "@/lib/i18n";
import VerifyInputBox from "@/components/VerifyInputBox";
import AttestationCard from "@/components/AttestationCard";
import { mockAttestations, ARBISCAN_BASE } from "@/lib/mock";

type AudienceKey = "lender" | "buyer" | "supplier" | "auditor";

interface AudienceContent {
  title: string;
  lead: string;
  tools: { title: string; desc: string }[];
  benefits: { title: string; desc: string }[];
}

const audienceData: Record<AudienceKey, AudienceContent> = {
  lender: {
    title: "Bank & Lembaga Pembiayaan",
    lead: "Verifikasi keaslian piutang usaha (invoice) dalam hitungan milidetik sebelum pencairan dana factoring atau pinjaman modal kerja, serta cegah double financing dengan registry on-chain terdesentralisasi.",
    tools: [
      {
        title: "Pencocokan Hash Dokumen",
        desc: "Bandingkan hash PDF/e-faktur invoice dengan attestation resmi pembeli tanpa perlu menelepon bagian purchasing buyer.",
      },
      {
        title: "Registry Status FINANCED",
        desc: "Tandai invoice yang sedang dibiayai untuk mencegah penipuan pengajuan pinjaman ganda (double pledge) di institusi lain.",
      },
      {
        title: "Deteksi Payee Mismatch",
        desc: "Peringatan dini otomatis jika nomor rekening pencairan berbeda dengan rekening resmi yang diakui pembeli.",
      },
    ],
    benefits: [
      {
        title: "Pangkas Waktu SLA Pencairan",
        desc: "Pencairan dana yang biasanya butuh 3-7 hari verifikasi manual kini dapat diputuskan dalam hitungan menit.",
      },
      {
        title: "Zero Fraud Invoice Fiktif",
        desc: "Hanya invoice yang sah ditandatangani oleh key pembeli terverifikasi yang dapat diproses pembiayaannya.",
      },
      {
        title: "Integrasi REST API & Webhook",
        desc: "Koneksikan mesin verifikasi BizProof langsung ke core banking system dan credit assessment engine Anda.",
      },
    ],
  },
  buyer: {
    title: "Enterprise & Korporasi Pembeli",
    lead: "Lindungi nama baik dan reputasi perusahaan dari penerbitan invoice fiktif atas nama entitas Anda. Berdayakan rantai pasok dengan konfirmasi tagihan yang transparan dan cepat.",
    tools: [
      {
        title: "Multi-Tier Approval Policy",
        desc: "Atur kewenangan approver berdasarkan nilai tagihan (misal: PM < Rp 100jt, Finance Director > Rp 500jt).",
      },
      {
        title: "Gasless Confirmation",
        desc: "Konfirmasi tagihan dengan tanda tangan digital tanpa perlu menyimpan mata uang crypto (relayer menanggung gas fee).",
      },
      {
        title: "Audit Log & Hak Revoke",
        desc: "Lacak seluruh jejak aktivitas verifikasi tim dan batalkan attestation jika terjadi retur barang atau sengketa.",
      },
    ],
    benefits: [
      {
        title: "Cegah Fraud Vendor Internal",
        desc: "Menutup celah kolusi vendor dengan tim pengadaan melalui validasi kriptografis yang tidak dapat diubah.",
      },
      {
        title: "Hubungan Supplier Lebih Kuat",
        desc: "Membantu supplier rekanan memperoleh pembiayaan invoice lebih cepat dengan suku bunga yang lebih bersaing.",
      },
      {
        title: "Otomasi Integrasi ERP",
        desc: "Sinkronisasi otomatis dengan SAP, Oracle, atau Odoo via Webhook event status konfirmasi invoice.",
      },
    ],
  },
  supplier: {
    title: "Supplier & Vendor UMKM",
    lead: "Ubah piutang usaha yang belum jatuh tempo menjadi modal kerja cair. Bangun reputasi performa pembayaran yang terverifikasi dan portabel untuk memperoleh pembiayaan berbiaya rendah.",
    tools: [
      {
        title: "Hashing Dokumen di Browser",
        desc: "Hitung SHA-256 + salt langsung di browser Anda. Dokumen rahasia tidak pernah dikirim ke server luar.",
      },
      {
        title: "Supplier Passport Portabel",
        desc: "Halaman portofolio terpusat yang merangkum skor pembayaran tepat waktu dan total volume invoice yang diselesaikan.",
      },
      {
        title: "Tracking Status Real-Time",
        desc: "Pantau saat pembeli menerima tagihan, menyetujui on-chain, atau saat lender membiayai invoice Anda.",
      },
    ],
    benefits: [
      {
        title: "Bebas Biaya Gas (100% Gratis)",
        desc: "UMKM tidak perlu membeli token Arbitrum atau ETH; seluruh biaya submission ditanggung relayer.",
      },
      {
        title: "Bunga Pinjaman Lebih Ringan",
        desc: "Bank memberikan suku bunga lebih rendah karena risiko kredit terkonfirmasi langsung oleh buyer bonafide.",
      },
      {
        title: "Kedaulatan Data Bisnis",
        desc: "Rekam jejak kepatuhan adalah aset Anda yang dapat dibawa ke bank mana pun tanpa keterikatan satu platform.",
      },
    ],
  },
  auditor: {
    title: "Auditor & Regulator",
    lead: "Jejak audit on-chain yang tidak dapat dimanipulasi (immutable audit trail). Validasi kepatuhan transaksi, pajak, dan pengadaan tanpa perlu sampling dokumen manual yang rentan kesalahan.",
    tools: [
      {
        title: "Pemeriksaan Arbiscan Terbuka",
        desc: "Setiap attestation memiliki bukti transaksi publik di Arbitrum Sepolia yang dapat diinspeksi oleh siapa pun.",
      },
      {
        title: "Timestamp Kriptografis EAS",
        desc: "Membuktikan secara pasti kapan invoice diserahkan, kapan disetujui, dan kapan dana dicairkan tanpa manipulasi tanggal.",
      },
      {
        title: "Integritas Hash Tanpa Raw Data",
        desc: "Memastikan dokumen fisik tidak diubah satu karakter pun tanpa perlu mengakses rahasia harga dan rincian item dagang.",
      },
    ],
    benefits: [
      {
        title: "Proses Audit Jauh Lebih Cepat",
        desc: "Verifikasi sampel ribuan transaksi secara instan lewat skrip atau API tanpa memeriksa lembaran fisik kertas.",
      },
      {
        title: "Bukti Hukum Kuat",
        desc: "Attestation ditandatangani dengan private key resmi pembeli yang diakui sebagai tandatangan digital sah.",
      },
      {
        title: "Kepatuhan Regulasi Anti-Fraud",
        desc: "Memenuhi rekomendasi tata kelola pengadaan barang dan jasa anti-suap dan anti-faktur fiktif.",
      },
    ],
  },
};

export default function Home() {
  const { lang } = useApp();
  const t = dict[lang];
  const [activeAudience, setActiveAudience] = useState<AudienceKey>("lender");
  const [copiedHash, setCopiedHash] = useState(false);

  const activeContent = audienceData[activeAudience];

  function copySampleHash() {
    navigator.clipboard.writeText("0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069");
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  }

  return (
    <div className="full-bleed">
      {/* 1. HERO BANNER (LEXIFI STYLE) */}
      <section className="lexi-hero">
        <div className="container">
          <div className="lexi-hero-grid">
            <div>
              <div className="lexi-hero-badge">
                <span className="dot-cyan">●</span> Arbitrum Sepolia · Ethereum Attestation Service (EAS)
              </div>
              <h1>
                {t.hero_title}
                <span className="dot-cyan">.</span>
              </h1>
              <p className="lexi-hero-desc">{t.hero_sub}</p>

              <div className="lexi-hero-actions">
                <a href="#verify-sandbox" className="btn secondary pill">
                  {t.hero_cta_verify}
                </a>
                <Link href="/supplier/invoices/new" className="btn outline-white pill">
                  {t.hero_cta_submit}
                </Link>
                <Link href="/app/overview" className="btn ghost" style={{ color: "#ffffff", fontSize: 13 }}>
                  Portal Pembeli →
                </Link>
              </div>

              <div className="lexi-hero-metrics">
                <div className="lexi-metric-item">
                  <strong>0 Gas Fee</strong>
                  <span>Gasless relayer untuk supplier</span>
                </div>
                <div className="lexi-metric-item">
                  <strong>100% In-Browser</strong>
                  <span>Privasi SHA-256 lokal</span>
                </div>
                <div className="lexi-metric-item">
                  <strong>Instant Arbiscan</strong>
                  <span>Verifikasi terbuka tanpa login</span>
                </div>
              </div>
            </div>

            {/* Interactive Live EAS Showcase Widget */}
            <div>
              <div className="lexi-preview-card">
                <div className="lexi-preview-header">
                  <div className="lexi-preview-live">
                    <span className="lexi-preview-pulse"></span>
                    <span>Live EAS Proof</span>
                  </div>
                  <span className="badge badge-valid">✓ CONFIRMED (VALID)</span>
                </div>

                <div className="lexi-preview-row">
                  <span className="lexi-preview-label">Attestation ID</span>
                  <span className="lexi-preview-value mono">att_01_inv_99812</span>
                </div>
                <div className="lexi-preview-row">
                  <span className="lexi-preview-label">Buyer (Issuer)</span>
                  <span className="lexi-preview-value">PT Telkom Indonesia Tbk</span>
                </div>
                <div className="lexi-preview-row">
                  <span className="lexi-preview-label">Supplier Submitter</span>
                  <span className="lexi-preview-value">CV Karyawaha Mandiri</span>
                </div>
                <div className="lexi-preview-row">
                  <span className="lexi-preview-label">Nomor Invoice</span>
                  <span className="lexi-preview-value mono">INV-2026-0881</span>
                </div>
                <div className="lexi-preview-row">
                  <span className="lexi-preview-label">Rekening Pembayaran</span>
                  <span className="lexi-preview-value" style={{ color: "#34d399" }}>
                    BCA 8820-192-881 (MATCHED)
                  </span>
                </div>

                <div className="lexi-preview-hash-box">
                  <div style={{ overflow: "hidden" }}>
                    <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 11 }}>Dokumen SHA-256 Hash</div>
                    <code className="mono" style={{ color: "var(--cyan)", fontSize: 12 }}>
                      0x7f83b165...126d9069
                    </code>
                  </div>
                  <button type="button" className="lexi-copy-btn" onClick={copySampleHash}>
                    {copiedHash ? "Tersalin ✓" : "Salin Hash"}
                  </button>
                </div>

                <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                  <Link
                    href="/verify/att_01_inv_99812"
                    className="btn primary sm"
                    style={{ flex: 1, textAlign: "center" }}
                  >
                    Buka Detail Verifikasi ↗
                  </Link>
                  <a
                    href={`${ARBISCAN_BASE}/0x1111111111111111111111111111111111111111111111111111111111111111`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn outline-white sm"
                  >
                    Arbiscan ↗
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. LEXIFI 5 PILLARS / SERVICES STRIP */}
      <section className="lexi-services-strip">
        <div className="container">
          <div className="lexi-services-grid">
            <div className="lexi-service-card">
              <span className="lexi-service-icon">🔒</span>
              <h3 className="lexi-service-title">1. Manage</h3>
              <p className="lexi-service-desc">
                Hash dihitung lokal di browser (SHA-256 + salt). Dokumen rahasia Anda tidak pernah keluar ke server publik.
              </p>
            </div>

            <div className="lexi-service-card">
              <span className="lexi-service-icon">✍️</span>
              <h3 className="lexi-service-title">2. Confirm</h3>
              <p className="lexi-service-desc">
                Pembeli meninjau tagihan dan menandatangani status penerimaan secara digital on-chain di Arbitrum.
              </p>
            </div>

            <div className="lexi-service-card">
              <span className="lexi-service-icon">⚡</span>
              <h3 className="lexi-service-title">3. Verify</h3>
              <p className="lexi-service-desc">
                Bank, lender & auditor dapat mengecek keabsahan attestation dan integritas dokumen dalam hitungan detik tanpa login.
              </p>
            </div>

            <div className="lexi-service-card">
              <span className="lexi-service-icon">🛡️</span>
              <h3 className="lexi-service-title">4. Protect</h3>
              <p className="lexi-service-desc">
                Peringatan dini otomatis jika nomor rekening tujuan pembayaran berbeda dengan yang disepakati pembeli (Payee Mismatch).
              </p>
            </div>

            <div className="lexi-service-card">
              <span className="lexi-service-icon">📈</span>
              <h3 className="lexi-service-title">5. Upgrade</h3>
              <p className="lexi-service-desc">
                Supplier Passport membangun rekam jejak performa terverifikasi untuk akses pembiayaan yang lebih cepat dan murah.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. LEXIFI "ONE TECHNOLOGY, TWO PRODUCTS" SECTION */}
      <section className="lexi-two-products">
        <div className="container">
          <div className="lexi-two-grid">
            <div className="lexi-two-headline">
              <h2>
                Satu protokol terpercaya<span className="dot-cyan">,</span>
                <br />
                dua solusi terintegrasi<span className="dot-cyan">.</span>
              </h2>
              <p>
                BizProof menyatukan alur kerja bisnis harian dengan transparansi kriptografi terdesentralisasi.
                Tidak perlu mengubah format invoice Anda — cukup integrasikan bukti konfirmasinya.
              </p>
            </div>

            <div className="lexi-product-cards">
              <div className="lexi-product-card">
                <span className="lexi-product-badge">PORTAL PENGADAAN & VENDOR</span>
                <h3 className="lexi-product-title">
                  BizProof
                  <br />
                  Business Portal
                </h3>
                <hr className="lexi-product-divider" />
                <div className="lexi-product-body">
                  Solusi terpusat untuk Enterprise Buyer & Supplier untuk submit invoice hash, menyetujui tagihan,
                  mengelola approver policy multi-tier, dan melacak seluruh rekam jejak pembayaran bisnis.
                </div>
                <Link href="/app/overview" className="lexi-product-link">
                  Jelajahi Portal Buyer →
                </Link>
              </div>

              <div className="lexi-product-card">
                <span className="lexi-product-badge">MESIN VERIFIKASI & API</span>
                <h3 className="lexi-product-title">
                  BizProof
                  <br />
                  Verifier Engine
                </h3>
                <hr className="lexi-product-divider" />
                <div className="lexi-product-body">
                  Komponen verifikasi instan untuk Perbankan, Fintek Lending, dan Auditor. Dilengkapi registry status
                  FINANCED untuk cegah double financing, batch verification, dan integrasi REST API instan.
                </div>
                <Link href="/verify" className="lexi-product-link">
                  Coba Verifikasi Publik →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. LEXIFI INTERACTIVE AUDIENCE TABS SECTION */}
      <section className="lexi-tabs-section">
        <div className="container">
          <h2 className="lexi-tabs-title">
            Teknologi BizProof dirancang untuk<span className="dot-cyan">:</span>
          </h2>

          <div className="lexi-nav-tabs">
            <button
              type="button"
              className={`lexi-tab-btn ${activeAudience === "lender" ? "active" : ""}`}
              onClick={() => setActiveAudience("lender")}
            >
              🏦 Bank & Lender
            </button>
            <button
              type="button"
              className={`lexi-tab-btn ${activeAudience === "buyer" ? "active" : ""}`}
              onClick={() => setActiveAudience("buyer")}
            >
              🏢 Enterprise Buyer
            </button>
            <button
              type="button"
              className={`lexi-tab-btn ${activeAudience === "supplier" ? "active" : ""}`}
              onClick={() => setActiveAudience("supplier")}
            >
              🏭 Supplier & UMKM
            </button>
            <button
              type="button"
              className={`lexi-tab-btn ${activeAudience === "auditor" ? "active" : ""}`}
              onClick={() => setActiveAudience("auditor")}
            >
              🔍 Auditor & Regulator
            </button>
          </div>

          <div className="lexi-tab-content-grid">
            <p className="lexi-tab-lead">{activeContent.lead}</p>

            <div>
              <div className="lexi-tab-subheading">FITUR & ALAT KERJA (TOOLS)</div>
              <div className="lexi-feature-grid">
                {activeContent.tools.map((item, idx) => (
                  <div key={idx} className="lexi-feature-card">
                    <h4>{item.title}</h4>
                    <p>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="lexi-tab-subheading">MANFAAT STRATEGIS (BENEFITS)</div>
              <div className="lexi-feature-grid">
                {activeContent.benefits.map((item, idx) => (
                  <div key={idx} className="lexi-feature-card" style={{ borderColor: "rgba(59, 114, 217, 0.2)" }}>
                    <h4 style={{ color: "var(--blue)" }}>✓ {item.title}</h4>
                    <p>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. VERIFICATION SANDBOX */}
      <section className="lexi-verify-section" id="verify-sandbox">
        <div className="container">
          <div className="center" style={{ marginBottom: 32 }}>
            <span className="pill" style={{ marginBottom: 12 }}>
              Mesin Verifikasi Bebas Hambatan
            </span>
            <h2 style={{ fontSize: "clamp(26px, 3vw, 36px)", margin: "0 0 10px", fontWeight: 800 }}>
              {t.verify_title}
              <span className="dot-cyan">.</span>
            </h2>
            <p className="muted" style={{ maxWidth: 600, margin: "0 auto" }}>
              {t.verify_sub}
            </p>
          </div>

          <div className="lexi-verify-box-wrapper">
            <VerifyInputBox />
          </div>
        </div>
      </section>

      {/* 6. RECENT ATTESTATIONS GRID */}
      <section className="lexi-recent-section">
        <div className="container">
          <div className="row-between" style={{ marginBottom: 24 }}>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>
                Attestation Terkonfirmasi Terbaru<span className="dot-cyan">.</span>
              </h2>
              <p className="muted small" style={{ margin: "4px 0 0" }}>
                Data mock tersimpan di Arbitrum Sepolia testnet dengan schema standar EAS.
              </p>
            </div>
            <Link href="/verify" className="btn sm">
              Lihat Seluruhnya →
            </Link>
          </div>

          <div className="grid2">
            {mockAttestations.slice(0, 4).map((a) => (
              <AttestationCard key={a.uid} a={a} href={`/verify/${encodeURIComponent(a.uid)}`} />
            ))}
          </div>

          <div className="alert info small" style={{ marginTop: 32 }}>
            <strong>Catatan Transparansi Kriptografi:</strong> {t.honesty}
          </div>
        </div>
      </section>
    </div>
  );
}
