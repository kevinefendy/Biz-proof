export default function Members() {
  return (
    <div>
      <h1>Members & Approver policy</h1>
      <div className="card">
        <table className="table">
          <thead><tr><th>Nama</th><th>Email</th><th>Role</th><th>Approver</th></tr></thead>
          <tbody>
            <tr><td>Sinta (Finance)</td><td>sinta@buyer.co.id</td><td>admin</td><td>Ya — ≤ Rp500jt</td></tr>
            <tr><td>Budi (Procurement)</td><td>budi@buyer.co.id</td><td>approver</td><td>Ya — wajib 2 approver di atas Rp500jt</td></tr>
            <tr><td>Rina (Staff)</td><td>rina@buyer.co.id</td><td>viewer</td><td>Tidak</td></tr>
          </tbody>
        </table>
      </div>
      <div className="card">
        <h3>Policy</h3>
        <p className="muted small">Nominal di atas ambang (cth. Rp500jt) wajib dua approver. 2FA wajib untuk approver. (PRD §7.6, §10)</p>
      </div>
    </div>
  );
}
