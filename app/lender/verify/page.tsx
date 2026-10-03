"use client";
import { useState } from "react";
import Link from "next/link";
import { findAttestation, mockAttestations } from "@/lib/mock";
import { checkInvoiceOnChain, fetchOnChainAttestation } from "@/lib/web3";
import { OnChainStatus } from "@/lib/contracts/bizproof";
import StatusBadge from "@/components/StatusBadge";

type Row = {
  q: string;
  found: boolean;
  status?: string;
  source?: "mock" | "on-chain";
  duplicate?: boolean;
  duplicateOf?: string;
  onChainActive?: boolean;
  error?: string;
};

export default function LenderVerify() {
  const [text, setText] = useState("");
  const [results, setResults] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleCheck() {
    const lines = text.split("\n").map((s) => s.trim()).filter(Boolean);
    setLoading(true);
    const seenInvoiceHash = new Map<string, string>();
    const out: Row[] = [];

    for (const q of lines) {
      // 1. Cek mock dulu (by UID / refNo)
      const mock = findAttestation(q);
      if (mock) {
        const dupOf = seenInvoiceHash.get(mock.invoiceHash);
        if (dupOf && dupOf !== mock.uid) {
          out.push({ q, found: true, status: mock.status, source: "mock", duplicate: true, duplicateOf: dupOf });
        } else {
          seenInvoiceHash.set(mock.invoiceHash, mock.uid);
          out.push({ q, found: true, status: mock.status, source: "mock" });
        }
        continue;
      }
      // 2. Jika input 0x bytes32, coba sebagai UID on-chain lalu sebagai invoiceHash
      if (q.startsWith("0x") && q.length === 66) {
        try {
          const onchain = await fetchOnChainAttestation(q);
          if (onchain) {
            const label =
              onchain.status === OnChainStatus.Confirmed ? "CONFIRMED"
              : onchain.status === OnChainStatus.Financed ? "FINANCED"
              : onchain.status === OnChainStatus.Revoked ? "REVOKED"
              : onchain.status === OnChainStatus.Settled ? "SETTLED" : "CONFIRMED";
            out.push({ q, found: true, status: label, source: "on-chain" });
            continue;
          }
          // Bukan UID → cek sebagai invoiceHash aktif (PRD §7.4)
          const { isActive, activeUid } = await checkInvoiceOnChain(q);
          if (isActive) {
            out.push({ q, found: true, status: "FINANCED", source: "on-chain", duplicate: true, duplicateOf: activeUid, onChainActive: true });
          } else {
            out.push({ q, found: false });
          }
        } catch {
          out.push({ q, found: false, error: "RPC gagal" });
        }
        continue;
      }
      // 3. Deteksi duplikat invoiceHash di dalam batch mock (by refNo duplicate simulation)
      const dupCandidates = mockAttestations.filter((a) => a.invoiceHash === q);
      if (dupCandidates.length > 1) {
        out.push({ q, found: true, status: dupCandidates[0].status, source: "mock", duplicate: true, duplicateOf: dupCandidates[1].uid });
      } else if (dupCandidates.length === 1) {
        out.push({ q, found: true, status: dupCandidates[0].status, source: "mock" });
      } else {
        out.push({ q, found: false });
      }
    }
    setResults(out);
    setLoading(false);
  }

  const dupCount = results.filter((r) => r.duplicate).length;

  return (
    <div>
      <h1>Cek massal</h1>
      <p className="muted small">
        Tempel banyak Attestation UID / invoiceHash (satu per baris). Sistem mendeteksi duplikat
        invoiceHash dalam batch dan mengecek status aktif on-chain untuk cegah double financing (PRD §7.4).
      </p>
      <div className="card">
        <textarea className="input" rows={5} value={text} onChange={(e) => setText(e.target.value)} placeholder={"0x7f3a…\nINV/2026/VII/0142"} />
        <br />
        <button className="btn primary" onClick={handleCheck} disabled={loading}>
          {loading ? "Mengecek on-chain…" : "Cek semua"}
        </button>
        {results.length > 0 && (
          <p className="small" style={{ marginTop: 12 }}>
            {results.length} dicek · {results.filter((r) => r.found).length} ditemukan ·{" "}
            <strong>{dupCount} indikasi duplikat / sudah aktif</strong>
          </p>
        )}
        {results.map((r) => (
          <div key={r.q} className="row-between" style={{ padding: "8px 0", borderTop: "1px solid var(--border)" }}>
            <div>
              <code className="mono small">{r.q}</code>
              {r.source && <span className="muted small"> · via {r.source}</span>}
              {r.duplicate && (
                <div className="alert danger small" style={{ marginTop: 6 }}>
                  Duplikat terdeteksi — invoiceHash sudah terikat ke{" "}
                  <code className="mono">{r.duplicateOf?.slice(0, 18)}…</code>. Jangan biayai dua kali.
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {r.found ? <StatusBadge status={r.status as never} /> : <StatusBadge status="NOT_FOUND" />}
              {r.found && (
                <Link className="link small" href={`/verify/${encodeURIComponent(r.duplicateOf ?? r.q)}`}>
                  Detail
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="card">
        <h3>Aturan double-financing (PRD §7.4)</h3>
        <p className="muted small">
          Satu <code className="mono">invoiceHash</code> hanya boleh punya satu attestation aktif
          (CONFIRMED / FINANCED). Lender wajib menandai <code className="mono">markFinanced(uid)</code> lewat
          kontrak agar lender lain melihat invoice sudah dijaminkan. Lihat tab FINANCED registry.
        </p>
      </div>
    </div>
  );
}
