import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying contracts with the account: ${deployer.address}`);

  const Factory = await ethers.getContractFactory("ShutterToken");
  const shutterToken = await Factory.deploy();
  await shutterToken.deployed();

  console.log(`ShutterToken address: ${shutterToken.address}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
