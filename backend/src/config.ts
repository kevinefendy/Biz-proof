import "dotenv/config";

function str(name: string, fallback = ""): string {
  return process.env[name] || fallback;
}

export const config = {
  port: Number(process.env.PORT || 4000),
  databaseUrl: str("DATABASE_URL", ""),
  rpcUrl: str("ARBITRUM_SEPOLIA_RPC", "https://sepolia-rollup.arbitrum.io/rpc"),
  registryAddress: str("BIZPROOF_REGISTRY_ADDRESS", "0x8Fa35B47dE2A91D0E031a0e0D911Eb83c3c78F90"),
  relayerKey: str("RELAYER_PRIVATE_KEY", ""),
  apiKeys: str("API_KEYS", "key_buyer_demo,key_lender_demo").split(",").map((s) => s.trim()).filter(Boolean),
  frontendUrl: str("FRONTEND_URL", "http://localhost:3000"),
  isRelayerConfigured(): boolean {
    return !!this.relayerKey && !this.relayerKey.startsWith("0x0000");
  },
};
