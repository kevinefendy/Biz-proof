"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { ethers, BrowserProvider, formatEther } from "ethers";
import {
  ARBITRUM_SEPOLIA_CHAIN_ID,
  ARBITRUM_SEPOLIA_PARAMS,
} from "@/lib/contracts/bizproof";
import { getEthereumProvider, ensureArbitrumNetwork } from "@/lib/web3";

interface Web3ContextType {
  account: string | null;
  chainId: number | null;
  balance: string | null;
  isConnecting: boolean;
  isCorrectNetwork: boolean;
  error: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchToArbitrum: () => Promise<void>;
  shortAddress: (addr?: string | null) => string;
}

const Web3Context = createContext<Web3ContextType | null>(null);

export function Web3Provider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isCorrectNetwork = chainId === ARBITRUM_SEPOLIA_CHAIN_ID;

  const shortAddress = (addr?: string | null): string => {
    const a = addr || account;
    if (!a) return "";
    return `${a.slice(0, 6)}…${a.slice(-4)}`;
  };

  const updateAccountData = useCallback(async (currentAccount: string) => {
    try {
      const provider = getEthereumProvider();
      if (!provider) return;

      const browserProvider = new BrowserProvider(provider);
      const network = await browserProvider.getNetwork();
      setChainId(Number(network.chainId));

      const bal = await browserProvider.getBalance(currentAccount);
      setBalance(Number(formatEther(bal)).toFixed(4));
    } catch (e: any) {
      console.warn("Failed to fetch balance or network:", e);
    }
  }, []);

  const connectWallet = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    try {
      const provider = getEthereumProvider();
      if (!provider) {
        throw new Error("MetaMask tidak terdeteksi. Silakan pasang ekstensi dompet Web3.");
      }

      // Request akun
      const accounts = await provider.request({ method: "eth_requestAccounts" });
      if (accounts && accounts.length > 0) {
        const selected = accounts[0];
        setAccount(selected);

        // Pastikan di jaringan Arbitrum Sepolia
        await ensureArbitrumNetwork();

        await updateAccountData(selected);
      }
    } catch (err: any) {
      console.error("Connect wallet error:", err);
      setError(err?.message || "Gagal menghubungkan dompet.");
    } finally {
      setIsConnecting(false);
    }
  }, [updateAccountData]);

  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setBalance(null);
    setChainId(null);
    setError(null);
  }, []);

  const switchToArbitrum = useCallback(async () => {
    setError(null);
    try {
      await ensureArbitrumNetwork();
      if (account) {
        await updateAccountData(account);
      }
    } catch (err: any) {
      setError(err?.message || "Gagal beralih ke Arbitrum Sepolia.");
    }
  }, [account, updateAccountData]);

  // Cek koneksi yang sudah ada (auto-reconnect jika authorized)
  useEffect(() => {
    const provider = getEthereumProvider();
    if (!provider) return;

    provider
      .request({ method: "eth_accounts" })
      .then((accounts: string[]) => {
        if (accounts && accounts.length > 0) {
          setAccount(accounts[0]);
          updateAccountData(accounts[0]);
        }
      })
      .catch(() => {});

    // Event listeners
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        setAccount(accounts[0]);
        updateAccountData(accounts[0]);
      }
    };

    const handleChainChanged = (newChainIdHex: string) => {
      const id = parseInt(newChainIdHex, 16);
      setChainId(id);
      if (account) {
        updateAccountData(account);
      }
    };

    if (provider.on) {
      provider.on("accountsChanged", handleAccountsChanged);
      provider.on("chainChanged", handleChainChanged);
    }

    return () => {
      if (provider.removeListener) {
        provider.removeListener("accountsChanged", handleAccountsChanged);
        provider.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, [account, disconnectWallet, updateAccountData]);

  return (
    <Web3Context.Provider
      value={{
        account,
        chainId,
        balance,
        isConnecting,
        isCorrectNetwork,
        error,
        connectWallet,
        disconnectWallet,
        switchToArbitrum,
        shortAddress,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3(): Web3ContextType {
  const ctx = useContext(Web3Context);
  if (!ctx) {
    throw new Error("useWeb3 must be used within Web3Provider");
  }
  return ctx;
}
