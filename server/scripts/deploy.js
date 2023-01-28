const { ethers } = require("hardhat");

async function main() {
  const whitelistContract = await ethers.getContractFactory("Whitelist");
  const deployedWhitelistContract = await whitelistContract.deploy(10);

  await deployedWhitelistContract.deployed();

  console.log(`Contract deployed to: ${deployedWhitelistContract.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

// 0x185B46787CeBf3a4731c8497A6532CD17f7bFdf1
