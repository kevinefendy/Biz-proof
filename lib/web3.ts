/**
 * BizProof Protocol - Web3 & Ethers.js integration for Arbitrum Sepolia
 * Reference: PRD v3.0 & template-fe-arbitrum-workshop
 */

import { ethers, BrowserProvider, Contract, JsonRpcProvider } from "ethers";
import {
  ARBITRUM_SEPOLIA_CHAIN_ID,
  ARBITRUM_SEPOLIA_PARAMS,
  ARBITRUM_SEPOLIA_RPC,
  BIZPROOF_REGISTRY_ADDRESS,
  BIZPROOF_REGISTRY_ABI,
  OnChainAttestation,
  OnChainStatus,
} from "./contracts/bizproof";

declare global {
  interface Window {
    ethereum?: any;
  }
}

/**
 * Mendapatkan Ethereum Provider dari browser dengan filter anti-conflict (MetaMask vs Rabby vs lainnya)
 */
export function getEthereumProvider(): any | null {
  if (typeof window === "undefined" || !window.ethereum) {
    return null;
  }

  // Jika terdapat multi-wallet extension yang memasang array providers
  if (window.ethereum.providers?.length) {
    const metaMask = window.ethereum.providers.find((p: any) => p.isMetaMask);
    if (metaMask) return metaMask;
    return window.ethereum.providers[0];
  }

  return window.ethereum;
}

/**
 * Memastikan dompet terhubung ke jaringan Arbitrum Sepolia Testnet (Chain ID 421614)
 */
export async function ensureArbitrumNetwork(): Promise<boolean> {
  const provider = getEthereumProvider();
  if (!provider) {
    throw new Error("Dompet Web3 (MetaMask/Rabby) tidak terdeteksi di browser!");
  }

  try {
    // Coba langsung ganti jaringan ke Arbitrum Sepolia
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: ARBITRUM_SEPOLIA_PARAMS.chainId }],
    });
    return true;
  } catch (switchError: any) {
    // Error 4902: Jaringan belum terdaftar di dompet pengguna
    if (switchError.code === 4902 || switchError.data?.originalError?.code === 4902) {
      try {
        await provider.request({
          method: "wallet_addEthereumChain",
          params: [ARBITRUM_SEPOLIA_PARAMS],
        });
        return true;
      } catch (addError: any) {
        throw new Error(`Gagal menambahkan Arbitrum Sepolia: ${addError.message || addError}`);
      }
    }
    throw switchError;
  }
}

/**
 * Read-Only JSON-RPC Provider untuk Arbitrum Sepolia
 * Memungkinkan pengecekan status tanpa mengharuskan pengguna login dompet
 */
export function getReadOnlyProvider(): JsonRpcProvider {
  return new JsonRpcProvider(ARBITRUM_SEPOLIA_RPC);
}

/**
 * Instance Contract Read-Only
 */
export function getReadOnlyContract(customAddress?: string): Contract {
  const provider = getReadOnlyProvider();
  const address = customAddress || BIZPROOF_REGISTRY_ADDRESS;
  return new Contract(address, BIZPROOF_REGISTRY_ABI, provider);
}

/**
 * Instance Contract Write dengan Signer (Browser Wallet)
 */
export async function getSignerContract(customAddress?: string): Promise<{ contract: Contract; signer: ethers.Signer }> {
  const ethProvider = getEthereumProvider();
  if (!ethProvider) {
    throw new Error("Web3 Wallet tidak terdeteksi. Silakan pasang MetaMask.");
  }

  await ensureArbitrumNetwork();
  const browserProvider = new BrowserProvider(ethProvider);
  const signer = await browserProvider.getSigner();
  const address = customAddress || BIZPROOF_REGISTRY_ADDRESS;
  const contract = new Contract(address, BIZPROOF_REGISTRY_ABI, signer);

  return { contract, signer };
}

/**
 * Mengambil Attestation dari Smart Contract Arbitrum
 */
export async function fetchOnChainAttestation(uid: string): Promise<OnChainAttestation | null> {
  try {
    const contract = getReadOnlyContract();
    const raw = await contract.getAttestation(uid);

    return {
      uid: raw.uid,
      issuer: raw.issuer,
      subjectId: raw.subjectId,
      schemaId: raw.schemaId,
      invoiceHash: raw.invoiceHash,
      payeeHash: raw.payeeHash,
      issuedAt: Number(raw.issuedAt),
      expiresAt: Number(raw.expiresAt),
      status: Number(raw.status) as OnChainStatus,
      revokeReasonHash: raw.revokeReasonHash,
    };
  } catch (err: any) {
    // Jika tidak ditemukan atau revert
    return null;
  }
}

