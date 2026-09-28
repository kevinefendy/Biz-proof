export default function PayeeMismatchAlert({ show }: { show?: boolean }) {
  if (!show) return null;
  return (
    <div className="alert warn" role="alert">
      <strong>⚠ Payee account mismatch.</strong> Rekening tujuan pada dokumen tidak cocok dengan hash
      yang disetujui pembeli dalam attestation. Jangan transfer sebelum klarifikasi (pola kasus Palembang, Juli 2026).
    </div>
  );
}
