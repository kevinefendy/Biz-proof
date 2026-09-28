"use client";
import { useApp } from "./AppProvider";
import { dict } from "@/lib/i18n";

export default function Footer() {
  const { lang } = useApp();
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div>
          <strong>◈ BizProof</strong>
          <div className="muted small">Verified business records. Portable trust.</div>
        </div>
        <div className="muted small">{dict[lang].footer_note}</div>
      </div>
    </footer>
  );
}
