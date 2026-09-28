import type { InvoiceStatus } from "@/lib/types";

const map: Record<InvoiceStatus | "NOT_FOUND" | "HASH_MISMATCH", { label: string; className: string; icon: string }> = {
  CONFIRMED: { label: "VALID", className: "badge-valid", icon: "✓" },
  FINANCED: { label: "FINANCED", className: "badge-valid", icon: "◆" },
  SETTLED: { label: "SETTLED", className: "badge-valid", icon: "✓" },
  PENDING_CONFIRMATION: { label: "PENDING", className: "badge-pending", icon: "◷" },
  REJECTED: { label: "REJECTED", className: "badge-bad", icon: "✕" },
  REVOKED: { label: "REVOKED", className: "badge-bad", icon: "!" },
  EXPIRED: { label: "EXPIRED", className: "badge-muted", icon: "○" },
  DRAFT: { label: "DRAFT", className: "badge-muted", icon: "○" },
  NOT_FOUND: { label: "NOT FOUND", className: "badge-muted", icon: "?" },
  HASH_MISMATCH: { label: "HASH MISMATCH", className: "badge-bad", icon: "≠" },
};

export default function StatusBadge({ status }: { status: keyof typeof map }) {
  const s = map[status];
  return (
    <span className={`badge ${s.className}`} role="status">
      <span aria-hidden>{s.icon}</span> {s.label}
    </span>
  );
}
