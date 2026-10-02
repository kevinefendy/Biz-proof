"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useApp } from "@/components/AppProvider";
import { dict } from "@/lib/i18n";
import { ARBISCAN_BASE, findAttestation } from "@/lib/mock";
import StatusBadge from "@/components/StatusBadge";
import PayeeMismatchAlert from "@/components/PayeeMismatchAlert";
import RevocationBanner from "@/components/RevocationBanner";
import HashCompareBlock from "@/components/HashCompareBlock";
import VerifyInputBox from "@/components/VerifyInputBox";
import { fetchOnChainAttestation } from "@/lib/web3";
import { ARBITRUM_SEPOLIA_EXPLORER, OnChainStatus } from "@/lib/contracts/bizproof";

export default function VerifyDetail({ params }: { params: Promise<{ attestationId: string }> }) {
  const { attestationId } = use(params);
  const id = decodeURIComponent(attestationId);
  const { lang } = useApp();
  const t = dict[lang];

  const mockData = findAttestation(id);

  const [onChainData, setOnChainData] = useState<any | null>(null);
  const [isQueryingOnChain, setIsQueryingOnChain] = useState(false);
  const [copied, setCopied] = useState(false);

  // Fungsi query langsung ke RPC Arbitrum Sepolia
  async function checkLiveOnChain() {
    setIsQueryingOnChain(true);
    try {
      const res = await fetchOnChainAttestation(id);
      setOnChainData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsQueryingOnChain(false);
    }
  }

  // Auto query jika ID adalah 0x bytes32 hash
  useEffect(() => {
    if (id.startsWith("0x") && id.length === 66) {
      checkLiveOnChain();
    }
  }, [id]);

  function handleCopy() {
    navigator.clipboard?.writeText(typeof window !== "undefined" ? window.location.href : "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Tentukan data tampilan utama (prioritas onchain jika ditemukan, jika tidak pakai mock)
  const a = mockData;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", paddingBottom: 60 }}>
      <div style={{ marginBottom: 20 }}>
        <Link href="/verify" className="link" style={{ fontSize: 14 }}>
          ← {t.verify_title}
        </Link>
      </div>

      <div className="row-between" style={{ marginBottom: 20, alignItems: "flex-end" }}>
        <div>
          <span className="pill" style={{ marginBottom: 8, fontSize: 11 }}>
            Ethereum Attestation Service (EAS) Standard
          </span>
          <h1 style={{ margin: 0, fontSize: "clamp(24px, 3vw, 32px)", fontWeight: 800 }}>
            Hasil Verifikasi Attestation<span className="dot-cyan">.</span>
          </h1>
        </div>

        <button
          className="btn sm ghost"
          onClick={checkLiveOnChain}
          disabled={isQueryingOnChain}
          style={{ whiteSpace: "nowrap" }}
        >
          {isQueryingOnChain ? "Menghubungi RPC…" : "⚡ Query RPC Arbitrum"}
        </button>
      </div>

      <div style={{ marginBottom: 28 }}>
        <VerifyInputBox compact />
      </div>

      {onChainData && (
        <div className="alert success small" style={{ marginBottom: 20, borderRadius: 12 }}>
          <strong>✓ Terverifikasi Langsung di Smart Contract Arbitrum Sepolia!</strong>
          <div style={{ marginTop: 4 }}>
            Status On-Chain: <strong>{OnChainStatus[onChainData.status]}</strong> | Penerbit (Issuer):{" "}
            <code className="mono">{onChainData.issuer}</code>
          </div>
        </div>
      )}

      {!a && !onChainData ? (
        <div className="card" style={{ borderRadius: 16, textAlign: "center", padding: 40 }}>
          <StatusBadge status="NOT_FOUND" />
          <h3 style={{ marginTop: 16, marginBottom: 8 }}>Attestation Tidak Ditemukan</h3>
          <p className="muted" style={{ maxWidth: 500, margin: "0 auto" }}>
            Identifier “{id}” tidak terdaftar di database mock maupun smart contract Arbitrum Sepolia.
            Pastikan UID atau hash dokumen yang Anda masukkan sudah benar.
          </p>
        </div>
      ) : (
        <>
          <div className="card" style={{ borderRadius: 16, padding: 28, marginBottom: 24 }}>
            <div className="row-between" style={{ borderBottom: "1px solid var(--border)", paddingBottom: 16, marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <StatusBadge status={a?.status || "CONFIRMED"} />
                <span className="muted small">Schema: <strong>{a?.schemaId || "INVOICE_CONFIRMED"}</strong></span>
              </div>
              <code className="mono small" style={{ background: "var(--bg-tag)", padding: "4px 8px", borderRadius: 6 }}>
                {a?.refNo || "INV-ONCHAIN"}
              </code>
            </div>

            <h2 style={{ margin: "0 0 16px", fontSize: 22, fontWeight: 700 }}>
              {a?.supplierName || "Supplier Terverifikasi"}
            </h2>

            <dl className="dl" style={{ marginBottom: 20 }}>
              <dt>Attestation UID</dt>
              <dd>
                <code className="mono small" style={{ wordBreak: "break-all" }}>
                  {a?.uid || id}
                </code>
              </dd>

              <dt>Penerbit (Buyer)</dt>
              <dd>
                <strong>{a?.issuer || "Buyer Enterprise"}</strong>{" "}
                <span className="muted small">(<code className="mono">{a?.issuerWallet || onChainData?.issuer}</code>)</span>
              </dd>

              <dt>Subjek (Supplier)</dt>
              <dd>
                {a?.supplierName || "Supplier"}{" "}
                <span className="muted small">(<code className="mono">{a?.subjectId || onChainData?.subjectId}</code>)</span>
              </dd>

              <dt>Invoice Hash (SHA-256)</dt>
              <dd>
                <code className="mono small" style={{ wordBreak: "break-all" }}>
                  {a?.invoiceHash || onChainData?.invoiceHash}
                </code>
              </dd>

              <dt>Payee Account Hash</dt>
              <dd>
                <code className="mono small" style={{ wordBreak: "break-all" }}>
                  {a?.payeeHash || onChainData?.payeeHash}
                </code>
              </dd>

              <dt>Waktu Terbit</dt>
              <dd>{a?.issuedAt || (onChainData?.issuedAt ? new Date(onChainData.issuedAt * 1000).toLocaleString() : "—")}</dd>

              <dt>Masa Berlaku</dt>
              <dd>{a?.expiresAt ?? "— (Permanen / Tidak Kedaluwarsa)"}</dd>

              <dt>Transaksi Blockchain</dt>
              <dd>
                <code className="mono small" style={{ wordBreak: "break-all" }}>
                  {a?.txHash || "0x..."}
                </code>
              </dd>
            </dl>

            {a?.payeeMismatch && <PayeeMismatchAlert show={true} />}
            {a?.revokeReason && <RevocationBanner reason={a.revokeReason} />}

            <div className="btn-row" style={{ marginTop: 24 }}>
              <a
                className="btn primary sm"
                href={`${ARBITRUM_SEPOLIA_EXPLORER}/tx/${a?.txHash || id}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  background: "linear-gradient(135deg, #1b3574 0%, #2854b7 100%)",
                  border: "1px solid rgba(110, 168, 254, 0.4)",
                  color: "#fff",
                }}
              >
                Lihat di Arbiscan Sepolia ↗
              </a>
              <button className="btn sm ghost" onClick={handleCopy}>
                {copied ? "✓ Tersalin!" : "Bagikan Tautan Verifikasi"}
              </button>
            </div>
          </div>

          <div style={{ marginTop: 28 }}>
            <h3 style={{ fontSize: 18, marginBottom: 12, fontWeight: 700 }}>
              Audit Integritas File Mandiri
            </h3>
            <p className="muted small" style={{ marginBottom: 16 }}>
              Unggah file dokumen invoice Anda (PDF / XML) di bawah ini untuk mencocokkan hash lokal dengan hash yang
              tercatat di blockchain. File tidak dikirim ke internet.
            </p>
            <HashCompareBlock expectedHash={a?.invoiceHash || onChainData?.invoiceHash || ""} />
          </div>
        </>
      )}
    </div>
  );
}
