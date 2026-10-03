import { Router } from "express";
import { z } from "zod";
import { ethers } from "ethers";
import { store } from "../services/store";
import { attestViaRelayer, getOnChainAttestation } from "../services/contract";
import { newId, toBytes32 } from "../utils/hash";
import { config } from "../config";

const r = Router();

// POST /v1/confirmations/:invoiceId/confirm — buyer confirm → attest on-chain (langsung atau via relayer)
r.post("/:invoiceId/confirm", async (req, res) => {
  const inv = store.getInvoice(req.params.invoiceId);
  if (!inv) return res.status(404).json({ error: "invoice tidak ditemukan" });
  if (inv.status !== "PENDING_CONFIRMATION") return res.status(409).json({ error: `status invoice ${inv.status}, tidak bisa confirm` });

  const schema = z.object({
    subjectId: z.string().min(1).default(inv.supplier_org_id),
    expiresAt: z.number().int().nonnegative().optional().default(0),
  }).safeParse(req.body ?? {});
  if (!schema.success) return res.status(400).json({ error: schema.error.flatten() });

  // Mode 1: relayer gasless (backend menanggung gas, PRD §10)
  if (config.isRelayerConfigured()) {
    try {
      const { txHash, uid } = await attestViaRelayer({
        subjectId: toBytes32(schema.data.subjectId),
        schemaId: ethers.keccak256(ethers.toUtf8Bytes("INVOICE_CONFIRMED_V1")),
        invoiceHash: toBytes32(inv.invoice_hash),
        payeeHash: toBytes32(inv.payee_hash),
        expiresAt: schema.data.expiresAt,
      });
      store.updateInvoiceStatus(inv.id, "CONFIRMED");
      store.saveAttestation({ id: newId("att"), onchain_uid: uid, invoice_id: inv.id, tx_hash: txHash, status: "CONFIRMED", issued_at: new Date().toISOString(), revoked_at: null, revoke_reason: null });
      store.log({ id: newId("log"), org_id: inv.buyer_org_id, actor_id: "buyer", action: "attestation.confirmed", target: inv.ref_no, at: new Date().toISOString() });
      return res.status(201).json({ uid, txHash, mode: "relayer" });
    } catch (e: any) {
      return res.status(502).json({ error: e?.reason || e?.message || "attest on-chain gagal" });
    }
  }

  // Mode 2: kembalikan parameter agar frontend yang sign via MetaMask (tanpa relayer)
  return res.json({
    mode: "client-sign",
    registry: config.registryAddress,
    params: {
      subjectId: toBytes32(schema.data.subjectId),
      schemaId: ethers.keccak256(ethers.toUtf8Bytes("INVOICE_CONFIRMED_V1")),
      invoiceHash: toBytes32(inv.invoice_hash),
      payeeHash: toBytes32(inv.payee_hash),
      expiresAt: schema.data.expiresAt,
    },
  });
});

// POST /v1/confirmations/:invoiceId/reject
r.post("/:invoiceId/reject", (req, res) => {
  const inv = store.getInvoice(req.params.invoiceId);
  if (!inv) return res.status(404).json({ error: "invoice tidak ditemukan" });
  const parsed = z.object({ reason: z.string().min(3) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "reason wajib (min 3 char)" });
  store.updateInvoiceStatus(inv.id, "REJECTED");
  store.log({ id: newId("log"), org_id: inv.buyer_org_id, actor_id: "buyer", action: "confirmation.rejected", target: `${inv.ref_no} — ${parsed.data.reason}`, at: new Date().toISOString() });
  res.json({ id: inv.id, status: "REJECTED" });
});

// GET /v1/confirmations/pending — antrean buyer
r.get("/pending/list", (_req, res) => {
  res.json(store.listInvoices().filter((i) => i.status === "PENDING_CONFIRMATION"));
});

export default r;
