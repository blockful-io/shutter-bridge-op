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
  // const l1StandardBridge = "0x99C9fc46f92E8a1c0deC1b1747d010903E884bE1"; // Ethereum Mainnet
  const l1StandardBridge = "0xFBb0621E0B23b5478B630BD55a5f21f67730B0F1"; // Ethereum Sepolia
  const amount = ethers.utils.parseEther("1");

  /// Approve the bridge to transfer the amount of tokens
  const l1ERC20 = new ethers.Contract(SHUTTER_TOKEN_CONTRACT, erc20Abi, signer);
  const tx0 = await l1ERC20.approve(l1StandardBridge, amount);
  await tx0.wait();

  /// Bridge the tokens
  const bridge = new ethers.Contract(l1StandardBridge, bridgeAbi, signer);
  const tx1 = await bridge.bridgeERC20To(
    SHUTTER_TOKEN_CONTRACT,
    BRIDGED_SHUTTER_TOKEN_CONTRACT,
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
