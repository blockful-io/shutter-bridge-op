import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Minting tokens with the account: ${deployer.address}`);

  const SHUTTER_TOKEN_CONTRACT = process.env.SHUTTER_TOKEN_CONTRACT;
  if (!SHUTTER_TOKEN_CONTRACT) {
    throw new Error("SHUTTER_TOKEN_CONTRACT not defined. Please deploy and set on .env file.");
  }

  const shutterToken = await ethers.getContractAt("ShutterToken", SHUTTER_TOKEN_CONTRACT, deployer);

  const tx0 = await shutterToken.mint(deployer.address);
  await tx0.wait();

  console.log(`ShutterToken minted 1000e18 tokens`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
