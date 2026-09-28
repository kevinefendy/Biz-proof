import Link from "next/link";

export default function LenderLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <span className="pill">Lender portal</span>
      <div className="sidebar-layout" style={{ marginTop: 12 }}>
        <aside className="side">
          <Link href="/lender/verify">Cek massal</Link>
          <Link href="/lender/financed">FINANCED registry</Link>
          <Link href="/lender/api">API</Link>
        </aside>
        <div>{children}</div>
      </div>
    </div>
  );
}
