"use client";
import Link from "next/link";
import { useApp } from "@/components/AppProvider";
import { dict } from "@/lib/i18n";
import type { Role } from "@/lib/types";

export default function Signup() {
  const { lang, role, setRole } = useApp();
  const t = dict[lang];

  return (
    <div className="hw-auth">
      <span className="hw-kicker">{t.auth_kicker}</span>
      <h1>{t.auth_signup}</h1>
      <div className="hw-auth-panel">
        <div className="hw-field">
          <label id="signup-role-label">{t.auth_role}</label>
          <div className="hw-role-row" role="group" aria-labelledby="signup-role-label">
            {(["buyer", "supplier", "lender"] as Role[]).map((r) => (
              <button
                key={r}
                type="button"
                className="hw-role"
                aria-pressed={role === r}
                onClick={() => setRole(r)}
              >
                {r}
              </button>
            ))}
          </div>
          <p className="hw-helper">{t.auth_role_d}</p>
        </div>
        <div className="hw-field">
          <label htmlFor="signup-org">{t.auth_org}</label>
          <input id="signup-org" className="hw-input" type="text" autoComplete="organization" placeholder="PT Contoh Sejahtera" />
        </div>
        <div className="hw-field">
          <label htmlFor="signup-email">{t.auth_email}</label>
          <input
            id="signup-email"
            className="hw-input"
            type="email"
            autoComplete="email"
            placeholder="nama@perusahaan.co.id"
          />
        </div>
        <button className="hw-btn hw-btn-primary hw-btn-block" type="button">
          {t.auth_signup_cta}
        </button>
        <p className="hw-auth-swap">
          {t.auth_have_account}{" "}
          <Link className="hw-link" href="/login">
            {t.auth_to_login}
          </Link>
        </p>
      </div>
    </div>
  );
}
