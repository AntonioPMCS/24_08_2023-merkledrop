// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract MerkleDistributor {

    address public immutable token;
    bytes32 public immutable merkleRoot;
    
    mapping(address => uint256) private addressesClaimed;

    event Claimed(address indexed _from, uint256 _amount);

    constructor(address _token, bytes32 _merkleRoot)  {
        token = _token;
        merkleRoot = _merkleRoot;
    }

    function claim(bytes32[] calldata merkleProof, uint256 _amount, address _receiver) external {
        require(addressesClaimed[_receiver] == 0, "MerkleDistributor: Drop already claimed");
        bytes32 node = keccak256(abi.encodePacked(_receiver, _amount));

        require(MerkleProof.verify(merkleProof, merkleRoot, node), "MerkleDistributor: Invalid proof");

        addressesClaimed[_receiver] = 1;

        require(IERC20(token).transfer(_receiver, _amount), "MerkleDistributor: Transfer failed");

        emit Claimed(_receiver, _amount);

    }


}
