// Helper REST ke backend Express (default http://localhost:4000).
// Isi NEXT_PUBLIC_BACKEND_URL di .env.local bila backend jalan di host/port lain.
export const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

export interface BackendInvoice {
  id: string;
  supplier_org_id: string;
  buyer_org_id: string;
  ref_no: string;
  status: string;
  invoice_hash: string;
  payee_hash: string;
  salt: string;
  submitted_at: string;
}

export interface BackendConfirmResult {
  mode: "relayer" | "client-sign";
  uid?: string;
  txHash?: string;
  registry?: string;
  params?: {
    subjectId: string;
    schemaId: string;
    invoiceHash: string;
    payeeHash: string;
    expiresAt: number;
  };
}

async function req(path: string, init?: RequestInit) {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = typeof data?.error === "string" ? data.error : `Backend ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

export async function submitInvoiceToBackend(body: {
  supplier_org_id: string;
  buyer_org_id: string;
  ref_no: string;
  invoice_hash: string;
  payee_hash: string;
  salt: string;
}) {
  return req("/v1/invoices", { method: "POST", body: JSON.stringify(body) });
}

export async function listPendingInvoices(): Promise<BackendInvoice[]> {
  return req("/v1/confirmations/pending/list");
}

export async function listInvoices(): Promise<BackendInvoice[]> {
  return req("/v1/invoices");
}

export async function getBackendInvoice(id: string): Promise<BackendInvoice> {
  return req(`/v1/invoices/${encodeURIComponent(id)}`);
}

export async function confirmInvoiceBackend(
  invoiceId: string,
  body: { subjectId?: string; expiresAt?: number } = {}
): Promise<BackendConfirmResult> {
  return req(`/v1/confirmations/${encodeURIComponent(invoiceId)}/confirm`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function rejectInvoiceBackend(invoiceId: string, reason: string) {
  return req(`/v1/confirmations/${encodeURIComponent(invoiceId)}/reject`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}

export async function recordAttestationBackend(body: {
  invoice_id: string;
  uid: string;
  tx_hash: string;
}) {
  return req("/v1/attestations/record/entry", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function getAuditLog(): Promise<
  { id: string; org_id: string; actor_id: string; action: string; target: string; at: string }[]
> {
  return req("/v1/audit");
}
