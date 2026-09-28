"use client";
import { useState } from "react";
import { sha256Hex } from "@/lib/hash";

export default function HashCompareBlock({ expectedHash }: { expectedHash: string }) {
  const [text, setText] = useState("");
  const [result, setResult] = useState<string | null>(null);

  return (
    <div className="card">
      <h3>HashCompareBlock</h3>
      <p className="muted small">
        Tempel ulang canonical payload / hash dokumen untuk membandingkan dengan <code className="mono">{expectedHash.slice(0, 20)}…</code> (dihitung lokal).
      </p>
      <div className="verify-row">
        <input className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste document hash / canonical JSON…" />
        <button
          className="btn"
          onClick={async () => {
            if (!text) return;
            const h = await sha256Hex(text.trim());
            setResult(h === expectedHash.toLowerCase() ? "MATCH ✓" : `MISMATCH — got ${h.slice(0, 24)}…`);
          }}
        >
          Compare
        </button>
      </div>
      {result && <code className="mono small block">{result}</code>}
    </div>
  );
}
