import type { Supplier } from "@/lib/types";

export default function PassportCard({ s }: { s: Supplier }) {
  return (
    <div className="card">
      <div className="row-between">
        <h3 style={{ margin: 0 }}>{s.name}</h3>
        <code className="mono small muted">{s.id}</code>
      </div>
      <div className="grid3">
        <div className="stat">
          <div className="stat-num">{s.confirmedCount}</div>
          <div className="muted small">verified records</div>
        </div>
        <div className="stat">
          <div className="stat-num">{s.counterpartyCount}</div>
          <div className="muted small">counterparties</div>
        </div>
        <div className="stat">
          <div className="stat-num">{s.pendingCount}</div>
          <div className="muted small">pending</div>
        </div>
      </div>
      <div className="muted small">
        Active {s.firstActive} → {s.lastActive} · Revoked: {s.revokedCount}
      </div>
      <div className="alert info small">
        Bukan skor kredit. Ringkasan ini hanya menghitung record yang dikonfirmasi pembeli (verified records).
      </div>
    </div>
  );
}
