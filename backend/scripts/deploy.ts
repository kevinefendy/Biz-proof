// eslint-disable-next-line @typescript-eslint/no-require-imports
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer:", deployer?.address ?? "(hardhat default)");
  const Factory = await hre.ethers.getContractFactory("BizProofRegistry");
  const registry = await Factory.deploy();
  await registry.waitForDeployment();
  const addr = await registry.getAddress();
  console.log("BizProofRegistry deployed at:", addr);
  console.log("Set di backend/.env → BIZPROOF_REGISTRY_ADDRESS=" + addr);
  console.log("Set di frontend .env.local → NEXT_PUBLIC_BIZPROOF_REGISTRY_ADDRESS=" + addr);
}

main().catch((e: unknown) => {
  console.error(e);
  process.exit(1);
});
