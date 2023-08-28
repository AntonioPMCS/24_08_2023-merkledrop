/** @type import('hardhat/config').HardhatUserConfig */
//require("@nomicfoundation/hardhat-ethers");
require("@nomiclabs/hardhat-waffle");

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.17"
      }
    ] 
  },
  paths: {
    artifacts: "./client/src/artifacts"
  }
}
