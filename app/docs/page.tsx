export default function Docs() {
  return (
    <div>
      <h1>Docs — API & Schema</h1>
      <p className="muted">Ringkas untuk MVP frontend. Backend Express + MySQL & kontrak Solidity mengikuti PRD §9–§10.</p>
      <div className="card">
        <h3>Schema</h3>
        <pre className="code">{`INVOICE_CONFIRMED { invoiceHash, payeeHash, refNo, buyerOrg, supplierId }
DELIVERY_CONFIRMED { invoiceHash, deliveryRef, receivedAt }`}</pre>
      </div>
      <div className="card">
        <h3>REST (rencana)</h3>
        <pre className="code">{`GET  /v1/attestations/:id        → attestation + status
POST /v1/invoices                → submit (hash + salt commitment)
POST /v1/confirmations/:id/confirm
POST /v1/confirmations/:id/reject
POST /v1/attestations/:id/revoke
POST /v1/attestations/:id/finance  (role lender)
GET  /v1/suppliers/:id/passport`}</pre>
      </div>
      <div className="card">
        <h3>Webhook</h3>
        <pre className="code">{`attestation.confirmed | attestation.revoked | attestation.financed`}</pre>
      </div>
      <div className="card">
        <h3>Kontrak (Arbitrum)</h3>
        <pre className="code">{`attest(), revoke(uid, reasonHash), markFinanced(uid) [lender], getAttestation(uid)
// invoiceHash unik untuk attestation aktif`}</pre>
      </div>
    </div>
  );
}
