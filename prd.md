# PRD — BizProof
**Buyer-confirmed business records, verifiable by anyone.**

| | |
|---|---|
| **Versi** | 3.0 (menggantikan v2.0) |
| **Tanggal** | 28 September 2026 |
| **Chain** | Arbitrum (Sepolia untuk MVP, Arbitrum One untuk produksi) |
| **Frontend** | Next.js (App Router) |
| **Backend** | Express.js + MySQL |
| **Web3** | Solidity, viem / ethers.js |

**Perubahan utama dari v2.0:** produk sekarang dimulai dari satu *wedge* yang tajam (konfirmasi invoice oleh pembeli), bukan platform luas. Ditambah studi kasus nyata, batasan produk yang jujur, target pelanggan pertama, dan fitur baru (proteksi rekening tujuan bayar dan pencegah double financing).

---

## 1. One-liner

> BizProof memungkinkan pembeli mengonfirmasi invoice dan pengiriman dari supplier-nya dalam satu klik, dan hasilnya bisa dicek siapa pun (bank, auditor, calon mitra) tanpa harus menghubungi pembeli lagi.

Tagline: **Verified business records. Portable trust.**

## 2. Referensi Konsep

| Referensi | Yang diambil |
|---|---|
| **EAS (attest.org)** | Struktur attestation: UID, schema, issuer, subject, decoded data, transaction |
| **ChainAnchor** | Hashing dokumen (SHA-256), lifecycle expiry/revocation, verifikasi independen tanpa bergantung server penerbit, pricing bertingkat + API/webhook |

## 3. Masalah (dengan bukti nyata)

Dokumen bisnis (invoice, PO, tanda terima barang) dipercaya karena "kelihatan lengkap", sementara cara mengecek keasliannya masih manual dan telat.

### Kasus A — Invoice fiktif oleh sales, Palembang (Juli 2026)
Seorang sales PT Karyawaha Ekamulya ditangkap Polrestabes Palembang pada 17 Juli 2026. Kecurigaan muncul saat perusahaan menagih pelanggan (PT Sumber Diri Sembilan) yang mengaku hanya memesan sebagian barang dan sudah membayar ke rekening pribadi si sales. Setelah perusahaan mengecek pelanggan lain (termasuk CV Lautan Atlantik), sebagian besar transaksi di dokumen penjualan ternyata tidak pernah terjadi.
- **Akar masalah:** keaslian invoice baru diketahui setelah dicek manual ke pelanggan, dan itu terjadi setelah dana hilang.
- **Cara BizProof membantu:** invoice baru dianggap sah setelah pembeli mengonfirmasi (barang diterima, jumlah benar, rekening tujuan benar). Invoice tanpa konfirmasi langsung terlihat berstatus *pending/unconfirmed*.
- Sumber: sumsel.akurat.co, 17 Juli 2026.

### Kasus B — Supply Chain Financing di bank (Maybank, BTN, dan lembaga penjamin)
Supplier UMKM sering dibayar 30 sampai 120 hari setelah barang diterima, sehingga mereka mengajukan pembiayaan berbasis invoice ke bank. Bank seperti Maybank Indonesia (bekerja sama dengan perusahaan inti/principal) dan BTN menyediakan program SCF. Alurnya selalu bergantung pada langkah "tagihan disetujui/dikonfirmasi pembeli" sebelum dana cair.
- **Akar masalah:** konfirmasi itu dilakukan lewat proses manual atau sistem tertutup per bank, sehingga lambat dan sulit diverifikasi silang antar lembaga.
- **Cara BizProof membantu:** konfirmasi pembeli menjadi attestation yang bisa dicek bank mana pun; hash invoice yang sama tidak bisa dibiayai dua kali (lihat §7.4).
- Sumber: Askrindo Syariah (12 Agustus 2026), Maybank Indonesia, BTN.

### Kasus C — Invoice fiktif dalam perkara korupsi (batasan produk)
KPK menyebut invoice fiktif menjadi sumber aliran dana PT Karabha Digdaya dalam perkara suap PN Depok (Februari 2026, status masih dugaan/proses hukum berjalan) dan menyebut modus ini sering muncul di kasus korupsi lain.
- **Pelajaran:** jika **kedua pihak sengaja berbohong**, konfirmasi pembeli tidak menyelamatkan apa-apa. Lihat §12 (Batasan & Risiko).
- Sumber: Liputan6, 7 Februari 2026.

