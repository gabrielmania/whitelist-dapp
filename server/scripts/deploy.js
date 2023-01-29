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

// 0x8Df8193A8cc30b76D762DfBbBE92e306c80bfcb5
// https://whitelist-dapp-v2-pi.vercel.app/
// https://github.com/gabrielmania/whitelist-dapp