"use client";
import { useState } from "react";
import Link from "next/link";
import { useApp } from "@/components/AppProvider";
import { dict } from "@/lib/i18n";
import type { Role } from "@/lib/types";

export default function Login() {
  const { lang, role, setRole } = useApp();
  const t = dict[lang];
  const [email, setEmail] = useState("");
  const dest = role === "buyer" ? "/app/overview" : role === "supplier" ? "/supplier/invoices" : "/lender/verify";

  return (
    <div className="hw-auth">
      <span className="hw-kicker">{t.auth_kicker}</span>
      <h1>{t.auth_login}</h1>
      <div className="hw-auth-panel">
        <div className="hw-field">
          <label id="login-role-label">{t.auth_role}</label>
          <div className="hw-role-row" role="group" aria-labelledby="login-role-label">
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
          <label htmlFor="login-email">{t.auth_email}</label>
          <input
            id="login-email"
            className="hw-input"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@perusahaan.co.id"
          />
        </div>
        <Link className="hw-btn hw-btn-primary hw-btn-block" href={dest}>
          {t.auth_login_cta} {role} →
        </Link>
        <p className="hw-auth-swap">
          {t.auth_no_account}{" "}
          <Link className="hw-link" href="/signup">
            {t.auth_to_signup}
          </Link>
        </p>
      </div>
    </div>
  );
}
