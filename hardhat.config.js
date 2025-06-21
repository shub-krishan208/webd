require("@nomicfoundation/hardhat-toolbox");
/*
 * this shit is crazy, made my whole thing break for some reason
 * require("@nomiclabs/hardhat-etherscan");
 */
require("@nomiclabs/hardhat-ethers");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    hardhat: {
      chainId: 1337,
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      accounts: [process.env.TESTNET_PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};
