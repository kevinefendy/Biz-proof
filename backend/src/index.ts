import express from "express";
import cors from "cors";
import helmet from "helmet";
import { config } from "./config";
import { store } from "./services/store";
import { startIndexer } from "./services/indexer";
import invoices from "./routes/invoices";
import confirmations from "./routes/confirmations";
import attestations from "./routes/attestations";
import suppliers from "./routes/suppliers";

const app = express();
app.use(helmet());
app.use(cors({ origin: [config.frontendUrl, "http://localhost:3000"] }));
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    chain: "arbitrum-sepolia",
    registry: config.registryAddress,
    relayer: config.isRelayerConfigured() ? "configured" : "client-sign",
  });
});

app.use("/v1/invoices", invoices);
app.use("/v1/confirmations", confirmations);
app.use("/v1/attestations", attestations);
app.use("/v1/suppliers", suppliers);
app.get("/v1/audit", (_req, res) => res.json(store.listAudit()));

// Webhook registry (MVP: simpan target; dispatcher dipanggil indexer/manual)
const webhookTargets: { url: string; events: string[] }[] = [];
app.post("/v1/webhooks", (req, res) => {
  const { url, events } = req.body ?? {};
  if (!url) return res.status(400).json({ error: "url wajib" });
  webhookTargets.push({ url, events: events ?? ["attestation.confirmed", "attestation.revoked", "attestation.financed"] });
  res.status(201).json({ url, events: webhookTargets.at(-1)!.events });
});
app.get("/v1/webhooks", (_req, res) => res.json(webhookTargets));

const port = config.port;
app.listen(port, () => {
  console.log(`BizProof backend listening on :${port}`);
  console.log(`Registry: ${config.registryAddress}`);
  startIndexer();
});
