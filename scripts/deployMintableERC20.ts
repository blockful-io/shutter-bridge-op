import { ethers } from "hardhat";
import abi from "../abi/OptimismERC20Factory.json";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying contracts with the account: ${deployer.address}`);

  const SHUTTER_TOKEN_CONTRACT = process.env.SHUTTER_TOKEN_CONTRACT;
  if (!SHUTTER_TOKEN_CONTRACT) {
    throw new Error("SHUTTER_TOKEN_CONTRACT not defined. Please deploy and set on .env file.");
  }

  const FactoryAddress = "0x4200000000000000000000000000000000000012";
  const MintableFactory = await ethers.getContractAt(abi, FactoryAddress, deployer);

  const name = "Shutter Token from Mainnet";
  const symbol = "SHU";

  const test = "0x4200000000000000000000000000000000000013";
  const generatedAddress = await MintableFactory.callStatic.createOptimismMintableERC20(
    test,
    name,
    symbol,
  );
  const tx0 = await MintableFactory.createOptimismMintableERC20(test, name, symbol);
  await tx0.wait();

  console.log(`OptimismMintableERC20 deployed ${symbol} at address ${generatedAddress}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
