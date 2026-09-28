"use client";
import Link from "next/link";
import type { Attestation } from "@/lib/types";
import StatusBadge from "./StatusBadge";
import { ARBISCAN_BASE } from "@/lib/mock";

export function short(uid: string) {
  return `${uid.slice(0, 10)}…${uid.slice(-6)}`;
}

export default function AttestationCard({ a, href }: { a: Attestation; href?: string }) {
  const body = (
    <>
      <div className="row-between">
        <StatusBadge status={a.status} />
        <code className="mono muted">{a.refNo}</code>
      </div>
      <div className="att-title">{a.supplierName}</div>
      <div className="muted small">
        Confirmed by <strong>{a.issuer}</strong> · {a.schemaId} · {new Date(a.issuedAt).toLocaleDateString()}
      </div>
      <code className="mono small block">UID {short(a.uid)}</code>
      {a.payeeMismatch && (
        <div className="alert warn small">⚠ Payee account mismatch — rekening tujuan tidak cocok.</div>
      )}
      {a.status === "REVOKED" && a.revokeReason && (
        <div className="alert danger small">Revoked: {a.revokeReason}</div>
      )}
      <div className="row-between small">
        <span className="muted">Invoice hash <code className="mono">{a.invoiceHash.slice(0, 12)}…</code></span>
        <a
          className="link"
          href={`${ARBISCAN_BASE}/${a.txHash}`}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
        >
          Arbiscan ↗
        </a>
      </div>
    </>
  );
  if (href)
    return (
      <Link href={href} className="card att">
        {body}
      </Link>
    );
  return <div className="card att">{body}</div>;
}
