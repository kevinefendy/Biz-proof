"use client";
import { useState } from "react";
import Link from "next/link";
import { useApp } from "@/components/AppProvider";
import type { Role } from "@/lib/types";

export default function Login() {
  const { role, setRole } = useApp();
  const [email, setEmail] = useState("");
  return (
    <div style={{ maxWidth: 440 }}>
      <h1>Masuk</h1>
      <div className="card">
        <label className="small">Role</label>
        <div className="btn-row">
          {(["buyer", "supplier", "lender"] as Role[]).map((r) => (
            <button key={r} className={`btn sm ${role === r ? "primary" : ""}`} onClick={() => setRole(r)}>
              {r}
            </button>
          ))}
        </div>
        <label className="small">Email</label>
        <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@perusahaan.co.id" />
        <br /><br />
        <Link
          className="btn primary"
          href={role === "buyer" ? "/app/overview" : role === "supplier" ? "/supplier/invoices" : "/lender/verify"}
        >
          Masuk sebagai {role} (mock)
        </Link>
        <p className="muted small">Auth backend (Express + role + 2FA approver) belum di tahap frontend ini.</p>
        <p className="small">Belum punya akun? <Link className="link" href="/signup">Daftar</Link></p>
      </div>
    </div>
  );
}
