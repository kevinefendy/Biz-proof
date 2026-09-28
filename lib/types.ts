export type AttestationStatus =
  | "VALID"
  | "PENDING"
  | "REJECTED"
  | "REVOKED"
  | "EXPIRED"
  | "NOT_FOUND"
  | "HASH_MISMATCH";

export type InvoiceStatus =
  | "DRAFT"
  | "PENDING_CONFIRMATION"
  | "CONFIRMED"
  | "FINANCED"
  | "SETTLED"
  | "REJECTED"
  | "REVOKED"
  | "EXPIRED";

export interface Attestation {
  uid: string;
  issuer: string; // buyer org name
  issuerWallet: string;
  subjectId: string; // supplier id / hash
  supplierName: string;
  schemaId: "INVOICE_CONFIRMED" | "DELIVERY_CONFIRMED";
  invoiceHash: string;
  payeeHash: string;
  refNo: string;
  issuedAt: string;
  expiresAt: string | null;
  status: InvoiceStatus;
  txHash: string;
  revokeReason?: string;
  payeeMismatch?: boolean;
}

export interface Supplier {
  id: string;
  name: string;
  wallet: string;
  confirmedCount: number;
  counterpartyCount: number;
  firstActive: string;
  lastActive: string;
  revokedCount: number;
  pendingCount: number;
}

export type Lang = "id" | "en";
export type Role = "buyer" | "supplier" | "lender";
