"use client";
import { useApp } from "@/components/AppProvider";
import { dict } from "@/lib/i18n";
import VerifyInputBox from "@/components/VerifyInputBox";

export default function VerifyPage() {
  const { lang } = useApp();
  const t = dict[lang];
  return (
    <div>
      <h1>{t.verify_title}</h1>
      <p className="muted">{t.verify_sub}</p>
      <VerifyInputBox />
      <div className="card">
        <h3>Status yang mungkin muncul</h3>
        <ul className="small">
          <li>VALID — attestation aktif & hash cocok</li>
          <li>PENDING — invoice belum dikonfirmasi pembeli</li>
          <li>REJECTED / REVOKED / EXPIRED / NOT FOUND</li>
          <li>HASH MISMATCH — dokumen berubah setelah dikonfirmasi</li>
        </ul>
        <p className="muted small">Setiap hasil menyertakan tautan “Lihat transaksi di Arbiscan” (PRD §7.3).</p>
      </div>
    </div>
  );
}
