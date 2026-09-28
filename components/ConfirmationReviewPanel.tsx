"use client";
import { useState } from "react";
import type { Attestation } from "@/lib/types";
import StatusBadge from "./StatusBadge";
import PayeeMismatchAlert from "./PayeeMismatchAlert";

export default function ConfirmationReviewPanel({ a }: { a: Attestation }) {
  const [decision, setDecision] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  return (
    <div className="card">
      <div className="row-between">
        <h3 style={{ margin: 0 }}>Review — {a.refNo}</h3>
        <StatusBadge status={a.status} />
      </div>
      <div className="review-grid">
        <div>
          <h4>Data dari supplier</h4>
          <dl className="dl">
            <dt>Supplier</dt>
            <dd>{a.supplierName}</dd>
            <dt>Ref</dt>
            <dd>
              <code className="mono">{a.refNo}</code>
            </dd>
            <dt>Invoice hash</dt>
            <dd>
              <code className="mono small">{a.invoiceHash}</code>
            </dd>
            <dt>Payee hash</dt>
            <dd>
              <code className="mono small">{a.payeeHash}</code>
            </dd>
          </dl>
        </div>
        <div>
          <h4>Keputusan pembeli</h4>
          <PayeeMismatchAlert show={a.payeeMismatch} />
          <div className="btn-row">
            <button className="btn primary" onClick={() => setDecision("CONFIRMED — attestation akan ditandatangani (gasless via relayer)")}>
              Confirm
            </button>
            <button className="btn danger" onClick={() => setDecision(reason ? `REJECTED — alasan: ${reason}` : "REJECTED — isi alasan dulu")}>
              Reject
            </button>
          </div>
          <input
            className="input"
            placeholder="Alasan reject / catatan (wajib untuk Reject)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          {decision && <div className="alert info small">{decision} (mock frontend — belum kirim ke backend/kontrak)</div>}
          <p className="muted small">
            Nominal di atas ambang tertentu wajib dua approver (approver policy). Semua aksi tercatat di audit log.
          </p>
        </div>
      </div>
    </div>
  );
}
