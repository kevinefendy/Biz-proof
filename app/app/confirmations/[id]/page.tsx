"use client";
import { use } from "react";
import { findAttestation } from "@/lib/mock";
import ConfirmationReviewPanel from "@/components/ConfirmationReviewPanel";

export default function ConfirmationDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const a = findAttestation(decodeURIComponent(id));
  if (!a) return <p className="muted">Not found.</p>;
  return (
    <div>
      <h1>Review + Confirm / Reject</h1>
      <ConfirmationReviewPanel a={a} />
    </div>
  );
}
