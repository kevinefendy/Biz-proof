"use client";
import Link from "next/link";
import { useApp } from "./AppProvider";
import { dict } from "@/lib/i18n";
import { ARBISCAN_BASE } from "@/lib/mock";

export default function Footer() {
  const { lang } = useApp();
  const t = dict[lang];

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <h4>
              ◈ BizProof<span className="dot-cyan">.</span>
            </h4>
            <p className="footer-desc">
              Protokol rekam jejak bisnis terkonfirmasi pembeli berbasis Ethereum Attestation Service (EAS) di Arbitrum.
              Privasi terjamin dengan hashing dokumen lokal di browser.
            </p>
            <div style={{ marginTop: 14 }}>
              <span className="pill pill-glow" style={{ fontSize: 11 }}>
                ● Arbitrum Sepolia Testnet Live
              </span>
            </div>
          </div>

          <div className="footer-col">
            <h5>Solusi</h5>
            <ul className="footer-links">
              <li>
                <Link href="/app/overview">Portal Buyer (Enterprise)</Link>
              </li>
              <li>
                <Link href="/supplier/invoices">Portal Supplier (UMKM)</Link>
              </li>
              <li>
                <Link href="/lender/verify">Portal Lender & Bank</Link>
              </li>
              <li>
                <Link href="/verify">Verifikasi Publik Gratis</Link>
              </li>
              <li>
                <Link href="/passport/sup_karyawaha_001">Supplier Passport</Link>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h5>Teknologi & Docs</h5>
            <ul className="footer-links">
              <li>
                <Link href="/docs">Arsitektur & Spesifikasi</Link>
              </li>
              <li>
                <Link href="/pricing">Paket & Harga</Link>
              </li>
              <li>
                <a href={ARBISCAN_BASE} target="_blank" rel="noreferrer">
                  Arbiscan Sepolia ↗
                </a>
              </li>
              <li>
                <a href="https://attest.org" target="_blank" rel="noreferrer">
                  Ethereum Attestation Service ↗
                </a>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h5>Keamanan & Legal</h5>
            <ul className="footer-links">
              <li>
                <span style={{ color: "rgba(255,255,255,0.7)" }}>SHA-256 Client-side Hash</span>
              </li>
              <li>
                <span style={{ color: "rgba(255,255,255,0.7)" }}>Zero Raw File Upload</span>
              </li>
              <li>
                <span style={{ color: "rgba(255,255,255,0.7)" }}>Payee Anomaly Detector</span>
              </li>
              <li>
                <Link href="/docs">Batasan Kriptografis</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div>
            © {new Date().getFullYear()} BizProof Protocol. Seluruh hak cipta dilindungi.
          </div>
          <div>{t.footer_note}</div>
        </div>
      </div>
    </footer>
  );
}
