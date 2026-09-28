import Link from "next/link";
import { mockSuppliers } from "@/lib/mock";

export default function SuppliersPage() {
  return (
    <div>
      <h1>Daftar supplier</h1>
      <table className="table">
        <thead><tr><th>Supplier</th><th>Confirmed</th><th>Pending</th><th>Aksi</th></tr></thead>
        <tbody>
          {mockSuppliers.map((s) => (
            <tr key={s.id}>
              <td>{s.name}<br /><code className="mono small muted">{s.id}</code></td>
              <td>{s.confirmedCount}</td>
              <td>{s.pendingCount}</td>
              <td><Link className="link" href={`/passport/${s.id}`}>Passport ↗</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
