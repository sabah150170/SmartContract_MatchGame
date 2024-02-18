require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
require("@nomicfoundation/hardhat-chai-matchers");

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.20",
        paths: ["./contracts/Game"],
        settings: {
          optimizer: {
            enabled: true,
            runs: 50
          }
        }
      },
      {
        version: "0.4.22",
        paths: ["./contracts/Weth"]
      }
    ]
  },
  networks: {
    hardhat: {
      gasPrice: 900000000
    },
    localhost: {
      gasPrice: 900000000
    },
    sepolia: {
      url: process.env.ALCHEMY_ENDPOINT,
      accounts: [process.env.SEPOLIA_PRIVATE_KEY]
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  },
  gasReporter: {
    enabled: true,
    outputFile: "gas-reporter.txt",
  }  
};
