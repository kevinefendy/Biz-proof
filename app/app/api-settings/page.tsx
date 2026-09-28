export default function ApiSettings() {
  return (
    <div>
      <h1>API settings</h1>
      <div className="card">
        <h3>API keys</h3>
        <code className="mono small block">bp_test_••••••••3f2a (created 2026-08-01)</code>
        <div className="btn-row"><button className="btn sm">Rotate key</button></div>
      </div>
      <div className="card">
        <h3>Webhooks</h3>
        <code className="mono small block">https://erp.buyer.co.id/hooks/bizproof — attestation.confirmed, attestation.revoked, attestation.financed</code>
        <div className="btn-row"><button className="btn sm">Add endpoint</button></div>
      </div>
    </div>
  );
}
