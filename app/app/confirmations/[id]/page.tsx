"use client";
import { use, useEffect, useState } from "react";
import { findAttestation } from "@/lib/mock";
import ConfirmationReviewPanel from "@/components/ConfirmationReviewPanel";
import { getBackendInvoice, type BackendInvoice } from "@/lib/api";

export default function ConfirmationDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const key = decodeURIComponent(id);
  const [backendInv, setBackendInv] = useState<BackendInvoice | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    getBackendInvoice(key)
      .then((inv) => setBackendInv(inv))
      .catch(() => setBackendInv(null))
      .finally(() => setChecked(true));
  }, [key]);

  // Backend punya invoice ini → review + confirm via backend (relayer / client-sign)
  if (backendInv) {
    return (
      <div>
        <h1>Review + Confirm / Reject</h1>
        <p className="muted small">Sumber: backend ({backendInv.id})</p>
        <ConfirmationReviewPanel
          backendId={backendInv.id}
          a={{
            uid: backendInv.id,
            issuer: backendInv.buyer_org_id,
            issuerWallet: "",
            subjectId: backendInv.supplier_org_id,
            supplierName: backendInv.supplier_org_id,
            schemaId: "INVOICE_CONFIRMED",
            invoiceHash: backendInv.invoice_hash,
            payeeHash: backendInv.payee_hash,
            refNo: backendInv.ref_no,
            issuedAt: backendInv.submitted_at,
            expiresAt: null,
            status: "PENDING_CONFIRMATION",
            txHash: "",
          }}
        />
      </div>
    );
  }

  if (!checked) return <p className="muted">Memuat…</p>;

  const a = findAttestation(key);
  if (!a) return <p className="muted">Not found.</p>;
  return (
    <div>
      <h1>Review + Confirm / Reject</h1>
      <p className="muted small">Sumber: mock (backend tidak punya invoice ini)</p>
      <ConfirmationReviewPanel a={a} />
    </div>
  );
}
