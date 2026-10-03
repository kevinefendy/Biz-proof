import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
dotenv.config();

const DEPLOYER = process.env.DEPLOYER_PRIVATE_KEY || "";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: { optimizer: { enabled: true, runs: 200 } },
  },
  // NOTE: kontrak canonical ada di <repo>/contracts/BizProofRegistry.sol.
  // Salinan di backend/contracts/ disync manual agar Hardhat bisa compile
  // (Hardhat melarang sources di luar project root).
  networks: {
    arbitrumSepolia: {
      url: process.env.ARBITRUM_SEPOLIA_RPC || "https://sepolia-rollup.arbitrum.io/rpc",
      chainId: 421614,
      accounts: DEPLOYER && !DEPLOYER.startsWith("0x0000") ? [DEPLOYER] : [],
    },
  },
};

export default config;
