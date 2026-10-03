// Store in-memory untuk MVP dev (tanpa Docker), dengan shape sesuai db/schema.sql.
// Saat DATABASE_URL/MySQL siap, ganti implementasi dengan mysql2 — interface tetap sama.
export interface Invoice {
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

export interface AttestationRow {
  id: string;
  onchain_uid: string;
  invoice_id: string;
  tx_hash: string;
  status: string;
  issued_at: string;
  revoked_at: string | null;
  revoke_reason: string | null;
}

export interface AuditRow {
  id: string;
  org_id: string;
  actor_id: string;
  action: string;
  target: string;
  at: string;
}

const invoices = new Map<string, Invoice>();
const attestations = new Map<string, AttestationRow>();
const audit: AuditRow[] = [];

export const store = {
  createInvoice(inv: Invoice) {
    for (const v of invoices.values()) {
      if (v.invoice_hash === inv.invoice_hash) {
        throw Object.assign(new Error("invoiceHash sudah terdaftar (anti double-financing)"), { code: "DUPLICATE" });
      }
    }
    invoices.set(inv.id, inv);
    return inv;
  },
  getInvoice(id: string) {
    return invoices.get(id) ?? null;
  },
  listInvoices() {
    return [...invoices.values()];
  },
  updateInvoiceStatus(id: string, status: string) {
    const inv = invoices.get(id);
    if (!inv) return null;
    inv.status = status;
    return inv;
  },
  saveAttestation(a: AttestationRow) {
    attestations.set(a.onchain_uid.toLowerCase(), a);
    return a;
  },
  getAttestationByUid(uid: string) {
    return attestations.get(uid.toLowerCase()) ?? null;
  },
  listAttestations() {
    return [...attestations.values()];
  },
  updateAttestationStatus(uid: string, status: string, extra: Partial<AttestationRow> = {}) {
    const a = attestations.get(uid.toLowerCase());
    if (!a) return null;
    Object.assign(a, { status }, extra);
    return a;
  },
  log(entry: AuditRow) {
    audit.unshift(entry);
    return entry;
  },
  listAudit() {
    return audit.slice(0, 100);
  },
};
