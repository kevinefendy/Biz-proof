"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { mockAttestations } from "@/lib/mock";
import { listInvoices, type BackendInvoice } from "@/lib/api";

export default function BuyerOverview() {
  const [invoices, setInvoices] = useState<BackendInvoice[] | null>(null);

  useEffect(() => {
    listInvoices().then(setInvoices).catch(() => setInvoices(null));
  }, []);

  if (invoices) {
    const pending = invoices.filter((i) => i.status === "PENDING_CONFIRMATION");
    const confirmed = invoices.filter((i) => i.status === "CONFIRMED").length;
    const rejected = invoices.filter((i) => i.status === "REJECTED").length;
    return (
      <div>
        <h1>Overview</h1>
        <p className="muted small">Sumber: backend ({invoices.length} invoice)</p>
        <div className="kpi-row">
          <div className="card"><div className="stat-num">{pending.length}</div><div className="muted small">pending confirmation</div></div>
          <div className="card"><div className="stat-num">{confirmed}</div><div className="muted small">confirmed</div></div>
          <div className="card"><div className="stat-num">{rejected}</div><div className="muted small">rejected</div></div>
        </div>
        <div className="card">
          <h3>Antrean terbaru</h3>
          {pending.map((inv) => (
            <div key={inv.id} className="row-between">
              <span>{inv.ref_no} — {inv.supplier_org_id}</span>
              <Link className="btn sm" href={`/app/confirmations/${encodeURIComponent(inv.id)}`}>Review</Link>
            </div>
          ))}
          {pending.length === 0 && <p className="muted small">Tidak ada antrean.</p>}
        </div>
      </div>
    );
  }

  const pending = mockAttestations.filter((a) => a.status === "PENDING_CONFIRMATION").length;
  const confirmed = mockAttestations.filter((a) => a.status === "CONFIRMED").length;
  const revoked = mockAttestations.filter((a) => a.status === "REVOKED").length;
  return (
    <div>
      <h1>Overview</h1>
      <p className="muted small">Sumber: mock (backend tidak terjangkau)</p>
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
