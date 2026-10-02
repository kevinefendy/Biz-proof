/**
 * BizProof Protocol - Arbitrum Sepolia Contract Configuration & ABI
 * Specification per PRD v3.0 & BizProofRegistry.sol
 */

export const ARBITRUM_SEPOLIA_CHAIN_ID = 421614;
export const ARBITRUM_SEPOLIA_CHAIN_ID_HEX = "0x66eee";
export const ARBITRUM_SEPOLIA_RPC = "https://sepolia-rollup.arbitrum.io/rpc";
export const ARBITRUM_SEPOLIA_EXPLORER = "https://sepolia.arbiscan.io";

export const ARBITRUM_SEPOLIA_PARAMS = {
  chainId: ARBITRUM_SEPOLIA_CHAIN_ID_HEX,
  chainName: "Arbitrum Sepolia Testnet",
  nativeCurrency: {
    name: "Sepolia Ether",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: [ARBITRUM_SEPOLIA_RPC],
  blockExplorerUrls: [ARBITRUM_SEPOLIA_EXPLORER],
};

// Alamat Smart Contract (dapat diset via .env.local atau default testnet)
export const BIZPROOF_REGISTRY_ADDRESS =
  process.env.NEXT_PUBLIC_BIZPROOF_REGISTRY_ADDRESS ||
  "0x8Fa35B47dE2A91D0E031a0e0D911Eb83c3c78F90"; // Mock/Preview CA for testnet

export const BIZPROOF_REGISTRY_ABI = [
  // --- Constructor & Admin ---
  "constructor()",
  "function owner() view returns (address)",
  "function totalAttestations() view returns (uint256)",
  "function isAuthorizedLender(address lender) view returns (bool)",
  "function setLenderAuthorization(address lender, bool authorized)",
  "function transferOwnership(address newOwner)",

  // --- Core Methods ---
  "function attest(bytes32 subjectId, bytes32 schemaId, bytes32 invoiceHash, bytes32 payeeHash, uint64 expiresAt) returns (bytes32 uid)",
  "function revoke(bytes32 uid, bytes32 reasonHash)",
  "function markFinanced(bytes32 uid)",
  "function markSettled(bytes32 uid)",

  // --- View Methods ---
  "function getAttestation(bytes32 uid) view returns (tuple(bytes32 uid, address issuer, bytes32 subjectId, bytes32 schemaId, bytes32 invoiceHash, bytes32 payeeHash, uint64 issuedAt, uint64 expiresAt, uint8 status, bytes32 revokeReasonHash))",
  "function isInvoiceActive(bytes32 invoiceHash) view returns (bool isActive, bytes32 activeUid)",
  "function getActiveUidByInvoice(bytes32 invoiceHash) view returns (bytes32)",

  // --- Events ---
  "event Attested(bytes32 indexed uid, address indexed issuer, bytes32 indexed subjectId, bytes32 schemaId, bytes32 invoiceHash, bytes32 payeeHash, uint64 issuedAt, uint64 expiresAt)",
  "event Revoked(bytes32 indexed uid, address indexed revoker, bytes32 reasonHash, uint64 revokedAt)",
  "event Financed(bytes32 indexed uid, address indexed lender, uint64 financedAt)",
  "event Settled(bytes32 indexed uid, address indexed actor, uint64 settledAt)",
  "event LenderAuthorized(address indexed lender, bool authorized)",
  "event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)",
] as const;

export enum OnChainStatus {
  None = 0,
  Confirmed = 1,
  Revoked = 2,
  Financed = 3,
  Settled = 4,
}

export interface OnChainAttestation {
  uid: string;
  issuer: string;
  subjectId: string;
  schemaId: string;
  invoiceHash: string;
  payeeHash: string;
  issuedAt: number;
  expiresAt: number;
  status: OnChainStatus;
  revokeReasonHash: string;
}
