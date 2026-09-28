import Link from "next/link";
import { mockAttestations } from "@/lib/mock";
import StatusBadge from "@/components/StatusBadge";

export default function SupplierInvoices() {
  return (
    <div>
      <div className="row-between">
        <h1>Invoices</h1>
        <Link href="/supplier/invoices/new" className="btn primary sm">+ Submit invoice</Link>
      </div>
      <div className="card">
        <table className="table">
          <thead><tr><th>Ref</th><th>Buyer</th><th>Status</th></tr></thead>
          <tbody>
            {mockAttestations.map((a) => (
              <tr key={a.uid}>
                <td><code className="mono">{a.refNo}</code></td>
                <td>{a.issuer}</td>
                <td><StatusBadge status={a.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
