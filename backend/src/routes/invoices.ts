import { Router } from "express";
import { z } from "zod";
import { store } from "../services/store";
import { newId } from "../utils/hash";

const r = Router();

// POST /v1/invoices — supplier submit hash (file tidak diunggah, PRD §7.1)
const SubmitSchema = z.object({
  supplier_org_id: z.string().min(1),
  buyer_org_id: z.string().min(1),
  ref_no: z.string().min(1),
  invoice_hash: z.string().regex(/^[0-9a-fA-F]{64}$/, "invoice_hash harus SHA-256 hex 64 char"),
  payee_hash: z.string().regex(/^[0-9a-fA-F]{64}$/, "payee_hash harus hex 64 char"),
  salt: z.string().min(8),
});

r.post("/", (req, res) => {
  const parsed = SubmitSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const b = parsed.data;
  try {
    const inv = store.createInvoice({
      id: newId("inv"),
      supplier_org_id: b.supplier_org_id,
      buyer_org_id: b.buyer_org_id,
      ref_no: b.ref_no,
      status: "PENDING_CONFIRMATION",
      invoice_hash: b.invoice_hash.toLowerCase(),
      payee_hash: b.payee_hash.toLowerCase(),
      salt: b.salt,
      submitted_at: new Date().toISOString(),
    });
    store.log({ id: newId("log"), org_id: b.supplier_org_id, actor_id: b.supplier_org_id, action: "confirmation.requested", target: b.ref_no, at: new Date().toISOString() });
    return res.status(201).json(inv);
  } catch (e: any) {
    if (e.code === "DUPLICATE") return res.status(409).json({ error: e.message });
    throw e;
  }
});

r.get("/", (_req, res) => res.json(store.listInvoices()));
r.get("/:id", (req, res) => {
  const inv = store.getInvoice(req.params.id);
  if (!inv) return res.status(404).json({ error: "invoice tidak ditemukan" });
  res.json(inv);
});

export default r;
