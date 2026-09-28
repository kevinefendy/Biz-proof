"use client";
import Link from "next/link";
import { useApp } from "@/components/AppProvider";
import { dict } from "@/lib/i18n";
import VerifyInputBox from "@/components/VerifyInputBox";
import AttestationCard from "@/components/AttestationCard";
import { mockAttestations } from "@/lib/mock";

export default function Home() {
  const { lang } = useApp();
  const t = dict[lang];
  return (
    <div className="hero">
      <div>
        <span className="pill">{t.hero_badge}</span>
        <h1>{t.hero_title}</h1>
        <p className="lead">{t.hero_sub}</p>
        <div className="btn-row">
          <Link href="/verify" className="btn primary">
            {t.hero_cta_verify}
          </Link>
          <Link href="/supplier/invoices/new" className="btn">
            {t.hero_cta_submit}
          </Link>
        </div>
      </div>

      <VerifyInputBox />

      <section>
        <h2>{t.how_title}</h2>
        <div className="grid3">
          <div className="card">
            <strong>1. {t.how_1_t}</strong>
            <p className="muted small">{t.how_1_d}</p>
          </div>
          <div className="card">
            <strong>2. {t.how_2_t}</strong>
            <p className="muted small">{t.how_2_d}</p>
          </div>
          <div className="card">
            <strong>3. {t.how_3_t}</strong>
            <p className="muted small">{t.how_3_d}</p>
          </div>
        </div>
      </section>

      <section>
        <h2>Contoh attestation terbaru</h2>
        <div className="grid2">
          {mockAttestations.slice(0, 4).map((a) => (
            <AttestationCard key={a.uid} a={a} href={`/verify/${encodeURIComponent(a.uid)}`} />
          ))}
        </div>
      </section>

      <div className="alert info small">{t.honesty}</div>
    </div>
  );
}
