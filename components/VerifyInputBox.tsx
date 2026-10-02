"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "./AppProvider";
import { dict } from "@/lib/i18n";
import { hashFile } from "@/lib/hash";

export default function VerifyInputBox({ compact = false }: { compact?: boolean }) {
  const { lang } = useApp();
  const t = dict[lang];
  const router = useRouter();
  const [q, setQ] = useState("");
  const [activeTab, setActiveTab] = useState<"id" | "file">("id");
  const [fileInfo, setFileInfo] = useState<string | null>(null);
  const [isHashing, setIsHashing] = useState(false);

  async function onFile(f: File | undefined) {
    if (!f) return;
    setIsHashing(true);
    try {
      const { fileHash, invoiceHash } = await hashFile(f);
      setFileInfo(`SHA-256: ${fileHash.slice(0, 16)}… | Salted InvoiceHash: ${invoiceHash.slice(0, 20)}…`);
    } finally {
      setIsHashing(false);
    }
  }

  function handleSelectSample(sampleId: string) {
    setQ(sampleId);
    router.push(`/verify/${encodeURIComponent(sampleId)}`);
  }

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 16,
        padding: compact ? "16px" : "24px",
        boxShadow: "0 8px 30px rgba(0,0,0,0.06)",
      }}
    >
      {!compact && (
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          <button
            type="button"
            className="bn-tab-button"
            style={{
              background: activeTab === "id" ? "rgba(37, 99, 235, 0.12)" : "transparent",
              color: activeTab === "id" ? "var(--blue)" : "var(--muted)",
              border: activeTab === "id" ? "1px solid rgba(59, 130, 246, 0.3)" : "1px solid transparent",
            }}
            onClick={() => setActiveTab("id")}
          >
            🔍 Cari via UID / Nomor Invoice
          </button>
          <button
            type="button"
            className="bn-tab-button"
            style={{
              background: activeTab === "file" ? "rgba(37, 99, 235, 0.12)" : "transparent",
              color: activeTab === "file" ? "var(--blue)" : "var(--muted)",
              border: activeTab === "file" ? "1px solid rgba(59, 130, 246, 0.3)" : "1px solid transparent",
            }}
            onClick={() => setActiveTab("file")}
          >
            📄 Unggah File (Browser SHA-256)
          </button>
        </div>
      )}

      {activeTab === "id" || compact ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (q.trim()) router.push(`/verify/${encodeURIComponent(q.trim())}`);
          }}
          style={{
            display: "flex",
            alignItems: "center",
            background: "var(--surface-sub)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: "6px 8px 6px 16px",
            transition: "all 0.2s ease",
          }}
        >
          <span style={{ color: "var(--muted)", marginRight: 10, fontSize: 16 }}>🔍</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={compact ? "Masukkan UID / Hash…" : "Masukkan Attestation UID, nomor tagihan, atau invoiceHash (0x…)"}
            aria-label="Attestation ID"
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "var(--text)",
              fontSize: 14,
              fontFamily: "inherit",
            }}
          />
          {q && (
            <button
              type="button"
              onClick={() => setQ("")}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--muted)",
                cursor: "pointer",
                padding: "4px 8px",
                fontSize: 14,
              }}
            >
              ✕
            </button>
          )}
          <button
            type="submit"
            className="bn-btn-primary"
            style={{
              padding: "10px 20px",
              fontSize: 14,
              borderRadius: 8,
              whiteSpace: "nowrap",
            }}
          >
            {t.verify_btn}
          </button>
        </form>
      ) : (
        <div>
          <label
            className="drop"
            style={{
              border: "2px dashed var(--border)",
              borderRadius: 12,
              padding: "28px 20px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              cursor: "pointer",
              background: "var(--surface-sub)",
            }}
          >
            <input type="file" hidden onChange={(e) => onFile(e.target.files?.[0])} />
            <span style={{ fontSize: 28 }}>📑</span>
            <strong style={{ color: "var(--text)" }}>
              {isHashing ? "Menghitung Hash Kriptografis…" : "Pilih File Invoice (PDF / XML)"}
            </strong>
            <span className="muted small" style={{ textAlign: "center", maxWidth: 460 }}>
              Hash SHA-256 + salt dihitung secara aman di peramban Anda. Dokumen mentah tidak pernah diunggah ke internet.
            </span>
          </label>
        </div>
      )}

      {fileInfo && (
        <div className="alert info small" style={{ marginTop: 12, borderRadius: 8 }}>
          <strong>Hasil Hash Lokal:</strong> <code className="mono">{fileInfo}</code>
        </div>
      )}

      {!compact && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
          <span style={{ color: "var(--muted)", fontSize: 12, fontWeight: 600 }}>Contoh Siap Tes:</span>
          <button
            type="button"
            className="bn-badge bn-badge-valid"
            onClick={() => handleSelectSample("att_01_inv_99812")}
            style={{ cursor: "pointer" }}
            title="Tes Attestation Sah"
          >
            ✓ att_01 (Valid)
          </button>
          <button
            type="button"
            className="bn-badge bn-badge-mismatch"
            onClick={() => handleSelectSample("att_03_inv_44001")}
            style={{ cursor: "pointer" }}
            title="Tes Anomali Rekening Pembayaran"
          >
            ⚠ att_03 (Payee Mismatch)
          </button>
          <button
            type="button"
            className="bn-badge bn-badge-revoked"
            onClick={() => handleSelectSample("att_04_inv_1290")}
            style={{ cursor: "pointer" }}
            title="Tes Attestation Dibatalkan"
          >
            ✕ att_04 (Revoked)
          </button>
        </div>
      )}
    </div>
  );
}
