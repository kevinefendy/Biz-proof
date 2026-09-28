import Link from "next/link";

export const buyerNav = [
  { href: "/app/overview", label: "Overview" },
  { href: "/app/confirmations", label: "Confirmations (PENDING)" },
  { href: "/app/attestations", label: "Attestations + Revoke" },
  { href: "/app/suppliers", label: "Suppliers" },
  { href: "/app/members", label: "Members & Approver" },
  { href: "/app/audit-log", label: "Audit Log" },
  { href: "/app/api-settings", label: "API Settings" },
  { href: "/app/settings", label: "Settings" },
];

export default function BuyerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <span className="pill">Buyer workspace — /app</span>
      <div className="sidebar-layout" style={{ marginTop: 12 }}>
        <aside className="side">
          {buyerNav.map((n) => (
            <Link key={n.href} href={n.href}>
              {n.label}
            </Link>
          ))}
        </aside>
        <div>{children}</div>
      </div>
    </div>
  );
}