## 4. Solusi

```
Supplier submit invoice (hash)  →  Pembeli terima permintaan konfirmasi
        →  Pembeli konfirmasi / tolak  →  Attestation di Arbitrum
        →  Bank / auditor / mitra verifikasi lewat link publik
```

Yang publik hanya: ID attestation, penerbit (pembeli), subjek (supplier), jenis klaim, status, timestamp, dan hash. **Isi invoice (nominal, item) tetap private** di sistem masing-masing pihak.

## 5. Goals & Non-Goals

**Goals**
1. Pembeli bisa mengonfirmasi/menolak invoice dan pengiriman dari supplier-nya dengan cepat.
2. Pihak ketiga (bank, auditor, calon mitra) bisa memverifikasi konfirmasi itu **tanpa login dan tanpa menghubungi pembeli**.
3. Mencegah **double financing** (invoice yang sama dijaminkan ke dua lembaga).
4. Mengunci **rekening tujuan pembayaran** ke dalam attestation agar pengalihan ke rekening pribadi terdeteksi.
5. Lifecycle jelas: confirmed, revoked, expired, tidak pernah dihapus.

**Non-Goals**
- Bukan credit scoring dan bukan penentu kelayakan kredit.
- Bukan sistem pembayaran, escrow, atau lending.
- Tidak menyimpan dokumen mentah di on-chain.
- Bukan pengganti e-Faktur/sistem pajak resmi.
- Tidak menyelesaikan kasus kolusi (lihat §12).

## 6. Persona

| Persona | Peran | Kebutuhan |
|---|---|---|
| **Buyer / Attester** (perusahaan yang menerima barang) | Pemberi konfirmasi | Alur konfirmasi cepat, integrasi ke sistem procurement/ERP, kontrol siapa yang berwenang menyetujui |
| **Supplier** | Subjek | Punya bukti konfirmasi yang bisa dibawa ke bank atau calon klien baru |
| **Lender** (bank, fintech, penjamin) | Verifier + pembayar API | Cek konfirmasi invoice otomatis, deteksi double financing, webhook status |
| **Auditor / Compliance** | Verifier | Jejak audit yang tidak bisa diubah sepihak |
| **Calon mitra baru** | Verifier | Cek reputasi supplier lewat Supplier Passport |

## 7. Fitur Inti

### 7.1 Invoice Confirmation Flow (WEDGE — fokus MVP)
State machine:
```
DRAFT → PENDING_CONFIRMATION → CONFIRMED → (FINANCED) → SETTLED
                    ↓               ↓
                 REJECTED         REVOKED / EXPIRED
```
- Supplier upload invoice → hash dihitung di browser → kirim ke BizProof (file tidak diunggah publik).
- Pembeli menerima notifikasi (email + dashboard), meninjau data yang dikirim supplier, lalu **Confirm** atau **Reject** (dengan alasan).
- Saat Confirm, pembeli menandatangani transaksi (atau lewat relayer untuk mode gasless) → attestation tercatat di Arbitrum.
- Invoice yang tidak dikonfirmasi tetap terlihat sebagai `PENDING`, sehingga pihak lain tahu invoice itu belum diakui pembeli.

### 7.2 Proteksi Rekening Tujuan Bayar (Payee Lock)
- Attestation menyimpan **hash rekening tujuan** yang disetujui pembeli.
- Jika supplier atau pihak lain mengubah rekening di invoice berikutnya, hash tidak cocok dan sistem menampilkan peringatan **"Payee account mismatch"**.
- Ditujukan untuk pola penipuan di mana pembayaran dialihkan ke rekening pribadi (seperti kasus Palembang).

### 7.3 Verification Page Publik (`/verify`)
Tanpa login. Input: Attestation ID atau upload ulang invoice (dihash di browser dan dicocokkan).
Status: `VALID`, `PENDING`, `REJECTED`, `REVOKED`, `EXPIRED`, `NOT FOUND`, plus `HASH MISMATCH` jika dokumen berubah.
Setiap hasil menyertakan tautan **"Lihat transaksi di Arbiscan"** supaya bisa dicek independen.

