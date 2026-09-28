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
    setFileInfo(`SHA-256(file)=${fileHash.slice(0, 24)}… → salted invoiceHash=${invoiceHash.slice(0, 24)}… (dihitung lokal di browser)`);
  }

  return (
    <div className="card verify-box">
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
        />
        <button className="btn primary" type="submit">
          {t.verify_btn}
        </button>
      </form>
      {!compact && (
        <>
          <div className="muted small center">{t.verify_or}</div>
          <label className="drop">
            <input
              type="file"
              hidden
              onChange={(e) => onFile(e.target.files?.[0])}
            />
            <span>📄 Upload invoice (PDF/XML) — hash dihitung di browser, file tidak diunggah</span>
          </label>
          {fileInfo && <code className="mono small block">{fileInfo}</code>}
        </>
      )}
    </div>
  );
}
