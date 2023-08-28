// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract MerkleDistributor {

    address public immutable token;
    bytes32 public immutable merkleRoot;
    uint256 public dropAmount;
    
    mapping(address => uint256) private addressesClaimed;

    event Claimed(address indexed _from, uint256 _dropAmount);

    constructor(address _token, bytes32 _merkleRoot, uint256 _dropAmount)  {
        token = _token;
        merkleRoot = _merkleRoot;
        dropAmount = _dropAmount;
    }

    function claim(bytes32[] calldata merkleProof) external {
        require(addressesClaimed[msg.sender] == 0, "MerkleDistributor: Drop already claimed");
        bytes32 node = keccak256(abi.encodePacked(msg.sender));

        require(MerkleProof.verify(merkleProof, merkleRoot, node), "MerkleDistributor: Invalid proof");

        addressesClaimed[msg.sender] = 1;

        require(IERC20(token).transfer(msg.sender, dropAmount), "MerkleDistributor: Transfer failed");

        emit Claimed(msg.sender, dropAmount);

    }


}
