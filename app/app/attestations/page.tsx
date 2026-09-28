"use client";
import { useState } from "react";
import AttestationCard from "@/components/AttestationCard";
import { mockAttestations } from "@/lib/mock";

export default function Attestations() {
  const [filter, setFilter] = useState("ALL");
  const list = mockAttestations.filter((a) => filter === "ALL" || a.status === filter);
  return (
    <div>
      <h1>Semua attestation + Revoke</h1>
      <div className="btn-row">
        {["ALL", "CONFIRMED", "PENDING_CONFIRMATION", "FINANCED", "REVOKED", "EXPIRED"].map((f) => (
          <button key={f} className={`btn sm ${filter === f ? "primary" : ""}`} onClick={() => setFilter(f)}>
            {f}
          </button>
        ))}
      </div>
      <div className="grid2">
        {list.map((a) => (
          <AttestationCard key={a.uid} a={a} href={`/verify/${encodeURIComponent(a.uid)}`} />
        ))}
      </div>
      <div className="card">
        <h3>Revoke (mock)</h3>
        <p className="muted small">Attestation tidak pernah dihapus — status berubah CONFIRMED → REVOKED + alasan. Di MVP backend, panggil POST /v1/attestations/:id/revoke.</p>
      </div>
    </div>
  );
}
