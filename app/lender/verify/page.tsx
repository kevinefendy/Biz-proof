"use client";
import { useState } from "react";
import { findAttestation } from "@/lib/mock";
import StatusBadge from "@/components/StatusBadge";

export default function LenderVerify() {
  const [text, setText] = useState("");
  const [results, setResults] = useState<{ q: string; found: boolean; status?: string }[]>([]);

  return (
    <div>
      <h1>Cek massal</h1>
      <p className="muted small">Tempel banyak Attestation ID / invoiceHash (satu per baris). Deteksi duplikat invoiceHash untuk cegah double financing (PRD §7.4).</p>
      <div className="card">
        <textarea className="input" rows={5} value={text} onChange={(e) => setText(e.target.value)} placeholder={"0x7f3a…\nINV/2026/VII/0142"} />
        <br />
        <button
          className="btn primary"
          onClick={() => {
            const lines = text.split("\n").map((s) => s.trim()).filter(Boolean);
            setResults(
              lines.map((q) => {
                const a = findAttestation(q);
                return a ? { q, found: true, status: a.status } : { q, found: false };
              })
            );
          }}
        >
          Cek semua
        </button>
        {results.map((r) => (
          <div key={r.q} className="row-between" style={{ padding: "6px 0" }}>
            <code className="mono small">{r.q}</code>
            {r.found ? <StatusBadge status={r.status as never} /> : <StatusBadge status="NOT_FOUND" />}
          </div>
        ))}
      </div>
    </div>
  );
}
