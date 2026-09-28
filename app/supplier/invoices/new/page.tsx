"use client";
import { useState } from "react";
import { hashFile } from "@/lib/hash";

export default function NewInvoice() {
  const [out, setOut] = useState<string | null>(null);
  const [buyer, setBuyer] = useState("PT Sumber Diri Sembilan");
  const [ref, setRef] = useState("INV/2026/VIII/0101");
  const [payee, setPayee] = useState("1234567890 — Bank Contoh");

  return (
    <div>
      <h1>Submit invoice (hash di browser)</h1>
      <p className="muted small">File tidak diunggah publik. Yang dikirim: hash + salt commitment (PRD §7.1).</p>
      <div className="card">
        <label className="small">Buyer</label>
        <input className="input" value={buyer} onChange={(e) => setBuyer(e.target.value)} />
        <br /><br />
        <label className="small">Ref No</label>
        <input className="input" value={ref} onChange={(e) => setRef(e.target.value)} />
        <br /><br />
        <label className="small">Rekening tujuan (akan di-hash bersalt → payeeHash)</label>
        <input className="input" value={payee} onChange={(e) => setPayee(e.target.value)} />
        <br /><br />
        <label className="small">File invoice</label>
        <input
          type="file"
          className="input"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            const { fileHash, salt, invoiceHash } = await hashFile(f);
            setOut(
              `buyer=${buyer}\nref=${ref}\nfile=${f.name} (${f.size} bytes)\nSHA-256(file)=${fileHash}\nsalt=${salt}\ninvoiceHash(salted)=${invoiceHash}\n→ kirim ke POST /v1/invoices (mock, belum ada backend)`
            );
          }}
        />
        {out && <pre className="code">{out}</pre>}
      </div>
    </div>
  );
}
