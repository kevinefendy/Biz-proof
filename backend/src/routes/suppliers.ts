import { Router } from "express";
import { store } from "../services/store";

const r = Router();

// GET /v1/suppliers/:id/passport — ringkasan verified records (PRD §7.5, bukan skor kredit)
r.get("/:id/passport", (req, res) => {
  const id = req.params.id;
  const invoices = store.listInvoices().filter((i) => i.supplier_org_id === id);
  const atts = store.listAttestations().filter((a) => {
    const inv = store.getInvoice(a.invoice_id);
    return inv?.supplier_org_id === id;
  });
  const confirmed = atts.filter((a) => a.status === "CONFIRMED" || a.status === "FINANCED").length;
  const revoked = atts.filter((a) => a.status === "REVOKED").length;
  const pending = invoices.filter((i) => i.status === "PENDING_CONFIRMATION").length;
  res.json({
    supplierId: id,
    verifiedRecords: confirmed,
    counterparties: new Set(invoices.map((i) => i.buyer_org_id)).size,
    pending,
    revoked,
    note: "Bukan skor kredit — hanya menghitung record yang dikonfirmasi pembeli.",
    attestations: atts,
  });
});

// GET /v1/audit — audit log buyer (PRD §7.6) — dipasang juga di /v1/audit via index
r.get("/audit/list", (_req, res) => res.json(store.listAudit()));

export default r;
