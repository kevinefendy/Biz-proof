export default function LenderApi() {
  return (
    <div>
      <h1>Lender API</h1>
      <div className="card">
        <pre className="code">{`GET /v1/attestations/:id   → cek konfirmasi + duplikasi invoiceHash
POST /v1/attestations/:id/finance (API key lender)

Webhook:
  attestation.confirmed | attestation.revoked | attestation.financed`}</pre>
      </div>
    </div>
  );
}