### 7.4 Anti Double-Financing Registry
- Satu `invoiceHash` hanya boleh punya **satu attestation aktif**.
- Lender bisa menandai attestation sebagai `FINANCED` (lewat API) sehingga lender lain melihat invoice itu sudah dijaminkan.
- Catatan: ini hanya efektif kalau lender ikut menulis status. Adopsi lender adalah kunci (lihat §11).

### 7.5 Supplier Passport (fase lanjutan)
Halaman publik ringkasan record terverifikasi supplier: jumlah konfirmasi aktif, jumlah counterparty, rentang waktu. **Bukan skor kredit**, dan copy UI harus menyatakan itu eksplisit.

### 7.6 Buyer Dashboard
Overview (pending confirmation, confirmed bulan ini, direvoke), daftar supplier, daftar attestation, manajemen anggota dan wewenang approver (misal nominal di atas ambang tertentu wajib dua approver), audit log.

### 7.7 Lender Portal & API
Dashboard verifikasi massal, API `GET /v1/attestations/:id`, webhook `attestation.confirmed|revoked|financed`, cek duplikasi invoice.

### 7.8 Revocation
Attestation tidak pernah dihapus. Status berubah `CONFIRMED → REVOKED` beserta alasan dan waktu. Histori tetap tampil di Passport dengan badge *Revoked*.

## 8. Sitemap (Next.js App Router)

```
/                          Landing (narasi kasus nyata + demo verify)
/verify                    Verifikasi publik
/verify/[attestationId]    Hasil verifikasi (shareable)
/passport/[supplierId]     Supplier Passport publik
/pricing
/docs                      API & schema

/app  (Buyer)
  /app/overview
  /app/confirmations        Antrean konfirmasi (PENDING)
  /app/confirmations/[id]   Review + Confirm / Reject
  /app/attestations         Semua attestation + Revoke
  /app/suppliers            Daftar supplier
  /app/members              Approver & role
  /app/audit-log
  /app/api-settings
  /app/settings

/supplier
  /supplier/invoices        Submit invoice (hash di browser)
  /supplier/invoices/new
  /supplier/passport

/lender
  /lender/verify            Cek massal
  /lender/financed          Invoice yang ditandai FINANCED
  /lender/api

/login  /signup             Role: buyer | supplier | lender
```

## 9. Data Model

**On-chain (Solidity, Arbitrum)**
```solidity
enum Status { Confirmed, Revoked, Financed, Settled }

struct Attestation {
  bytes32 uid;
  address issuer;        // pembeli
  bytes32 subjectId;     // hash identitas supplier (bukan wajib wallet)
  bytes32 schemaId;      // mis. INVOICE_CONFIRMED, DELIVERY_CONFIRMED
  bytes32 invoiceHash;   // salted hash dokumen/data invoice
  bytes32 payeeHash;     // salted hash rekening tujuan
  uint64  issuedAt;
  uint64  expiresAt;     // 0 = tidak kedaluwarsa
  Status  status;
}
// fungsi: attest(), revoke(uid, reasonHash), markFinanced(uid) [role lender], getAttestation(uid)
// aturan: invoiceHash unik untuk attestation aktif
```

**Off-chain (MySQL)**
```
organizations(id, name, type[buyer|supplier|lender], wallet, verified_status, plan)
users(id, org_id, role, email, ...)
invoices(id, supplier_org_id, buyer_org_id, ref_no, status, payload_encrypted, submitted_at)
confirmations(id, invoice_id, decided_by, decision, reason, decided_at)
attestations(id, onchain_uid, invoice_id, tx_hash, status, issued_at, revoked_at, revoke_reason)
schemas(id, name, fields_json, revocable)
api_keys(id, org_id, key_hash, created_at)
webhooks(id, org_id, url, events, secret)
audit_log(id, org_id, actor_id, action, target, at)
```

**Prinsip privasi**
- Yang di-hash **wajib pakai salt acak per record**. Nominal invoice dan nomor rekening berentropi rendah, sehingga hash tanpa salt bisa ditebak lewat brute force.
- Salt dan data mentah disimpan terenkripsi off-chain dan hanya dibuka ke pihak yang berhak (misal ke lender saat pengajuan pembiayaan).
- Pertimbangkan implikasi UU Pelindungan Data Pribadi (data yang berkaitan dengan individu, mis. rekening pribadi). Konsultasikan ke penasihat hukum sebelum produksi.

