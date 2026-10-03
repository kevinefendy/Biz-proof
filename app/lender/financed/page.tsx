"use client";
import { useState } from "react";
import AttestationCard from "@/components/AttestationCard";
import { mockAttestations } from "@/lib/mock";
import { useWeb3 } from "@/components/Web3Provider";
import { markFinancedOnChain } from "@/lib/web3";
import { ARBITRUM_SEPOLIA_EXPLORER } from "@/lib/contracts/bizproof";

export default function Financed() {
  const list = mockAttestations.filter((a) => a.status === "FINANCED");
  const confirmable = mockAttestations.filter((a) => a.status === "CONFIRMED");
  const { account, connectWallet } = useWeb3();
  const [targetUid, setTargetUid] = useState("");
  const [loading, setLoading] = useState(false);
  const [tx, setTx] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleMarkFinanced(uid: string) {
    setError(null);
    setTx(null);
    if (!account) {
      await connectWallet();
      return;
    }
    setLoading(true);
    setTargetUid(uid);
    try {
      const txHash = await markFinancedOnChain(uid);
      setTx(txHash);
    } catch (e: any) {
      setError(e?.reason || e?.message || "Gagal markFinanced. Pastikan wallet terdaftar sebagai lender.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1>FINANCED registry</h1>
      <p className="muted small">
        Satu invoiceHash hanya boleh punya satu attestation aktif. Lender menandai FINANCED via{" "}
        <code className="mono">markFinanced(uid)</code> agar lender lain melihat invoice sudah dijaminkan (PRD §7.4).
      </p>
      <div className="grid2">
        {list.map((a) => (
          <AttestationCard key={a.uid} a={a} href={`/verify/${encodeURIComponent(a.uid)}`} />
        ))}
      </div>
      {list.length === 0 && <p className="muted">Belum ada yang ditandai FINANCED.</p>}

      <div className="card" style={{ marginTop: 24 }}>
        <h3>Tandai FINANCED on-chain (role lender)</h3>
        <p className="muted small">
          Pilih attestation CONFIRMED lalu tandai sebagai FINANCED. Hanya lender terotorisasi
          (<code className="mono">isAuthorizedLender</code>) atau owner kontrak yang bisa memanggil fungsi ini.
        </p>
        {confirmable.map((a) => (
          <div key={a.uid} className="row-between" style={{ padding: "8px 0", borderTop: "1px solid var(--border)" }}>
            <code className="mono small">{a.refNo} · {a.uid.slice(0, 18)}…</code>
            <button
              className="btn sm primary"
              disabled={loading && targetUid === a.uid}
              onClick={() => handleMarkFinanced(a.uid)}
            >
              {loading && targetUid === a.uid ? "Memproses…" : "Mark Financed"}
            </button>
          </div>
        ))}
        {tx && (
          <div className="alert success small" style={{ marginTop: 12 }}>
            Berhasil ditandai FINANCED.{" "}
            <a href={`${ARBITRUM_SEPOLIA_EXPLORER}/tx/${tx}`} target="_blank" rel="noreferrer" className="link">
              Lihat tx {tx.slice(0, 18)}… ↗
            </a>
          </div>
        )}
        {error && <div className="alert danger small" style={{ marginTop: 12 }}>{error}</div>}
      </div>
    </div>
  );
}
