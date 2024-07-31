const optimism = require("@eth-optimism/sdk");
import { ethers } from "hardhat";

async function main() {
  /// Handling the environment variables

  const ETHEREUM_RPC_URL = process.env.SEPOLIA_RPC_URL; // Testnet
  const OP_RPC_URL = process.env.OP_SEPOLIA_RPC_URL; // Testnet
  // const ETHEREUM_RPC_URL = process.env.ETHEREUM_RPC_URL; // Mainnet
  // const OP_RPC_URL = process.env.OP_RPC_URL; // Mainnet

  const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;
  if (!DEPLOYER_PRIVATE_KEY || !ETHEREUM_RPC_URL || !OP_RPC_URL) {
    throw new Error("Enviroment variable(s) not defined. Please set in .env file.");
  }

  /// Setting up the providers and wallets
  const l1Provider = new ethers.providers.StaticJsonRpcProvider(ETHEREUM_RPC_URL);
  const l2Provider = new ethers.providers.StaticJsonRpcProvider(OP_RPC_URL);
  const l1Wallet = new ethers.Wallet(DEPLOYER_PRIVATE_KEY, l1Provider);
  const l2Wallet = new ethers.Wallet(DEPLOYER_PRIVATE_KEY, l2Provider);

  /// Instantiating the optimism messenger (more setup)
  const messenger = new optimism.CrossChainMessenger({
    l1ChainId: 11155111, // 11155111 for Sepolia, 1 for Ethereum
    l2ChainId: 11155420, // 11155420 for OP Sepolia, 10 for OP Mainnet
    l1SignerOrProvider: l1Wallet,
    l2SignerOrProvider: l2Wallet,
  });

  /// Amount to be withdrawn
  const amount = ethers.utils.parseEther("0.001");

  /// Withdrawal
  const withdrawal = await messenger.withdrawERC20(
    process.env.SHUTTER_TOKEN_CONTRACT,
    process.env.BRIDGED_SHUTTER_TOKEN_CONTRACT,
    amount,
  );
  await withdrawal.wait();
  console.log("Withdrawal hash:", withdrawal.hash);

  /// Proving / Withdraw stages
  console.log("Waiting for the withdrawal to be ready to prove...");
  await messenger.waitForMessageStatus(withdrawal.hash, optimism.MessageStatus.READY_TO_PROVE);
  console.log("Proving the withdrawal...");
  await messenger.proveMessage(withdrawal.hash);
  console.log(
    "Waiting for the withdrawal to be ready for relay...Fault proof takes 7 days to finalize",
  );
  await messenger.waitForMessageStatus(withdrawal.hash, optimism.MessageStatus.READY_FOR_RELAY);
  console.log("Finalizing the withdrawal...");
  await messenger.finalizeMessage(withdrawal.hash);
  console.log("Waiting for the withdrawal to be relayed...");
  await messenger.waitForMessageStatus(withdrawal.hash, optimism.MessageStatus.RELAYED);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
