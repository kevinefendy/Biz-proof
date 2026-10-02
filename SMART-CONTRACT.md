# 📜 Panduan Smart Contract: BizProofRegistry di Arbitrum Sepolia

Smart Contract **`BizProofRegistry.sol`** adalah fondasi on-chain BizProof Protocol yang mengimplementasikan struktur EAS (*Ethereum Attestation Service*), **Payee Lock** (pencegah pengalihan rekening sales), dan **Anti Double-Financing Registry** untuk perbankan & institusi pembiayaan (*Supply Chain Financing*).

---

## 🏗️ Spesifikasi Kontrak

| Parameter | Keterangan |
|---|---|
| **File Kontrak** | `contracts/BizProofRegistry.sol` |
| **Solidity Version** | `^0.8.20` |
| **Jaringan Testnet** | Arbitrum Sepolia |
| **Chain ID** | `421614` (`0x66eee`) |
| **Currency** | Sepolia ETH |
| **RPC URL** | `https://sepolia-rollup.arbitrum.io/rpc` |
| **Block Explorer** | [https://sepolia.arbiscan.io](https://sepolia.arbiscan.io) |

---

## 🚀 Langkah Deploy Menggunakan Remix IDE (5 Menit)

### 1. Buka Remix IDE
1. Buka peramban ke **[https://remix.ethereum.org](https://remix.ethereum.org)**.
2. Di file explorer sebelah kiri (folder `contracts/`), buat file baru: `BizProofRegistry.sol`.
3. Salin dan tempelkan seluruh isi dari file lokal:
   ```
   contracts/BizProofRegistry.sol
   ```

### 2. Kompilasi Kontrak
1. Buka tab **Solidity Compiler** (ikon 'S' di bilah navigasi kiri).
2. Pilih compiler version: **`0.8.20`** (atau versi lebih baru `0.8.24`).
3. Pastikan **EVM Version** disetel ke `default` atau `cancun/shanghai`.
4. Klik **Compile BizProofRegistry.sol**. Pastikan muncul centang hijau ✓.

### 3. Deploy ke Arbitrum Sepolia
1. Buka tab **Deploy & Run Transactions** (ikon Ethereum dengan panah kanan).
2. Pada dropdown **ENVIRONMENT**, pilih **Injected Provider - MetaMask**.
   - Konfirmasi popup MetaMask Anda.
   - Pastikan jaringan di MetaMask adalah **Arbitrum Sepolia Testnet** (Chain ID: `421614`).
   - Pastikan Anda memiliki saldo Sepolia ETH untuk gas fee (klaim faucet jika belum ada).
3. Di dropdown **CONTRACT**, pastikan memilih **`BizProofRegistry - contracts/BizProofRegistry.sol`**.
4. Klik tombol oranye **Deploy**.
5. Konfirmasi transaksi pada popup MetaMask.
6. Tunggu beberapa detik hingga transaksi terkonfirmasi di block explorer.
7. Di bagian bawah (*Deployed Contracts*), salin **Contract Address (CA)** yang baru terbentuk (misal `0x...`).

---

## ⚙️ Menghubungkan Kontrak ke Frontend BizProof

1. Buka file `.env.local` di root proyek BizProof:
   ```bash
   NEXT_PUBLIC_BIZPROOF_REGISTRY_ADDRESS=0xAlamatContractHasilDeployAnda
   ```
2. Simpan file, lalu restart Next.js dev server:
   ```bash
   npm run dev
   ```
3. Buka browser di [http://localhost:3000](http://localhost:3000).
   - Tombol **Connect Wallet** di pojok kanan atas akan langsung mendeteksi dompet Anda.
   - Transaksi attest, revoke, dan mark financed akan langsung memanggil smart contract baru Anda di Arbitrum Sepolia!

---

## 🔍 Cara Verifikasi Source Code di Arbiscan Sepolia (Centang Hijau)

1. Buka **[https://sepolia.arbiscan.io](https://sepolia.arbiscan.io)**.
2. Masukkan alamat kontrak Anda di kolom pencarian.
3. Masuk ke tab **Contract**, lalu klik tombol **Verify and Publish**.
4. Isi formulir:
   - **Compiler Type**: `Solidity (Single file)`
   - **Compiler Version**: Pilih versi yang sama dengan saat kompilasi (misal `v0.8.20+commit...`)
   - **Open Source License Type**: `MIT License (MIT)`
5. Klik **Continue**.
6. Pada kotak kode sumber, tempelkan seluruh kode dari `contracts/BizProofRegistry.sol`.
7. **PENTING**: Pada kotak *Constructor Arguments*, kosongkan atau hapus semua teks (karena constructor tidak menerima argumen).
8. Selesaikan captcha lalu klik **Verify and Publish**.
9. Kontrak Anda sekarang berstatus **Verified** dengan centang hijau ✓!

---

## 🧪 Fungsi Utama Kontrak

### 1. `attest(subjectId, schemaId, invoiceHash, payeeHash, expiresAt)`
- Dipanggil oleh: **Buyer (Pembeli)**
- Menghasilkan: `bytes32 uid` (EAS-compatible hash)
- Memvalidasi: `invoiceHash` belum pernah aktif di kontrak (mencegah penipuan invoice ganda).
- Mengunci: `payeeHash` rekening tujuan bayar.

### 2. `revoke(uid, reasonHash)`
- Dipanggil oleh: **Penerbit Asli (Buyer)** atau Owner.
- Efek: Mengubah status menjadi `REVOKED`. Record historis tetap abadi dan tidak pernah terhapus dari blockchain.

### 3. `markFinanced(uid)`
- Dipanggil oleh: **Lender Terotorisasi (Bank / SCF Fintech)**.
- Efek: Mengubah status menjadi `FINANCED`. Melindungi bank dari risiko *double financing* (invoice dijaminkan ke 2 bank berbeda).

### 4. `isInvoiceActive(invoiceHash)` (View / Free Gas)
- Dapat dicek instan oleh publik tanpa biaya gas.
