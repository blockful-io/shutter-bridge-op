import { ethers } from "hardhat";
import erc20Abi from "../abi/ERC20.json";
import bridgeAbi from "../abi/L1StandardBridge.json";

async function main() {
  /// Environment Setup
  const SHUTTER_TOKEN_CONTRACT = process.env.SHUTTER_TOKEN_CONTRACT;
  const BRIDGED_SHUTTER_TOKEN_CONTRACT = process.env.BRIDGED_SHUTTER_TOKEN_CONTRACT;
  if (!BRIDGED_SHUTTER_TOKEN_CONTRACT || !SHUTTER_TOKEN_CONTRACT) {
    throw new Error(
      "BRIDGED_SHUTTER_TOKEN_CONTRACT or SHUTTER_TOKEN_CONTRACT not defined. Please deploy and set on .env file.",
    );
  }

  /// Signer Setup
  const [signer] = await ethers.getSigners();
  console.log(`Bridging tokens with the account: ${signer.address}`);

  /// Bridge Setup
  const l2StandardBridge = "0x4200000000000000000000000000000000000010"; // For OP, Mainnet & Sepolia have the same address
  const amount = ethers.utils.parseEther("1");

  /// Approve the bridge to transfer the amount of tokens
  const l2ERC20 = new ethers.Contract(BRIDGED_SHUTTER_TOKEN_CONTRACT, erc20Abi, signer);
  const tx0 = await l2ERC20.approve(l2StandardBridge, amount);
  await tx0.wait();

  /// Bridge the tokens
  /// Bellow statement explains why its very hard to test the L2>L1 bridge, as it requires 7 days to complete
  /*
    FROM: https://docs.optimism.io/builders/app-developers/tutorials/cross-dom-bridge-erc20
    The final step to withdrawing tokens from L2 to L1 is to relay the withdrawal on L1. This can only happen after the fault proof period has elapsed. On OP Mainnet, this takes 7 days.
    We're currently testing fault proofs on OP Sepolia, so withdrawal times reflect Mainnet times.
  */
  const bridge = new ethers.Contract(l2StandardBridge, bridgeAbi, signer);
  const tx1 = await bridge.bridgeERC20To(
    BRIDGED_SHUTTER_TOKEN_CONTRACT,
    SHUTTER_TOKEN_CONTRACT,
    signer.address,
    amount,
    200000,
    "0x",
  );
  const receipt = await tx1.wait();

  /// Log the transaction hash
  console.log(`Bridge transaction hash: ${receipt.transactionHash}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
