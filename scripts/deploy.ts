import { ethers } from "hardhat";
import "dotenv/config";

async function main() {
  if (!process.env.PRIVATE_KEY) {
    throw new Error("⚠️ PRIVATE_KEY missing from .env");
  }

  const [deployer] = await ethers.getSigners();
  console.log(`🚀 Deploying MonadSwap with account: ${deployer.address}`);

  // Updated Monad Testnet token addresses
  const wmonAddress: string = "0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701";
  const usdcAddress: string = "0xf817257fed379853cDe0fa4F97AB987181B1E5Ea";
  
  // Use Uniswap V2 Router for swaps
  const routerAddress: string = "0xfb8e1c3b833f9e67a71c859a132cf783b645e436";

  // Universal Router as a fallback option
  const universalRouterAddress: string = "0x3ae6d8a282d67893e17aa70ebffb33ee5aa65893";

  console.log(`🔄 Deploying for WMON (Address: ${wmonAddress})`);

  // Deploy contract with multiple router support
  const MonadSwap = await ethers.getContractFactory("MonadSwap");
  const monadSwap = await MonadSwap.deploy(
    routerAddress, 
    universalRouterAddress, 
    wmonAddress, 
    usdcAddress
  );

  await monadSwap.waitForDeployment();

  console.log(`✅ MonadSwap deployed to: ${await monadSwap.getAddress()}`);
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exit(1);
});