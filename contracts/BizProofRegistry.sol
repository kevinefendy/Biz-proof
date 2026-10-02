// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title BizProofRegistry
 * @author BizProof Protocol (https://bizproof.network)
 * @notice Arbitrum Sepolia Attestation Registry for Buyer-Confirmed Business Invoices.
 * @dev Implements EAS-like schema attestation, Payee Lock protection, and Anti Double-Financing registry.
 * PRD v3.0 Specification:
 * - Wedge: Buyer confirms invoice & shipment hash in one click.
 * - Payee Lock: Enforces salted payee bank account hash to prevent bank account hijacking / rogue sales diversion.
 * - Anti Double-Financing: Ensures one active attestation per unique invoiceHash across all lenders.
 */
contract BizProofRegistry {
    // --- Data Types ---

    enum Status {
        None,       // 0: Belum ada / Not Found
        Confirmed,  // 1: Dikonfirmasi pembeli (Valid)
        Revoked,    // 2: Dibatalkan oleh penerbit / owner
        Financed,   // 3: Telah dijaminkan / didanai oleh lembaga keuangan (SCF)
        Settled     // 4: Tagihan telah lunas dibayar
    }

    struct Attestation {
        bytes32 uid;              // Unique Identifier (EAS-compatible hash)
        address issuer;           // Alamat wallet pembeli (buyer org)
        bytes32 subjectId;        // Identifier supplier (hash nama/NPWP/ID)
        bytes32 schemaId;         // Schema identitas: keccak256("INVOICE_CONFIRMED")
        bytes32 invoiceHash;      // Salted SHA-256 dokumen invoice
        bytes32 payeeHash;        // Salted hash rekening tujuan bayar
        uint64 issuedAt;          // Unix timestamp saat diterbitkan
        uint64 expiresAt;         // Unix timestamp batas waktu (0 = tanpa batas)
        Status status;            // Status terkini attestation
        bytes32 revokeReasonHash; // Hash alasan pembatalan jika direvoke
    }

    // --- State Variables ---

    address public owner;
    uint256 public totalAttestations;

    // Schema ID bawaan protokol BizProof
    bytes32 public constant SCHEMA_INVOICE_CONFIRMED = keccak256("INVOICE_CONFIRMED_V1");
    bytes32 public constant SCHEMA_DELIVERY_CONFIRMED = keccak256("DELIVERY_CONFIRMED_V1");

    // Mapping UID => Struct Attestation
    mapping(bytes32 => Attestation) private _attestations;

    // Anti Double-Financing: invoiceHash => UID aktif
    mapping(bytes32 => bytes32) private _activeInvoiceToUid;

    // Role-based access untuk Lender resmi (Bank, Fintech, Asuransi SCF)
    mapping(address => bool) public isAuthorizedLender;

    // --- Events ---

    event Attested(
        bytes32 indexed uid,
        address indexed issuer,
        bytes32 indexed subjectId,
        bytes32 schemaId,
        bytes32 invoiceHash,
        bytes32 payeeHash,
        uint64 issuedAt,
        uint64 expiresAt
    );

    event Revoked(
        bytes32 indexed uid,
        address indexed revoker,
        bytes32 reasonHash,
        uint64 revokedAt
    );

    event Financed(
        bytes32 indexed uid,
        address indexed lender,
        uint64 financedAt
    );

    event Settled(
        bytes32 indexed uid,
        address indexed actor,
        uint64 settledAt
    );

    event LenderAuthorized(address indexed lender, bool authorized);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    // --- Custom Errors (Gas-Optimized) ---

    error NotOwner();
    error NotAuthorized();
    error InvoiceAlreadyAttested(bytes32 existingUid);
    error AttestationNotFound();
    error InvalidStatusTransition();
    error AttestationAlreadyExpired();
    error InvalidZeroAddress();
    error InvalidZeroHash();

    // --- Modifiers ---

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    modifier onlyIssuerOrOwner(bytes32 uid) {
        address issuer = _attestations[uid].issuer;
        if (msg.sender != issuer && msg.sender != owner) revert NotAuthorized();
        _;
    }

    modifier onlyLenderOrOwner() {
        if (!isAuthorizedLender[msg.sender] && msg.sender != owner) revert NotAuthorized();
        _;
    }

    // --- Constructor ---

    constructor() {
        owner = msg.sender;
        emit OwnershipTransferred(address(0), msg.sender);
    }

    // --- Core Functions ---

    /**
     * @notice Membuat attestation baru oleh Pembeli (Buyer) untuk mengonfirmasi invoice supplier.
     * @dev Memvalidasi bahwa invoiceHash belum terikat pada attestation aktif lainnya (Anti Double-Financing).
     * @param subjectId Hash identitas supplier (bisa berupa hash nama PT/NPWP/ID internal).
     * @param schemaId Schema yang digunakan (misal SCHEMA_INVOICE_CONFIRMED).
     * @param invoiceHash Salted SHA-256 hash dokumen invoice yang dihitung di browser.
     * @param payeeHash Salted hash rekening bank tujuan pembayaran (Payee Lock).
     * @param expiresAt Waktu kedaluwarsa (0 jika tidak ada).
     * @return uid Unique identifier attestation yang baru dibuat.
     */
    function attest(
        bytes32 subjectId,
        bytes32 schemaId,
        bytes32 invoiceHash,
        bytes32 payeeHash,
        uint64 expiresAt
    ) external returns (bytes32 uid) {
        if (invoiceHash == bytes32(0)) revert InvalidZeroHash();
        if (payeeHash == bytes32(0)) revert InvalidZeroHash();

        // 1. Cek Anti Double-Financing / Duplicate Active Check
        bytes32 existingUid = _activeInvoiceToUid[invoiceHash];
        if (existingUid != bytes32(0)) {
            revert InvoiceAlreadyAttested(existingUid);
        }

        // 2. Generate EAS-style UID yang unik
        uid = keccak256(
            abi.encodePacked(
                msg.sender,
                subjectId,
                schemaId,
                invoiceHash,
                block.timestamp,
                totalAttestations
            )
        );

        uint64 nowSec = uint64(block.timestamp);

        // 3. Simpan Attestation
        _attestations[uid] = Attestation({
            uid: uid,
            issuer: msg.sender,
            subjectId: subjectId,
            schemaId: schemaId == bytes32(0) ? SCHEMA_INVOICE_CONFIRMED : schemaId,
            invoiceHash: invoiceHash,
            payeeHash: payeeHash,
            issuedAt: nowSec,
            expiresAt: expiresAt,
            status: Status.Confirmed,
            revokeReasonHash: bytes32(0)
        });

        // 4. Kunci invoiceHash ke UID ini
        _activeInvoiceToUid[invoiceHash] = uid;
        totalAttestations += 1;

        emit Attested(
            uid,
            msg.sender,
            subjectId,
            _attestations[uid].schemaId,
            invoiceHash,
            payeeHash,
            nowSec,
            expiresAt
        );
    }

    /**
     * @notice Membatalkan attestation (Revoke) jika ditemukan kesalahan data atau sengketa transaksi.
     * @dev Hanya bisa dipanggil oleh penerbit asli (Pembeli) atau Admin Protokol.
     *      Status attestation tidak pernah dihapus, melainkan ditandai REVOKED (Immutable Audit Trail).
     * @param uid Identifier attestation yang akan dibatalkan.
     * @param reasonHash Salted hash keterangan alasan pembatalan.
     */
    function revoke(bytes32 uid, bytes32 reasonHash) external onlyIssuerOrOwner(uid) {
        Attestation storage att = _attestations[uid];
        if (att.status == Status.None) revert AttestationNotFound();
        if (att.status == Status.Revoked || att.status == Status.Settled) {
            revert InvalidStatusTransition();
        }

        att.status = Status.Revoked;
        att.revokeReasonHash = reasonHash;

        // Lepaskan lock active invoice agar tidak menghalangi jika pembeli menerbitkan invoice revisi
        if (_activeInvoiceToUid[att.invoiceHash] == uid) {
            delete _activeInvoiceToUid[att.invoiceHash];
        }

        emit Revoked(uid, msg.sender, reasonHash, uint64(block.timestamp));
    }

    /**
     * @notice Menandai attestation sebagai FINANCED saat lender/bank mencairkan pembiayaan supply chain.
     * @dev Mencegah lender lain membiayai invoice yang sama (Anti Double-Financing).
     * @param uid Identifier attestation yang dibiayai.
     */
    function markFinanced(bytes32 uid) external onlyLenderOrOwner {
        Attestation storage att = _attestations[uid];
        if (att.status == Status.None) revert AttestationNotFound();
        if (att.status != Status.Confirmed) revert InvalidStatusTransition();

        // Cek kedaluwarsa
        if (att.expiresAt > 0 && block.timestamp > att.expiresAt) {
            revert AttestationAlreadyExpired();
        }

        att.status = Status.Financed;

        emit Financed(uid, msg.sender, uint64(block.timestamp));
    }

    /**
     * @notice Menandai attestation sebagai SETTLED saat pembayaran tagihan telah lunas.
     * @param uid Identifier attestation.
     */
    function markSettled(bytes32 uid) external {
        Attestation storage att = _attestations[uid];
        if (att.status == Status.None) revert AttestationNotFound();
        if (msg.sender != att.issuer && !isAuthorizedLender[msg.sender] && msg.sender != owner) {
            revert NotAuthorized();
        }
        if (att.status != Status.Confirmed && att.status != Status.Financed) {
            revert InvalidStatusTransition();
        }

        att.status = Status.Settled;

        // Lepas lock invoice aktif saat sudah lunas
        if (_activeInvoiceToUid[att.invoiceHash] == uid) {
            delete _activeInvoiceToUid[att.invoiceHash];
        }

        emit Settled(uid, msg.sender, uint64(block.timestamp));
    }

    // --- View Functions ---

    /**
     * @notice Mengambil data lengkap sebuah attestation berdasarkan UID.
     * @param uid Unique identifier attestation.
     */
    function getAttestation(bytes32 uid) external view returns (Attestation memory) {
        Attestation memory att = _attestations[uid];
        if (att.status == Status.None) revert AttestationNotFound();
        return att;
    }

    /**
     * @notice Memeriksa status keaktifan invoice berdasarkan invoiceHash.
     * @param invoiceHash Salted SHA-256 invoice.
     * @return isActive True jika invoice sedang aktif (CONFIRMED atau FINANCED).
     * @return activeUid UID attestation aktif jika ada.
     */
    function isInvoiceActive(bytes32 invoiceHash) external view returns (bool isActive, bytes32 activeUid) {
        activeUid = _activeInvoiceToUid[invoiceHash];
        if (activeUid != bytes32(0)) {
            Attestation memory att = _attestations[activeUid];
            if (att.status == Status.Confirmed || att.status == Status.Financed) {
                return (true, activeUid);
            }
        }
        return (false, bytes32(0));
    }

    /**
     * @notice Mengambil UID attestation yang sedang aktif untuk sebuah invoiceHash.
     */
    function getActiveUidByInvoice(bytes32 invoiceHash) external view returns (bytes32) {
        return _activeInvoiceToUid[invoiceHash];
    }

    // --- Admin Functions ---

    /**
     * @notice Mendaftarkan atau mencabut izin institusi lender (Bank/Fintech SCF).
     */
    function setLenderAuthorization(address lender, bool authorized) external onlyOwner {
        if (lender == address(0)) revert InvalidZeroAddress();
        isAuthorizedLender[lender] = authorized;
        emit LenderAuthorized(lender, authorized);
    }

    /**
     * @notice Memindahkan kepemilikan kontrak registry.
     */
    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert InvalidZeroAddress();
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
}
