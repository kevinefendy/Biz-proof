"use client";
import { use } from "react";
import Link from "next/link";
import { useApp } from "@/components/AppProvider";
import { dict } from "@/lib/i18n";
import { ARBISCAN_BASE, findAttestation } from "@/lib/mock";
import StatusBadge from "@/components/StatusBadge";
import PayeeMismatchAlert from "@/components/PayeeMismatchAlert";
import RevocationBanner from "@/components/RevocationBanner";
import HashCompareBlock from "@/components/HashCompareBlock";
import VerifyInputBox from "@/components/VerifyInputBox";

export default function VerifyDetail({ params }: { params: Promise<{ attestationId: string }> }) {
  const { attestationId } = use(params);
  const id = decodeURIComponent(attestationId);
  const { lang } = useApp();
  const t = dict[lang];
  const a = findAttestation(id);

  return (
    <div>
      <Link href="/verify" className="link">← {t.verify_title}</Link>
      <h1>Hasil verifikasi</h1>
      <VerifyInputBox compact />
      {!a ? (
        <div className="card">
          <StatusBadge status="NOT_FOUND" />
          <p className="muted">{t.status_notfound} untuk “{id}”.</p>
        </div>
      ) : (
        <>
          <div className="card">
            <div className="row-between">
              <StatusBadge status={a.status} />
              <code className="mono small">{a.refNo}</code>
            </div>
            <h2>{a.supplierName}</h2>
            <dl className="dl">
              <dt>UID</dt>
              <dd><code className="mono small">{a.uid}</code></dd>
              <dt>Issuer (buyer)</dt>
              <dd>{a.issuer} (<code className="mono">{a.issuerWallet}</code>)</dd>
              <dt>Subject</dt>
              <dd>{a.supplierName} (<code className="mono">{a.subjectId}</code>)</dd>
              <dt>Schema</dt>
              <dd><code className="mono">{a.schemaId}</code></dd>
              <dt>Invoice hash</dt>
              <dd><code className="mono small">{a.invoiceHash}</code></dd>
              <dt>Payee hash</dt>
              <dd><code className="mono small">{a.payeeHash}</code></dd>
              <dt>Issued</dt>
              <dd>{a.issuedAt}</dd>
              <dt>Expires</dt>
              <dd>{a.expiresAt ?? "— (tidak kedaluwarsa)"}</dd>
              <dt>Tx</dt>
              <dd><code className="mono small">{a.txHash}</code></dd>
            </dl>
            <PayeeMismatchAlert show={a.payeeMismatch} />
            <RevocationBanner reason={a.revokeReason} />
            <div className="btn-row">
              <a className="btn" href={`${ARBISCAN_BASE}/${a.txHash}`} target="_blank" rel="noreferrer">
                {t.arbiscan} ↗
              </a>
              <button className="btn ghost" onClick={() => navigator.clipboard?.writeText(`${location.origin}/verify/${a.uid}`)}>
                Copy shareable link
              </button>
            </div>
          </div>
          <HashCompareBlock expectedHash={a.invoiceHash} />
        </>
      )}
    </div>
  );
}
