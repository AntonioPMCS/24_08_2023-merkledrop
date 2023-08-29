const { ethers } = require("hardhat");

const toNode = (address, amount) => {
    return Buffer.from(
        ethers.utils.solidityKeccak256(['address', 'uint256'], [address, amount]).substr(2), 'hex'
    )
}
const createNodes = (publishedList) => {
    return publishedList.map((adrObj) => { 
                                return toNode(
                                    adrObj.address,
                                    ethers.utils.parseUnits(adrObj.amount, "wei"))
                                });
}

module.exports = { createNodes, toNode}