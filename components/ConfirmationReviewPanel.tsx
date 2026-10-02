"use client";

import { useState } from "react";
import type { Attestation } from "@/lib/types";
import StatusBadge from "./StatusBadge";
import PayeeMismatchAlert from "./PayeeMismatchAlert";
import { useWeb3 } from "./Web3Provider";
import { attestOnChain } from "@/lib/web3";
import { ARBITRUM_SEPOLIA_EXPLORER } from "@/lib/contracts/bizproof";

export default function ConfirmationReviewPanel({ a }: { a: Attestation }) {
  const { account, isCorrectNetwork, connectWallet, switchToArbitrum } = useWeb3();
  const [decision, setDecision] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [isOnChainLoading, setIsOnChainLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [onChainUid, setOnChainUid] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleOnChainAttest() {
    setErrorMessage(null);
    setTxHash(null);

    if (!account) {
      await connectWallet();
      return;
    }

    if (!isCorrectNetwork) {
      await switchToArbitrum();
      return;
    }

    try {
      setIsOnChainLoading(true);
      const res = await attestOnChain({
        subjectId: a.subjectId,
        invoiceHash: a.invoiceHash,
        payeeHash: a.payeeHash,
      });

      setTxHash(res.txHash);
      setOnChainUid(res.uid);
      setDecision("CONFIRMED ON-CHAIN — Transaksi sukses dicatat di Arbitrum Sepolia!");
    } catch (err: any) {
      console.error(err);
      setErrorMessage(
        err?.reason ||
        err?.data?.message ||
        err?.message ||
        "Gagal mengeksekusi attestation on-chain. Cek console untuk rincian."
      );
    } finally {
      setIsOnChainLoading(false);
    }
  }

  return (
    <div className="card" style={{ borderRadius: 16 }}>
      <div className="row-between" style={{ marginBottom: 16 }}>
        <div>
          <span className="pill" style={{ marginBottom: 6, fontSize: 11 }}>
            Konfirmasi Invoice Pembeli
          </span>
          <h3 style={{ margin: "4px 0 0", fontSize: 20 }}>Review — {a.refNo}</h3>
        </div>
        <StatusBadge status={a.status} />
      </div>

      <div className="review-grid">
        <div>
          <h4 style={{ margin: "0 0 12px", color: "var(--text-muted)", fontSize: 13, textTransform: "uppercase" }}>
            Data Dokumen Supplier
          </h4>
          <dl className="dl">
            <dt>Supplier</dt>
            <dd><strong>{a.supplierName}</strong></dd>

            <dt>Nomor Invoice</dt>
            <dd><code className="mono">{a.refNo}</code></dd>

            <dt>Invoice Hash (SHA-256)</dt>
            <dd><code className="mono small">{a.invoiceHash}</code></dd>

            <dt>Payee Account Hash</dt>
            <dd><code className="mono small">{a.payeeHash}</code></dd>
          </dl>
        </div>

        <div>
          <h4 style={{ margin: "0 0 12px", color: "var(--text-muted)", fontSize: 13, textTransform: "uppercase" }}>
            Aksi Pembeli (Enterprise Approver)
          </h4>
          <PayeeMismatchAlert show={a.payeeMismatch} />

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
            {/* Tombol Eksekusi On-Chain Arbitrum Sepolia */}
            <button
              className="btn primary"
              style={{
                background: "linear-gradient(135deg, #1b3574 0%, #2854b7 100%)",
                border: "1px solid rgba(110, 168, 254, 0.4)",
                padding: "10px 16px",
                fontWeight: 700,
              }}
              onClick={handleOnChainAttest}
              disabled={isOnChainLoading}
            >
              {isOnChainLoading ? (
                "⏳ Memproses di Arbitrum Sepolia…"
              ) : !account ? (
                "🦊 Hubungkan MetaMask & Confirm On-Chain"
              ) : !isCorrectNetwork ? (
                "⚠ Switch ke Arbitrum Sepolia untuk Confirm"
              ) : (
                "✓ Confirm On-Chain di Arbitrum Sepolia (MetaMask)"
              )}
            </button>

            {/* Alternatif Mock Gasless */}
            <div className="btn-row">
              <button
                className="btn ghost sm"
                onClick={() =>
                  setDecision("CONFIRMED (Simulasi Gasless Relayer) — attestation ditandatangani otomatis")
                }
              >
                Simulasi Gasless
              </button>
              <button
                className="btn danger sm"
                onClick={() =>
                  setDecision(reason ? `REJECTED — Alasan: ${reason}` : "REJECTED — Harap isi alasan penolakan")
                }
              >
                Reject Invoice
              </button>
            </div>
          </div>

          <input
            className="input"
            placeholder="Alasan penolakan / catatan revisi (wajib jika Reject)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            style={{ marginBottom: 12 }}
          />

          {errorMessage && (
            <div className="alert danger small" style={{ marginBottom: 12 }}>
              <strong>Error On-Chain:</strong> {errorMessage}
            </div>
          )}

          {txHash && (
            <div className="alert success small" style={{ marginBottom: 12 }}>
              <strong>✓ Terkonfirmasi di Blockchain!</strong>
              <div style={{ marginTop: 4 }}>
                TX Hash:{" "}
                <a
                  href={`${ARBITRUM_SEPOLIA_EXPLORER}/tx/${txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ textDecoration: "underline", wordBreak: "break-all" }}
                >
                  {txHash} ↗
                </a>
              </div>
              {onChainUid && (
                <div style={{ marginTop: 4 }}>
                  UID: <code className="mono">{onChainUid}</code>
                </div>
              )}
            </div>
          )}

          {decision && !txHash && (
            <div className="alert info small" style={{ marginBottom: 12 }}>
              {decision}
            </div>
          )}

          <p className="muted small" style={{ margin: 0 }}>
            Nominal di atas ambang tertentu wajib dua approver (approver policy). Setiap transaksi attestation
            tersinkronisasi ke Arbitrum Sepolia dan terlindungi dari sengketa.
          </p>
        </div>
      </div>
    </div>
  );
}
