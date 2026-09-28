import Link from "next/link";

export default function SupplierLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <span className="pill">Supplier workspace</span>
      <div className="sidebar-layout" style={{ marginTop: 12 }}>
        <aside className="side">
          <Link href="/supplier/invoices">Invoices</Link>
          <Link href="/supplier/invoices/new">Submit baru</Link>
          <Link href="/supplier/passport">My Passport</Link>
        </aside>
        <div>{children}</div>
      </div>
    </div>
  );
}
