export default function Pricing() {
  const tiers = [
    { name: "Free", for: "Supplier, verifier", features: ["Submit invoice", "Supplier Passport dasar", "Verifikasi publik"], price: "Gratis" },
    { name: "Business", for: "Pembeli menengah", features: ["Konfirmasi tanpa batas wajar", "Revoke + dashboard", "Approver policy"], price: "Langganan" },
    { name: "Enterprise (Buyer)", for: "Pembeli besar", features: ["Integrasi ERP/procurement (API)", "SSO, audit log, multi-entity", "Gasless"], price: "Tahunan" },
    { name: "Lender", for: "Bank, fintech, penjamin", features: ["API + webhook", "Verifikasi massal", "Registry FINANCED + SLA"], price: "Langganan + per cek" },
  ];
  return (
    <div>
      <h1>Pricing</h1>
      <p className="muted">Verifikasi publik selalu gratis (PRD §13).</p>
      <div className="grid2">
        {tiers.map((t) => (
          <div className="card" key={t.name}>
            <h3>{t.name}</h3>
            <div className="muted small">{t.for}</div>
            <ul className="small">{t.features.map((f) => <li key={f}>{f}</li>)}</ul>
            <strong>{t.price}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
