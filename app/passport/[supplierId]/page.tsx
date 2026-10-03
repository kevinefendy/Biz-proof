"use client";
import { use } from "react";
import AttestationCard from "@/components/AttestationCard";
import PassportCard from "@/components/PassportCard";
import { mockAttestations, mockSuppliers } from "@/lib/mock";

export default function PassportPage({ params }: { params: Promise<{ supplierId: string }> }) {
  const { supplierId } = use(params);
  const id = decodeURIComponent(supplierId);
  const s = mockSuppliers.find((x) => x.id === id) ?? mockSuppliers[0];
  const records = mockAttestations.filter((a) => a.subjectId === s.id);
  const active = records.filter((a) => a.status !== "REVOKED");
  const revoked = records.filter((a) => a.status === "REVOKED");

  return (
    <div>
      <span className="pill">Supplier Passport — publik</span>
      <h1>{s.name}</h1>
      <PassportCard s={s} />
      <h2>Verified records ({active.length})</h2>
      <div className="grid2">
        {active.map((a) => (
          <AttestationCard key={a.uid} a={a} href={`/verify/${encodeURIComponent(a.uid)}`} />
        ))}
      </div>
      {active.length === 0 && <p className="muted">Belum ada record terverifikasi untuk supplier ini.</p>}
      {revoked.length > 0 && (
        <>
          <h2>Riwayat revoked ({revoked.length})</h2>
          <p className="muted small">Attestation tidak pernah dihapus — revoke tetap tampil sebagai audit trail (PRD §7.8).</p>
          <div className="grid2">
            {revoked.map((a) => (
              <AttestationCard key={a.uid} a={a} href={`/verify/${encodeURIComponent(a.uid)}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
