"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import AttestationCard from "@/components/AttestationCard";
import { mockAttestations } from "@/lib/mock";
import { listPendingInvoices, type BackendInvoice } from "@/lib/api";

export default function Confirmations() {
  const [pending, setPending] = useState<BackendInvoice[] | null>(null);
  const [backendUp, setBackendUp] = useState(true);

  useEffect(() => {
    listPendingInvoices()
      .then((rows) => {
        setPending(rows);
        setBackendUp(true);
      })
      .catch(() => setBackendUp(false));
  }, []);

  const mockList = mockAttestations.filter((a) => a.status === "PENDING_CONFIRMATION");

  return (
    <div>
      <h1>Antrean konfirmasi (PENDING)</h1>
      <p className="muted small">
        Sumber: {pending ? `backend (${pending.length} antrean)` : backendUp ? "memuat…" : "mock (backend tidak terjangkau — jalankan npm run dev di backend/)"}
      </p>
      {pending && pending.length > 0 && (
        <div className="card" style={{ marginBottom: 16 }}>
          {pending.map((inv) => (
            <div key={inv.id} className="row-between" style={{ padding: "8px 0", borderTop: "1px solid var(--border)" }}>
              <div>
                <strong>{inv.ref_no}</strong>
                <div className="muted small">
                  supplier <code className="mono">{inv.supplier_org_id}</code> · hash{" "}
                  <code className="mono">{inv.invoice_hash.slice(0, 18)}…</code>
                </div>
              </div>
              <Link className="btn sm primary" href={`/app/confirmations/${encodeURIComponent(inv.id)}`}>
                Review
              </Link>
            </div>
          ))}
        </div>
      )}
      {pending && pending.length === 0 && <p className="muted">Tidak ada antrean di backend.</p>}
      {!pending && !backendUp && (
        <>
          <div className="grid2">
            {mockList.map((a) => (
              <AttestationCard key={a.uid} a={a} href={`/app/confirmations/${encodeURIComponent(a.uid)}`} />
            ))}
          </div>
          {mockList.length === 0 && <p className="muted">Tidak ada antrean.</p>}
        </>
      )}
      <p className="muted small">
        Lihat semua: <Link className="link" href="/app/attestations">Attestations</Link>
      </p>
    </div>
  );
}
