import { ethers, network } from "hardhat";
import "dotenv/config";

async function testMonadSwap() {
  // Network details for Monad Testnet
  const wmonAddress = "0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701";
  const usdcAddress = "0xf817257fed379853cDe0fa4F97AB987181B1E5Ea";
  
  // Use both V2 and Universal Routers
  const v2RouterAddress = "0xfb8e1c3b833f9e67a71c859a132cf783b645e436";
  const universalRouterAddress = "0x3ae6d8a282d67893e17aa70ebffb33ee5aa65893";

  // Get the deployed contract
  const [deployer] = await ethers.getSigners();
  console.log(`🧪 Testing MonadSwap with address: ${deployer.address}`);

  // Switch to Monad testnet
  try {
    await network.provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x279f" }] // Monad Testnet Chain ID
    });
    console.log("✅ Switched to Monad Testnet");
  } catch (switchError) {
    console.warn("⚠️ Could not switch network:", switchError);
  }

  // Get token contracts
  const wmonContract = await ethers.getContractAt("IERC20", wmonAddress);
  const usdcContract = await ethers.getContractAt("IERC20", usdcAddress);
  
  // Get MonadSwap contract (update with your actual deployed address)
  const monadSwapAddress = "0x7091bA725b3F862217DE432Fa321010eCdDcb018";
  const monadSwapContract = await ethers.getContractAt("MonadSwap", monadSwapAddress);

  try {
    // Detailed pre-swap diagnostics
    console.log("\n--- 🔍 Pre-Swap Diagnostics ---");
    
    // Native and token balance checks
    const nativeBalance = await ethers.provider.getBalance(deployer.address);
    const wmonBalance = await wmonContract.balanceOf(deployer.address);
    const usdcBalance = await usdcContract.balanceOf(deployer.address);

    console.log(`💰 Native MON Balance: ${ethers.formatEther(nativeBalance)} MON`);
    console.log(`💼 WMON Balance: ${ethers.formatEther(wmonBalance)} WMON`);
    console.log(`💵 USDC Balance: ${ethers.formatUnits(usdcBalance, 6)} USDC`);

    // Prepare for swap
    console.log("\n--- 🔧 Swap Preparation ---");
    const swapAmount = ethers.parseEther("0.01"); // 0.01 WMON
    
    // Approve MonadSwap contract to spend WMON
    const approveTx = await wmonContract.approve(monadSwapAddress, swapAmount);
    await approveTx.wait();
    console.log("✅ Approved MonadSwap to spend WMON");

    // Swap attempt with both routers
    const routersToTest = [
      { name: "Uniswap V2 Router", address: v2RouterAddress },
      { name: "Universal Router", address: universalRouterAddress }
    ];

    for (const router of routersToTest) {
      console.log(`\n--- 🔄 Swap Attempt with ${router.name} ---`);
      try {
        const swapTx = await monadSwapContract.swapTokens(
          router.address,   // Router address
          wmonAddress,      // Token In (WMON)
          usdcAddress,      // Token Out (USDC)
          swapAmount,       // Amount In
          0,                // Minimum amount out (be cautious with 0)
          deployer.address  // Recipient
        );
        
        const receipt = await swapTx.wait();
        console.log(`✅ Swap successful with ${router.name}:`, receipt);
      } catch (swapError) {
        console.error(`❌ Swap failed with ${router.name}:`, swapError);
        
        // Detailed error logging
        if (swapError instanceof Error) {
          console.error("Error details:", swapError.message);
          console.error("Error stack:", swapError.stack);
        }
      }
    }

    // Post-swap balance check
    console.log("\n--- 🧾 Post-Swap Diagnostics ---");
    const postWmonBalance = await wmonContract.balanceOf(deployer.address);
    const postUsdcBalance = await usdcContract.balanceOf(deployer.address);
    
    console.log(`💼 Post-Swap WMON Balance: ${ethers.formatEther(postWmonBalance)} WMON`);
    console.log(`💵 Post-Swap USDC Balance: ${ethers.formatUnits(postUsdcBalance, 6)} USDC`);

  } catch (error) {
    console.error("❌ Comprehensive test failed:", error);
  }
}

async function main() {
  await testMonadSwap();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });