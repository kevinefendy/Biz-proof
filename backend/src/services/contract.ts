import { ethers } from "ethers";
import { config } from "../config";

export const BIZPROOF_ABI = [
  "function attest(bytes32 subjectId, bytes32 schemaId, bytes32 invoiceHash, bytes32 payeeHash, uint64 expiresAt) returns (bytes32 uid)",
  "function revoke(bytes32 uid, bytes32 reasonHash)",
  "function markFinanced(bytes32 uid)",
  "function markSettled(bytes32 uid)",
  "function getAttestation(bytes32 uid) view returns (tuple(bytes32 uid, address issuer, bytes32 subjectId, bytes32 schemaId, bytes32 invoiceHash, bytes32 payeeHash, uint64 issuedAt, uint64 expiresAt, uint8 status, bytes32 revokeReasonHash))",
  "function isInvoiceActive(bytes32 invoiceHash) view returns (bool isActive, bytes32 activeUid)",
  "function getActiveUidByInvoice(bytes32 invoiceHash) view returns (bytes32)",
  "event Attested(bytes32 indexed uid, address indexed issuer, bytes32 indexed subjectId, bytes32 schemaId, bytes32 invoiceHash, bytes32 payeeHash, uint64 issuedAt, uint64 expiresAt)",
  "event Revoked(bytes32 indexed uid, address indexed revoker, bytes32 reasonHash, uint64 revokedAt)",
  "event Financed(bytes32 indexed uid, address indexed lender, uint64 financedAt)",
  "event Settled(bytes32 indexed uid, address indexed actor, uint64 settledAt)",
] as const;

export function readContract(): ethers.Contract {
  const provider = new ethers.JsonRpcProvider(config.rpcUrl);
  return new ethers.Contract(config.registryAddress, BIZPROOF_ABI, provider);
}

function relayerContract(): ethers.Contract {
  if (!config.isRelayerConfigured()) {
    throw new Error("RELAYER_PRIVATE_KEY belum dikonfigurasi — set di backend/.env untuk mode gasless.");
  }
  const provider = new ethers.JsonRpcProvider(config.rpcUrl);
  const wallet = new ethers.Wallet(config.relayerKey, provider);
  return new ethers.Contract(config.registryAddress, BIZPROOF_ABI, wallet);
}

export async function getOnChainAttestation(uid: string) {
  const c = readContract();
  try {
    const att = await c.getAttestation(uid);
    return {
      uid: att.uid as string,
      issuer: att.issuer as string,
      subjectId: att.subjectId as string,
      schemaId: att.schemaId as string,
      invoiceHash: att.invoiceHash as string,
      payeeHash: att.payeeHash as string,
      issuedAt: Number(att.issuedAt),
      expiresAt: Number(att.expiresAt),
      status: Number(att.status),
      revokeReasonHash: att.revokeReasonHash as string,
    };
  } catch {
    return null;
  }
}

export async function isInvoiceActiveOnChain(invoiceHash: string) {
  const c = readContract();
  try {
    const [isActive, activeUid] = await c.isInvoiceActive(invoiceHash);
    return { isActive: Boolean(isActive), activeUid: activeUid as string };
  } catch {
    return { isActive: false, activeUid: ethers.ZeroHash };
  }
}

/** Relayer gasless: backend menanggung gas agar buyer non-teknis tak perlu ETH (PRD §10). */
export async function attestViaRelayer(p: {
  subjectId: string;
  schemaId: string;
  invoiceHash: string;
  payeeHash: string;
  expiresAt?: number;
}): Promise<{ txHash: string; uid: string }> {
  const c = relayerContract();
  const tx = await c.attest(p.subjectId, p.schemaId, p.invoiceHash, p.payeeHash, BigInt(p.expiresAt ?? 0));
  const receipt = await tx.wait(1);
  let uid = "";
  for (const log of receipt?.logs ?? []) {
    try {
      const parsed = c.interface.parseLog({ topics: log.topics as string[], data: log.data });
      if (parsed?.name === "Attested") {
        uid = parsed.args.uid;
        break;
      }
    } catch { /* abaikan log lain */ }
  }
  return { txHash: receipt.hash, uid: uid || receipt.hash };
}

export async function revokeViaRelayer(uid: string, reasonText: string): Promise<string> {
  const c = relayerContract();
  const reasonHash = ethers.keccak256(ethers.toUtf8Bytes(reasonText));
  const tx = await c.revoke(uid, reasonHash);
  const receipt = await tx.wait(1);
  return receipt.hash;
}

export async function markFinancedViaRelayer(uid: string): Promise<string> {
  const c = relayerContract();
  const tx = await c.markFinanced(uid);
  const receipt = await tx.wait(1);
  return receipt.hash;
}
