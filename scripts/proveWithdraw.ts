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

  /// The tx hash of the withdrawal transaction on the L2
  const withdrawHash = "0xf1d10c5f35212841c6f46d47d728e1d9b846f7846700182155ebc4142b05b1cc";

  /// Proving / Withdraw stages
  console.log("Waiting for the withdrawal to be ready to prove...");
  await messenger.waitForMessageStatus(withdrawHash, optimism.MessageStatus.READY_TO_PROVE);
  console.log("Proving the withdrawal...");
  await messenger.proveMessage(withdrawHash);
  console.log("Waiting for the withdrawal to be ready for relay...");
  await messenger.waitForMessageStatus(withdrawHash, optimism.MessageStatus.READY_FOR_RELAY);
  console.log("Finalizing the withdrawal...");
  await messenger.finalizeMessage(withdrawHash);
  console.log("Waiting for the withdrawal to be relayed...");
  await messenger.waitForMessageStatus(withdrawHash, optimism.MessageStatus.RELAYED);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
