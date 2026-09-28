import Link from "next/link";
import AttestationCard from "@/components/AttestationCard";
import { mockAttestations } from "@/lib/mock";

export default function Confirmations() {
  const list = mockAttestations.filter((a) => a.status === "PENDING_CONFIRMATION");
  return (
    <div>
      <h1>Antrean konfirmasi (PENDING)</h1>
      <div className="grid2">
        {list.map((a) => (
          <AttestationCard key={a.uid} a={a} href={`/app/confirmations/${encodeURIComponent(a.uid)}`} />
        ))}
      </div>
      {list.length === 0 && <p className="muted">Tidak ada antrean.</p>}
      <p className="muted small">Lihat semua: <Link className="link" href="/app/attestations">Attestations</Link></p>
    </div>
  );
}
