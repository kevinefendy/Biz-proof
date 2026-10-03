"use client";
import { useState } from "react";
import AttestationCard from "@/components/AttestationCard";
import { mockAttestations } from "@/lib/mock";
import { useWeb3 } from "@/components/Web3Provider";
import { revokeOnChain } from "@/lib/web3";
import { ARBITRUM_SEPOLIA_EXPLORER } from "@/lib/contracts/bizproof";

export default function Attestations() {
  const [filter, setFilter] = useState("ALL");
  const [revokeUid, setRevokeUid] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [tx, setTx] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { account, connectWallet } = useWeb3();

  const list = mockAttestations.filter((a) => filter === "ALL" || a.status === filter);

  async function handleRevoke() {
    setError(null);
    setTx(null);
    if (!revokeUid.trim()) {
      setError("Isi UID attestation yang akan direvoke.");
      return;
    }
    if (!reason.trim()) {
      setError("Alasan revoke wajib diisi untuk audit trail (PRD §7.8).");
      return;
    }
    if (!account) {
      await connectWallet();
      return;
    }
    setLoading(true);
    try {
      const txHash = await revokeOnChain(revokeUid.trim(), reason.trim());
      setTx(txHash);
    } catch (e: any) {
      setError(e?.reason || e?.message || "Gagal revoke. Hanya issuer asli atau owner yang bisa revoke.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1>Semua attestation + Revoke</h1>
      <div className="btn-row">
        {["ALL", "CONFIRMED", "PENDING_CONFIRMATION", "FINANCED", "REVOKED", "EXPIRED"].map((f) => (
          <button key={f} className={`btn sm ${filter === f ? "primary" : ""}`} onClick={() => setFilter(f)}>
            {f}
          </button>
        ))}
      </div>
      <div className="grid2">
        {list.map((a) => (
          <AttestationCard key={a.uid} a={a} href={`/verify/${encodeURIComponent(a.uid)}`} />
        ))}
      </div>
      <div className="card" style={{ marginTop: 24 }}>
        <h3>Revoke on-chain (PRD §7.8)</h3>
        <p className="muted small">
          Attestation tidak pernah dihapus — status berubah CONFIRMED → REVOKED + alasan dan waktu.
          Histori tetap tampil di Passport dengan badge Revoked. Hanya issuer asli atau owner kontrak.
        </p>
        <input
          className="input"
          placeholder="UID attestation (0x…)"
          value={revokeUid}
          onChange={(e) => setRevokeUid(e.target.value)}
          style={{ marginBottom: 8 }}
        />
        <input
          className="input"
          placeholder="Alasan revoke (mis. rekening berubah tanpa persetujuan)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          style={{ marginBottom: 8 }}
        />
        <button className="btn danger sm" onClick={handleRevoke} disabled={loading}>
          {loading ? "Memproses revoke…" : "Revoke On-Chain"}
        </button>
        {tx && (
          <div className="alert success small" style={{ marginTop: 12 }}>
            Revoke berhasil.{" "}
            <a href={`${ARBITRUM_SEPOLIA_EXPLORER}/tx/${tx}`} target="_blank" rel="noreferrer" className="link">
              Lihat tx ↗
            </a>
          </div>
        )}
        {error && <div className="alert danger small" style={{ marginTop: 12 }}>{error}</div>}
      </div>
    </div>
  );
}