## 10. Arsitektur Teknis

```
Next.js (Server Components + ISR untuk halaman publik, client + SWR untuk dashboard)
   │  REST/JSON
Express.js  ── MySQL
   │   ├─ Auth & role (buyer/supplier/lender), approver policy
   │   ├─ Invoice/confirmation orchestration
   │   ├─ Relayer (gasless attest/revoke) 
   │   └─ Webhook dispatcher, notification (email)
   │
viem / ethers.js  →  Attestation Registry (Solidity)  →  Arbitrum Sepolia → Arbitrum One
```
- **Hashing:** SHA-256 via Web Crypto di browser; backend memverifikasi ulang saat menerima file untuk proses integrity check.
- **Gasless:** relayer di backend menanggung gas agar pembeli non-teknis tidak perlu memegang ETH. Sediakan rate limit dan anggaran gas per organisasi.
- **Indexer:** service ringan (event listener) yang menyinkronkan event kontrak ke MySQL, supaya halaman explorer/verify cepat.
- **Keamanan:** role-based access, 2FA untuk approver, audit log, kunci relayer di secret manager, audit smart contract sebelum mainnet.
- **Testing:** Foundry/Hardhat (kontrak), Jest/Supertest (API), Playwright (flow konfirmasi dan verifikasi publik).

## 11. Go-to-Market & Pelanggan Pertama

Masalah ayam-dan-telur (pembeli tidak mau repot, supplier tidak punya bukti) adalah risiko terbesar. Rencana:

1. **Target awal: lender/bank dengan program SCF** (mis. bank yang sudah punya program supply chain financing) dan **pembeli besar yang jadi anchor-nya**. Alasan: lender punya insentif nyata (mengurangi verifikasi manual dan risiko invoice fiktif) dan bisa mewajibkan konfirmasi ke ekosistem supplier-nya.
2. **Pilot kecil:** 1 lender + 1 anchor buyer + 10 sampai 20 supplier, di testnet lalu produksi terbatas.
3. **Bukti nilai yang diukur:** waktu verifikasi invoice (dari hari menjadi menit), jumlah invoice tanpa konfirmasi yang terdeteksi, jumlah upaya double financing yang tercegah.
4. **Tidak** menyasar konsumen individu atau UMKM langsung di tahap awal.

## 12. Batasan & Risiko (jujur)

| Risiko | Penjelasan | Mitigasi |
|---|---|---|
| **Kolusi** | Jika pembeli dan supplier sama-sama berbohong (mis. kasus invoice fiktif di perkara korupsi), attestation tetap "valid" | Positioning: BizProof membuktikan *siapa yang mengonfirmasi*, bukan kebenaran transaksi. Tambahkan approver berlapis, audit log, dan (fase lanjut) pencocokan dengan bukti pembayaran/pengiriman |
| **Kepercayaan pada issuer** | Cap hanya sebaik pihak yang mengecap | Verified-issuer badge (verifikasi domain/KYB), reputasi issuer |
| **Blockchain belum tentu perlu** | Database + tanda tangan digital bisa melakukan sebagian besar fungsi ini | Nilai jual blockchain: verifikasi **tidak bergantung pada BizProof**. Jika BizProof tutup, attestation tetap bisa dicek. Harus dikomunikasikan sebagai manfaat konkret, bukan jargon |
| **Kompetitor / sistem existing** | e-Faktur, ERP, dan platform SCF bank sudah mencakup sebagian alur | Posisikan sebagai lapisan **lintas-institusi** yang netral, bukan pengganti ERP; sediakan integrasi |
| **Cold start** | Butuh pembeli dan lender aktif | Strategi GTM §11 |
| **Privasi/regulasi** | Data bisnis dan pribadi, potensi isu hukum dokumen elektronik | Hash bersalt, tidak ada data mentah on-chain, konsultasi hukum |
| **Gas & operasional** | Biaya relayer, kunci relayer | Anggaran per organisasi, secret manager, monitoring |

## 13. Model Bisnis

Verifikasi publik **selalu gratis** (agar dipercaya dan tersebar). Yang membayar adalah pihak yang mendapat nilai operasional.

