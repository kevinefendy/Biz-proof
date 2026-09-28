# BizProof — Frontend (Next.js App Router)

Scope: **frontend saja** per PRD v3.0, di branch `Develop`.

## Jalankan

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # verifikasi produksi
```

## Sitemap terimplementasi (§8 PRD)

Publik: `/`, `/verify`, `/verify/[attestationId]`, `/passport/[supplierId]`, `/pricing`, `/docs`
Buyer: `/app/overview`, `/app/confirmations`, `/app/confirmations/[id]`, `/app/attestations`, `/app/suppliers`, `/app/members`, `/app/audit-log`, `/app/api-settings`, `/app/settings`
Supplier: `/supplier/invoices`, `/supplier/invoices/new`, `/supplier/passport`
Lender: `/lender/verify`, `/lender/financed`, `/lender/api`
Auth: `/login`, `/signup` (mock role buyer|supplier|lender)

## Komponen (§14): StatusBadge, AttestationCard, VerifyInputBox, ConfirmationReviewPanel, HashCompareBlock, PayeeMismatchAlert, PassportCard, RevocationBanner

- Hashing SHA-256 + salt di browser (`lib/hash.ts`, Web Crypto) — file tidak diunggah.
- i18n ID/EN + dark/light mode (`components/AppProvider.tsx`, `lib/i18n.ts`).
- Data mock (`lib/mock.ts`) menyerupai shape on-chain PRD §9 (uid, issuer, subjectId, schemaId, invoiceHash, payeeHash, status).
- Setiap hasil verifikasi ada link Arbiscan Sepolia.

Backend (Express+MySQL), kontrak Solidity, relayer gasless, indexer: **belum** — tahap berikutnya.