/**
 * Memeriksa apakah suatu invoiceHash sedang aktif on-chain (Anti Double-Financing)
 */
export async function checkInvoiceOnChain(invoiceHash: string): Promise<{ isActive: boolean; activeUid: string }> {
  try {
    const contract = getReadOnlyContract();
    const [isActive, activeUid] = await contract.isInvoiceActive(invoiceHash);
    return { isActive, activeUid };
  } catch {
    return { isActive: false, activeUid: ethers.ZeroHash };
  }
}

/**
 * Eksekusi Attest On-Chain oleh Buyer dengan buffer gas 50% untuk Arbitrum L2
 */
export async function attestOnChain(params: {
  subjectId: string;
  schemaId?: string;
  invoiceHash: string;
  payeeHash: string;
  expiresAt?: number;
}): Promise<{ txHash: string; uid: string }> {
  const { contract, signer } = await getSignerContract();
  const browserProvider = signer.provider as BrowserProvider;

  // Siapkan parameter format bytes32
  const formatBytes32 = (str: string): string => {
    if (str.startsWith("0x") && str.length === 66) return str;
    return ethers.keccak256(ethers.toUtf8Bytes(str));
  };

  const subjectBytes32 = formatBytes32(params.subjectId);
  const schemaBytes32 = params.schemaId
    ? formatBytes32(params.schemaId)
    : ethers.keccak256(ethers.toUtf8Bytes("INVOICE_CONFIRMED_V1"));
  const invoiceBytes32 = formatBytes32(params.invoiceHash);
  const payeeBytes32 = formatBytes32(params.payeeHash);
  const expiresAtUint64 = BigInt(params.expiresAt || 0);

  // Buffer Gas 50% untuk L2 Arbitrum
  const feeData = await browserProvider.getFeeData();
  const gasOptions: any = {};
  if (feeData.maxFeePerGas) {
    gasOptions.maxFeePerGas = (feeData.maxFeePerGas * BigInt(150)) / BigInt(100);
  }
  if (feeData.maxPriorityFeePerGas) {
    gasOptions.maxPriorityFeePerGas = (feeData.maxPriorityFeePerGas * BigInt(150)) / BigInt(100);
  }

  const tx = await contract.attest(
    subjectBytes32,
    schemaBytes32,
    invoiceBytes32,
    payeeBytes32,
    expiresAtUint64,
    gasOptions
  );

  const receipt = await tx.wait(1);

  // Parse event Attested dari logs untuk mendapatkan UID
  let generatedUid = "";
  if (receipt && receipt.logs) {
    for (const log of receipt.logs) {
      try {
        const parsed = contract.interface.parseLog({
          topics: log.topics as string[],
          data: log.data,
        });
        if (parsed && parsed.name === "Attested") {
          generatedUid = parsed.args.uid;
          break;
        }
      } catch {
        // Abaikan log lain
      }
    }
  }

  return {
    txHash: receipt.hash,
    uid: generatedUid || receipt.hash,
  };
}

/**
 * Eksekusi Mark Financed oleh Lender resmi
 */
export async function markFinancedOnChain(uid: string): Promise<string> {
  const { contract, signer } = await getSignerContract();
  const browserProvider = signer.provider as BrowserProvider;

  const feeData = await browserProvider.getFeeData();
  const gasOptions: any = {};
  if (feeData.maxFeePerGas) {
    gasOptions.maxFeePerGas = (feeData.maxFeePerGas * BigInt(150)) / BigInt(100);
  }

  const tx = await contract.markFinanced(uid, gasOptions);
  const receipt = await tx.wait(1);
  return receipt.hash;
}

/**
 * Eksekusi Revoke Attestation oleh Buyer / Owner
 */
export async function revokeOnChain(uid: string, reasonText: string): Promise<string> {
  const { contract, signer } = await getSignerContract();
  const browserProvider = signer.provider as BrowserProvider;

  const reasonHash = ethers.keccak256(ethers.toUtf8Bytes(reasonText));

  const feeData = await browserProvider.getFeeData();
  const gasOptions: any = {};
  if (feeData.maxFeePerGas) {
    gasOptions.maxFeePerGas = (feeData.maxFeePerGas * BigInt(150)) / BigInt(100);
  }

  const tx = await contract.revoke(uid, reasonHash, gasOptions);
  const receipt = await tx.wait(1);
  return receipt.hash;
}
