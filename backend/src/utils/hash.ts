import { createHash, randomBytes } from "node:crypto";
import { ethers } from "ethers";

/** SHA-256 hex (untuk invoiceHash salted ala PRD §10 — dihitung di browser, diverifikasi ulang di backend). */
export function sha256Hex(data: string | Buffer): string {
  return createHash("sha256").update(data).digest("hex");
}

/** Salted invoice hash: sha256(salt + "|" + canonicalPayload). */
export function saltedInvoiceHash(canonicalPayload: string, salt: string): string {
  return sha256Hex(`${salt}|${canonicalPayload}`);
}

export function newSalt(bytes = 16): string {
  return randomBytes(bytes).toString("hex");
}

export function newId(prefix: string): string {
  return `${prefix}_${randomBytes(8).toString("hex")}`;
}

/** Normalisasi ke bytes32: terima 0x-hash 66 char atau string biasa → keccak256. */
export function toBytes32(v: string): string {
  if (/^0x[0-9a-fA-F]{64}$/.test(v)) return v.toLowerCase();
  if (/^[0-9a-fA-F]{64}$/.test(v)) return ("0x" + v).toLowerCase();
  return ethers.keccak256(ethers.toUtf8Bytes(v));
}

export function keccakOfText(text: string): string {
  return ethers.keccak256(ethers.toUtf8Bytes(text));
}
