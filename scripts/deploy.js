const hre = require("hardhat")

let address;

async function main() {
  const env = process.env.ENVIRONMENT;

  if (env === "product") {
    await deployGame(process.env.WETH_CONTRACT_ADDRESS);
  } else if (env === "development") {
    await deployWETH(address);
    await deployGame(address);
  } else {
    console.error("Unrecognized environment.");
    process.exit(1);
  }
}

async function deployGame(address) {
  const GameContract = await hre.ethers.getContractFactory("Game");
  const gameDeployed = await GameContract.deploy(address)
  await gameDeployed.waitForDeployment();

  address = await gameDeployed.getAddress();
  console.log("Game, deployed to:", address);
}

async function deployWETH() {
  const WethContract = await hre.ethers.getContractFactory("WETH9");
  const WethDeployed = await WethContract.deploy();
  await WethDeployed.waitForDeployment();

  address = await WethDeployed.getAddress();
  console.log("Weth, deployed to:", address);
}

// recommend to use this pattern to be able to use async/await everywhere and properly handle errors
main().catch(error => {
      console.error(error);
      process.exit(1);
  });
