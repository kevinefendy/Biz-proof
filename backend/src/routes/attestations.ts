import { Router } from "express";
import { z } from "zod";
import { store } from "../services/store";
import { getOnChainAttestation, isInvoiceActiveOnChain, markFinancedViaRelayer, revokeViaRelayer } from "../services/contract";
import { newId } from "../utils/hash";
import { requireApiKey } from "../middleware/auth";
import { config } from "../config";

const r = Router();

// POST /v1/attestations/record — frontend melapor setelah sign sendiri (mode client-sign).
// NOTE: di atas "/:uid" agar tidak tertelan param.
r.post("/record/entry", (req, res) => {
  const parsed = z.object({
    invoice_id: z.string().min(1),
    uid: z.string().regex(/^0x[0-9a-fA-F]{64}$/),
    tx_hash: z.string().regex(/^0x[0-9a-fA-F]{64}$/),
  }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invoice_id, uid, tx_hash (0x…) wajib" });
  const inv = store.getInvoice(parsed.data.invoice_id);
  if (!inv) return res.status(404).json({ error: "invoice tidak ditemukan" });
  store.updateInvoiceStatus(inv.id, "CONFIRMED");
  const saved = store.saveAttestation({
    id: newId("att"),
    onchain_uid: parsed.data.uid,
    invoice_id: inv.id,
    tx_hash: parsed.data.tx_hash,
    status: "CONFIRMED",
    issued_at: new Date().toISOString(),
    revoked_at: null,
    revoke_reason: null,
  });
  store.log({ id: newId("log"), org_id: inv.buyer_org_id, actor_id: "buyer", action: "attestation.confirmed", target: inv.ref_no, at: new Date().toISOString() });
  res.status(201).json(saved);
});

// GET /v1/attestations/check/by-invoice?invoiceHash=… — anti double-financing (PRD §7.4)
// NOTE: harus di atas "/:uid" agar tidak tertelan param.
r.get("/check/by-invoice", async (req, res) => {
  const h = String(req.query.invoiceHash || "");
  if (!/^(0x)?[0-9a-fA-F]{64}$/.test(h)) return res.status(400).json({ error: "invoiceHash harus hex 64 char" });
  const norm = h.startsWith("0x") ? h : "0x" + h;
  const result = await isInvoiceActiveOnChain(norm);
  res.json(result);
});

// GET /v1/attestations/:uid — sumber on-chain dulu, fallback mirror DB (PRD §7.3)
r.get("/:uid", async (req, res) => {
  const uid = req.params.uid;
  const onchain = await getOnChainAttestation(uid);
  const mirror = store.getAttestationByUid(uid);
  if (!onchain && !mirror) return res.status(404).json({ error: "attestation tidak ditemukan" });
  res.json({ onchain, mirror });
});

// POST /v1/attestations/:uid/revoke — buyer/owner (langsung relayer jika dikonfigurasi)
r.post("/:uid/revoke", async (req, res) => {
  const parsed = z.object({ reason: z.string().min(3) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "reason wajib" });
  if (!config.isRelayerConfigured()) {
    store.updateAttestationStatus(req.params.uid, "REVOKED", { revoked_at: new Date().toISOString(), revoke_reason: parsed.data.reason });
    return res.json({ uid: req.params.uid, status: "REVOKED", mode: "mirror (relayer belum dikonfigurasi)" });
  }
  try {
    const txHash = await revokeViaRelayer(req.params.uid, parsed.data.reason);
    store.updateAttestationStatus(req.params.uid, "REVOKED", { revoked_at: new Date().toISOString(), revoke_reason: parsed.data.reason });
    store.log({ id: newId("log"), org_id: "buyer", actor_id: "buyer", action: "attestation.revoked", target: req.params.uid, at: new Date().toISOString() });
    res.json({ uid: req.params.uid, status: "REVOKED", txHash });
  } catch (e: any) {
    res.status(502).json({ error: e?.reason || e?.message || "revoke gagal" });
  }
});

// POST /v1/attestations/:uid/finance — role lender (PRD §7.4/§7.7)
r.post("/:uid/finance", requireApiKey, async (req, res) => {
  const onchain = await getOnChainAttestation(req.params.uid);
  if (onchain && onchain.status === 3) return res.status(409).json({ error: "sudah FINANCED" });
  if (!config.isRelayerConfigured()) {
    store.updateAttestationStatus(req.params.uid, "FINANCED");
    return res.json({ uid: req.params.uid, status: "FINANCED", mode: "mirror (relayer belum dikonfigurasi)" });
  }
  try {
    const txHash = await markFinancedViaRelayer(req.params.uid);
    store.updateAttestationStatus(req.params.uid, "FINANCED");
    store.log({ id: newId("log"), org_id: "lender", actor_id: "lender", action: "attestation.financed", target: req.params.uid, at: new Date().toISOString() });
    res.json({ uid: req.params.uid, status: "FINANCED", txHash });
  } catch (e: any) {
    res.status(502).json({ error: e?.reason || e?.message || "markFinanced gagal — pastikan relayer terdaftar sebagai lender/owner" });
  }
});

export default r;
