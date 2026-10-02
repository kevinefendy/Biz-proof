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
  const [fileInfo, setFileInfo] = useState<string | null>(null);

  async function onFile(f: File | undefined) {
    if (!f) return;
    const { fileHash, invoiceHash } = await hashFile(f);
    setFileInfo(
      `SHA-256(file)=${fileHash.slice(0, 24)}… → salted invoiceHash=${invoiceHash.slice(0, 24)}… (dihitung lokal di browser)`
    );
  }

  function handleSelectSample(sampleId: string) {
    setQ(sampleId);
    router.push(`/verify/${encodeURIComponent(sampleId)}`);
  }

  return (
    <div className="card verify-box" style={{ borderRadius: 16 }}>
      <form
        className="verify-row"
        onSubmit={(e) => {
          e.preventDefault();
          if (q.trim()) router.push(`/verify/${encodeURIComponent(q.trim())}`);
        }}
      >
        <input
          className="input"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t.verify_placeholder}
          aria-label="Attestation ID"
          style={{ fontSize: 15 }}
        />
        <button className="btn primary" type="submit" style={{ whiteSpace: "nowrap" }}>
          {t.verify_btn}
        </button>
      </form>

      {!compact && (
        <>
          <div className="lexi-quick-samples">
            <span className="muted" style={{ fontSize: 12 }}>
              Contoh siap tes:
            </span>
            <button
              type="button"
              className="lexi-sample-pill"
              onClick={() => handleSelectSample("att_01_inv_99812")}
              title="Tes Attestation Valid"
            >
              ✓ att_01 (Valid)
            </button>
            <button
              type="button"
              className="lexi-sample-pill"
              onClick={() => handleSelectSample("att_03_inv_44001")}
              title="Tes Payee Mismatch Alert"
            >
              ⚠ att_03 (Mismatch Rekening)
            </button>
            <button
              type="button"
              className="lexi-sample-pill"
              onClick={() => handleSelectSample("att_04_inv_1290")}
              title="Tes Attestation Dibatalkan"
            >
              ✕ att_04 (Revoked)
            </button>
          </div>

          <div className="muted small center" style={{ marginTop: 14 }}>
            {t.verify_or}
          </div>
          <label className="drop">
            <input type="file" hidden onChange={(e) => onFile(e.target.files?.[0])} />
            <span>📄 Upload invoice (PDF/XML) — hash dihitung di browser, file tidak pernah diunggah publik</span>
          </label>
          {fileInfo && <code className="mono small block" style={{ marginTop: 8 }}>{fileInfo}</code>}
        </>
      )}
    </div>
  );
}
