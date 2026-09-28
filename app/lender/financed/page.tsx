import AttestationCard from "@/components/AttestationCard";
import { mockAttestations } from "@/lib/mock";

export default function Financed() {
  const list = mockAttestations.filter((a) => a.status === "FINANCED");
  return (
    <div>
      <h1>FINANCED registry</h1>
      <p className="muted small">Satu invoiceHash hanya boleh punya satu attestation aktif. Lender menandai FINANCED via API agar lender lain melihat invoice sudah dijaminkan.</p>
      <div className="grid2">
        {list.map((a) => (
          <AttestationCard key={a.uid} a={a} href={`/verify/${encodeURIComponent(a.uid)}`} />
        ))}
      </div>
      {list.length === 0 && <p className="muted">Belum ada yang ditandai FINANCED.</p>}
    </div>
  );
}
