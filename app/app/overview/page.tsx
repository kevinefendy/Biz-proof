import Link from "next/link";
import { mockAttestations } from "@/lib/mock";

export default function BuyerOverview() {
  const pending = mockAttestations.filter((a) => a.status === "PENDING_CONFIRMATION").length;
  const confirmed = mockAttestations.filter((a) => a.status === "CONFIRMED").length;
  const revoked = mockAttestations.filter((a) => a.status === "REVOKED").length;
  return (
    <div>
      <h1>Overview</h1>
      <div className="kpi-row">
        <div className="card"><div className="stat-num">{pending}</div><div className="muted small">pending confirmation</div></div>
        <div className="card"><div className="stat-num">{confirmed}</div><div className="muted small">confirmed bulan ini</div></div>
        <div className="card"><div className="stat-num">{revoked}</div><div className="muted small">direvoke</div></div>
      </div>
      <div className="card">
        <h3>Antrean terbaru</h3>
        {mockAttestations.filter((a) => a.status === "PENDING_CONFIRMATION").map((a) => (
          <div key={a.uid} className="row-between">
            <span>{a.refNo} — {a.supplierName}</span>
            <Link className="btn sm" href={`/app/confirmations/${encodeURIComponent(a.uid)}`}>Review</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
