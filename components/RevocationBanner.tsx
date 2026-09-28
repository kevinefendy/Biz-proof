export default function RevocationBanner({ reason }: { reason?: string }) {
  if (!reason) return null;
  return (
    <div className="alert danger" role="alert">
      <strong>Revoked.</strong> {reason} Histori tetap tampil (tidak pernah dihapus).
    </div>
  );
}
