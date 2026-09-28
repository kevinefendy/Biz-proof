"use client";
import { useState } from "react";
import { useApp } from "@/components/AppProvider";
import type { Role } from "@/lib/types";

export default function Signup() {
  const { role, setRole } = useApp();
  return (
    <div style={{ maxWidth: 440 }}>
      <h1>Daftar</h1>
      <div className="card">
        <div className="btn-row">
          {(["buyer", "supplier", "lender"] as Role[]).map((r) => (
            <button key={r} className={`btn sm ${role === r ? "primary" : ""}`} onClick={() => setRole(r)}>
              {r}
            </button>
          ))}
        </div>
        <input className="input" placeholder="Nama organisasi" /><br /><br />
        <input className="input" placeholder="Email bisnis" /><br /><br />
        <button className="btn primary">Buat akun (mock)</button>
      </div>
    </div>
  );
}
