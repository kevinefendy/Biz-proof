import { ethers } from "ethers";
import { config } from "../config";
import { BIZPROOF_ABI } from "./contract";
import { store } from "./store";
import { newId } from "../utils/hash";

let started = false;

/**
 * Indexer ringan (PRD §10): dengarkan event kontrak lalu sinkronkan mirror DB
 * agar halaman verify/explorer cepat tanpa selalu query RPC.
 * MVP: polling filter tiap 30 detik + live listener bila RPC mendukung websocket/polling.
 */
export function startIndexer() {
  if (started) return;
  started = true;
  try {
    const provider = new ethers.JsonRpcProvider(config.rpcUrl);
    const contract = new ethers.Contract(config.registryAddress, BIZPROOF_ABI, provider);

    contract.on("Attested", (uid, issuer) => {
      store.log({ id: newId("log"), org_id: String(issuer), actor_id: String(issuer), action: "attestation.confirmed", target: String(uid), at: new Date().toISOString() });
      console.log(`[indexer] Attested ${uid}`);
    });
    contract.on("Revoked", (uid) => {
      store.updateAttestationStatus(String(uid), "REVOKED", { revoked_at: new Date().toISOString() });
      console.log(`[indexer] Revoked ${uid}`);
    });
    contract.on("Financed", (uid) => {
      store.updateAttestationStatus(String(uid), "FINANCED");
      console.log(`[indexer] Financed ${uid}`);
    });
    contract.on("Settled", (uid) => {
      store.updateAttestationStatus(String(uid), "SETTLED");
      console.log(`[indexer] Settled ${uid}`);
    });
    console.log("[indexer] listening:", config.registryAddress);
  } catch (e) {
    console.warn("[indexer] gagal start (RPC belum siap):", (e as Error).message);
  }
}
