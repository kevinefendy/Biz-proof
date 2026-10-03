export default function LenderApi() {
  return (
    <div>
      <h1>Lender API</h1>
      <p className="muted small">
        Untuk bank / fintech SCF: cek konfirmasi otomatis, deteksi double financing, dan terima webhook
        status (PRD §7.7). Verifikasi publik selalu gratis; endpoint massal butuh API key lender.
      </p>
      <div className="card">
        <h3>GET /v1/attestations/:id</h3>
        <pre className="code">{`curl -H "X-API-Key: $LENDER_KEY" \\
  https://api.bizproof.network/v1/attestations/0x7f3a…

→ 200 OK
{
  "uid": "0x7f3a…",
  "issuer": "PT Sumber Diri Sembilan",
  "subjectId": "sup_karyawaha_001",
  "schemaId": "INVOICE_CONFIRMED",
  "invoiceHash": "9f2c…",
  "payeeHash": "a1b2…",
  "status": "CONFIRMED",
  "issuedAt": "2026-07-20T10:24:00+07:00",
  "txHash": "0x3a9c…",
  "arbiscan": "https://sepolia.arbiscan.io/tx/0x3a9c…"
}`}</pre>
      </div>
      <div className="card">
        <h3>POST /v1/attestations/:id/finance (role lender)</h3>
        <pre className="code">{`curl -X POST -H "X-API-Key: $LENDER_KEY" \\
  https://api.bizproof.network/v1/attestations/0x7f3a…/finance

→ 200 OK { "uid": "0x7f3a…", "status": "FINANCED" }
→ 409 CONFLICT { "error": "invoiceHash already financed", "activeUid": "0x4c6e…" }

On-chain setara: markFinanced(uid) — hanya isAuthorizedLender / owner.`}</pre>
      </div>
      <div className="card">
        <h3>Webhook</h3>
        <pre className="code">{`POST {webhook_url}  (event + signature HMAC)
{
  "event": "attestation.confirmed | attestation.revoked | attestation.financed",
  "uid": "0x7f3a…",
  "invoiceHash": "9f2c…",
  "at": "2026-08-20T11:41:00+07:00"
}`}</pre>
      </div>
      <div className="card">
        <h3>Cek duplikasi invoice (PRD §7.4)</h3>
        <pre className="code">{`GET /v1/invoices/check?invoiceHash=9f2c…
→ { "isActive": true, "activeUid": "0x7f3a…" }

On-chain setara: isInvoiceActive(invoiceHash) — view, gratis gas.`}</pre>
      </div>
    </div>
  );
}