| Tier | Untuk | Fitur | Bayar? |
|---|---|---|---|
| **Free** | Supplier, verifier | Submit invoice, Supplier Passport dasar, verifikasi publik | Gratis |
| **Business** | Pembeli menengah | Konfirmasi tanpa batas wajar, revoke, dashboard, approver policy | Langganan |
| **Enterprise (Buyer)** | Pembeli besar | Integrasi ERP/procurement (API), SSO, audit log, multi-entity, gasless | Langganan tahunan |
| **Lender** | Bank, fintech, penjamin | API + webhook, verifikasi massal, registry FINANCED, SLA | Langganan + biaya per verifikasi massal |

## 14. Desain & UX

- **Nada:** kredibel dan tenang (enterprise trust), dengan detail teknikal ala EAS di halaman attestation.
- **Status:** hijau `VALID`, kuning `PENDING`, merah/oranye `REVOKED/REJECTED`, abu `EXPIRED`. Selalu ikon + teks, tidak hanya warna.
- **Komponen kunci:** `VerifyInputBox`, `AttestationCard`, `StatusBadge`, `ConfirmationReviewPanel` (data invoice vs yang disubmit supplier, tombol Confirm/Reject), `HashCompareBlock`, `PayeeMismatchAlert`, `PassportCard`, `RevocationBanner`.
- **Microcopy:** hindari istilah "credit score". Gunakan "verified records" dan "confirmed by buyer".
- **i18n:** Indonesia dan Inggris. Mode gelap/terang.
- **Landing page:** buka dengan skenario nyata (invoice fiktif yang baru ketahuan setelah dicek manual), lalu demo `/verify` langsung di hero.

## 15. Metrik Sukses

- Waktu rata-rata dari submit invoice sampai konfirmasi pembeli.
- % invoice yang terkonfirmasi dalam 48 jam.
- Jumlah verifikasi publik per bulan (adopsi di luar platform).
- Jumlah upaya double financing / payee mismatch yang terdeteksi.
- Jumlah lender dan pembeli aktif; konversi Free → berbayar.
- Rasio revocation (indikator kualitas).

## 16. Roadmap

| Fase | Cakupan |
|---|---|
| **MVP (Sepolia)** | Kontrak `attest/revoke/getAttestation` + unik invoiceHash; alur Supplier submit → Buyer confirm/reject; Verification Page publik; hashing di browser dengan salt |
| **V1** | Payee Lock, Buyer Dashboard + approver policy + audit log, notifikasi email, gasless relayer, Arbitrum One |
| **V2** | Lender Portal + API + webhook + registry FINANCED, indexer, pricing/billing |
| **V3** | Supplier Passport, Attestation Explorer, integrasi ERP, schema fleksibel (delivery, PO, kontrak), pencocokan bukti pembayaran |

## 17. Open Questions

1. Siapa lender atau anchor buyer yang bisa dijadikan pilot pertama, dan apa insentif konkret mereka untuk ikut?
2. Supplier tanpa wallet: custodial wallet terkelola BizProof atau identitas berbasis hash dulu?
3. Siapa menanggung gas: disubsidi platform, dibebankan ke pembeli, atau dimasukkan ke biaya langganan?
4. Verifikasi identitas organisasi (KYB): pakai apa (dokumen legal, verifikasi domain email, integrasi AHU/OSS)?
5. Apakah dokumen asli perlu disimpan terenkripsi di BizProof untuk keperluan sengketa, atau tanggung jawab tiap pihak?
6. Bagaimana status hukum attestation di Indonesia sebagai alat bukti (perlu masukan ahli hukum sebelum diklaim ke pelanggan)?

---

### Lampiran — Sumber studi kasus
- Kasus Palembang: sumsel.akurat.co, "Diduga Gelapkan Uang Perusahaan Lewat Invoice Fiktif, Seorang Sales di Palembang Ditangkap Polisi" (17 Juli 2026).
- SCF: Askrindo Syariah, "Penjaminan Syariah Series: Supply Chain Financing Memperkuat Rantai Pasok" (12 Agustus 2026); halaman program SCF Maybank Indonesia dan BTN.
- Kasus KPK: Liputan6, "Jejak Invoice Fiktif dalam Kasus Suap Ketua dan Wakil Ketua PN Depok" (7 Februari 2026).
- Catatan: BizProof belum digunakan oleh perusahaan mana pun di atas. Kasus-kasus tersebut dipakai untuk menggambarkan masalah yang ingin diselesaikan.