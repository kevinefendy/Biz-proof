# BizProof Backend (Express + MySQL + Solidity)

Backend per PRD v3.0 §9–§10. Smart contract Solidity adalah source of truth;
backend bertugas orkestrasi off-chain + relayer gasless + indexer mirror.

## Struktur

```
backend/
  contracts/BizProofRegistry.sol  ← salinan compile (canonical: <repo>/contracts/)
  db/schema.sql                   ← skema MySQL off-chain (PRD §9)
  scripts/deploy.ts               ← deploy ke Arbitrum Sepolia
  test/BizProofRegistry.test.ts   ← test attest / revoke / finance
  src/
    index.ts        Express app + /health + /v1/* + webhook registry
    config.ts       env (RPC, registry address, relayer key, API keys)
    routes/         invoices | confirmations | attestations | suppliers
    services/
      contract.ts   read (RPC) + write via relayer (attest/revoke/finance)
      indexer.ts    listener event Attested/Revoked/Financed/Settled
      store.ts      mirror in-memory (ganti mysql2 saat DB siap)
    middleware/auth.ts  X-API-Key untuk endpoint lender
```

## Jalankan (tanpa Docker — mode mirror)

```bash
cd backend
cp .env.example .env        # jalan default tanpa relayer (mode client-sign)
npm install
npm run typecheck
npx hardhat compile         # kompilasi Solidity 0.8.20
npm run dev                 # http://localhost:4000/health
```

## Jalankan (dengan MySQL)

```bash
docker compose up -d        # mysql:3306 + import db/schema.sql otomatis
# isi DATABASE_URL di .env, lalu npm run dev
```

## Deploy kontrak ke Arbitrum Sepolia

```bash
# isi DEPLOYER_PRIVATE_KEY + ARBITRUM_SEPOLIA_RPC di .env, lalu:
npx hardhat run scripts/deploy.ts --network arbitrumSepolia
# output address → set ke:
#   backend/.env → BIZPROOF_REGISTRY_ADDRESS=
#   frontend .env.local → NEXT_PUBLIC_BIZPROOF_REGISTRY_ADDRESS=
```

Atau via Remix (tanpa Hardhat): lihat `SMART-CONTRACT.md` di root.

## API (ringkas)

```
GET  /health
POST /v1/invoices                       supplier submit hash (cek duplikat invoiceHash)
GET  /v1/invoices /v1/invoices/:id
POST /v1/confirmations/:invoiceId/confirm  → relayer attest / client-sign params
POST /v1/confirmations/:invoiceId/reject   { reason }
GET  /v1/attestations/check/by-invoice?invoiceHash=0x…   (anti double-financing)
GET  /v1/attestations/:uid              on-chain + mirror
POST /v1/attestations/:uid/revoke       { reason }
POST /v1/attestations/:uid/finance      (header X-API-Key lender)
GET  /v1/suppliers/:id/passport
GET  /v1/audit
POST /v1/webhooks  { url, events }
```

Alur gasless (PRD §10): buyer confirm tanpa ETH — backend `attestViaRelayer()`
menanggung gas (rate-limit + anggaran per org di produksi). Tanpa
`RELAYER_PRIVATE_KEY`, endpoint confirm mengembalikan `mode: client-sign`
agar frontend sign via MetaMask.

## Catatan Windows

`npx hardhat test` butuh native EDR yang kadang tidak cocok dengan Node 24
(`ERR_DLOPEN_FAILED: edr.win32-x64-msvc.node is not a valid Win32 application`).
Itu masalah environment, bukan kontrak — `npx hardhat compile` tetap validasi
Solidity. Solusi: pakai Node 20 LTS untuk test, atau jalankan test di CI Linux.
