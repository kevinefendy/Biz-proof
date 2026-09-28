export default function AuditLog() {
  const rows = [
    ["2026-08-20 11:41", "sinta@buyer.co.id", "attestation.financed", "INV/2026/VIII/0003"],
    ["2026-08-02 14:10", "budi@buyer.co.id", "confirmation.requested", "INV/2026/VII/0158"],
    ["2026-07-20 10:25", "sinta@buyer.co.id", "attestation.confirmed", "INV/2026/VII/0142"],
    ["2026-06-11 09:20", "sinta@buyer.co.id", "attestation.revoked", "INV/2026/VI/0097 — payee mismatch"],
  ];
  return (
    <div>
      <h1>Audit log</h1>
      <div className="card">
        <table className="table">
          <thead><tr><th>Waktu</th><th>Aktor</th><th>Aksi</th><th>Target</th></tr></thead>
          <tbody>{rows.map((r) => <tr key={r[3]}>{r.map((c) => <td key={c}>{c}</td>)}</tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
