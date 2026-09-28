// SHA-256 hashing in browser via Web Crypto (PRD §10). Salted per record.
export async function sha256Hex(input: string | ArrayBuffer): Promise<string> {
  const buf =
    typeof input === "string" ? new TextEncoder().encode(input) : new Uint8Array(input as ArrayBuffer);
  const digest = await crypto.subtle.digest("SHA-256", buf as BufferSource);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function randomSalt(bytes = 16): string {
  const arr = crypto.getRandomValues(new Uint8Array(bytes));
  return [...arr].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function hashInvoiceWithSalt(canonicalPayload: string, salt: string): Promise<string> {
  return sha256Hex(`${salt}::${canonicalPayload}`);
}

export async function hashFile(file: File): Promise<{ fileHash: string; salt: string; invoiceHash: string }> {
  const buf = await file.arrayBuffer();
  const fileHash = await sha256Hex(buf);
  const salt = randomSalt();
  const invoiceHash = await hashInvoiceWithSalt(fileHash, salt);
  return { fileHash, salt, invoiceHash };
}
