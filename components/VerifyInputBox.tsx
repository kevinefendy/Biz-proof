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
        borderRadius: "var(--radius)",
        padding: compact ? "14px" : "20px",
      }}
    >
      {!compact && (
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          <button
            type="button"
            className="bn-tab-button"
            style={{
              background: activeTab === "id" ? "var(--primary-subtle)" : "transparent",
              color: activeTab === "id" ? "var(--primary)" : "var(--muted)",
              border: activeTab === "id" ? "1px solid var(--primary-border)" : "1px solid transparent",
            }}
            onClick={() => setActiveTab("id")}
          >
            {t.v_tab_id}
          </button>
          <button
            type="button"
            className="bn-tab-button"
            style={{
              background: activeTab === "file" ? "var(--primary-subtle)" : "transparent",
              color: activeTab === "file" ? "var(--primary)" : "var(--muted)",
              border: activeTab === "file" ? "1px solid var(--primary-border)" : "1px solid transparent",
            }}
            onClick={() => setActiveTab("file")}
          >
            {t.v_tab_file}
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
            borderRadius: "var(--radius-sm)",
            padding: "4px 6px 4px 14px",
          }}
        >
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={compact ? t.v_ph_short : t.v_ph}
            aria-label="Attestation ID"
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "var(--text)",
              fontSize: 13,
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
                fontSize: 12,
              }}
            >
              ✕
            </button>
          )}
          <button
            type="submit"
            className="bn-btn-primary"
            style={{
              padding: "8px 18px",
              fontSize: 13,
              borderRadius: "var(--radius-sm)",
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
              border: "1px dashed var(--border)",
              borderRadius: "var(--radius-sm)",
              padding: "24px 16px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              cursor: "pointer",
              background: "var(--surface-sub)",
            }}
          >
            <input type="file" hidden onChange={(e) => onFile(e.target.files?.[0])} />
            <strong style={{ color: "var(--text)", fontSize: 14 }}>
              {isHashing ? t.v_hashing : t.v_drop_t}
            </strong>
            <span className="muted small" style={{ textAlign: "center", maxWidth: 440 }}>
              {t.v_drop_d}
            </span>
          </label>
        </div>
      )}

      {fileInfo && (
        <div className="alert info small" style={{ marginTop: 10, borderRadius: "var(--radius-sm)" }}>
          <strong>{t.v_hash_result}</strong> <code className="mono">{fileInfo}</code>
        </div>
      )}

      {!compact && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
          <span style={{ color: "var(--muted)", fontSize: 11, fontWeight: 600 }}>{t.v_samples}</span>
          <button
            type="button"
            className="bn-badge bn-badge-valid"
            onClick={() => handleSelectSample("att_01_inv_99812")}
            style={{ cursor: "pointer" }}
            title="Tes Attestation Sah"
          >
            att_01 (Valid)
          </button>
          <button
            type="button"
            className="bn-badge bn-badge-mismatch"
            onClick={() => handleSelectSample("att_03_inv_44001")}
            style={{ cursor: "pointer" }}
            title="Tes Anomali Rekening Pembayaran"
          >
            att_03 (Payee Mismatch)
          </button>
          <button
            type="button"
            className="bn-badge bn-badge-revoked"
            onClick={() => handleSelectSample("att_04_inv_1290")}
            style={{ cursor: "pointer" }}
            title="Tes Attestation Dibatalkan"
          >
            att_04 (Revoked)
          </button>
        </div>
      )}
    </div>
  );
}
