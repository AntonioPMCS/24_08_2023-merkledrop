const { MerkleTree } = require("merkletreejs");
const KECCAK256 = require("keccak256");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const { BigNumber} = require("ethers");

describe("MerkleDistributor", () => {
    const _dropAmount = 500;
    beforeEach(async () => {
        [signer1, signer2, signer3, signer4, signer5, signer6, signer7, signer8] = await ethers.getSigners();

        walletAddresses = [signer1, signer2, signer3, signer4, signer5, signer6, signer7, signer8].map((signer) => signer.address);
        console.log(walletAddresses);

        leaves = walletAddresses.map((adr) => KECCAK256(adr));
        tree = new MerkleTree(leaves, KECCAK256, { sortPairs: true});

        
        TofuCoin = await ethers.getContractFactory("TofuCoin", signer1);
        token = await TofuCoin.deploy();
        
        MerkleDistributor = await ethers.getContractFactory("MerkleDistributor", signer1);
        distributor = await MerkleDistributor.deploy(token.address, tree.getHexRoot(), _dropAmount);
        
        await token.connect(signer1).mint(
            distributor.address,
            '4000'
        )
    });

    describe("8 account tree", () => {
        it("Successful claim", async () => {
            console.log(signer1.address);
            console.log("Balance of Signer1: ", await token.balanceOf(signer1.address))
            console.log(BigNumber);
            expect(await token.balanceOf(signer1.address)).to.be.equal(0);

            const proof = tree.getHexProof(KECCAK256(signer1.address));

            await distributor.connect(signer1).claim(proof);

            expect(await token.balanceOf(signer1.address)).to.be.equal(_dropAmount);

        })

        it("Unsuccessful claim: duplicate drop", async () => {

            expect(await token.balanceOf(signer1.address)).to.be.equal(0);

            const proof = tree.getHexProof(KECCAK256(signer1.address));

            await distributor.connect(signer1).claim(proof);
            await expect(
                distributor.connect(signer1).claim(proof)
            ).to.be.revertedWith("MerkleDistributor: Drop already claimed");
        })

        it("Unsuccessful claim: invalid proof", async () => {
            expect(await token.balanceOf(signer1.address)).to.be.equal(0);

            const proof = tree.getHexProof(KECCAK256(signer2.address));
           
            await expect(
                distributor.connect(signer1).claim(proof)
            ).to.be.revertedWith("MerkleDistributor: Invalid proof");
        })

        it("Emits a success event", async () => {
            const proof = tree.getHexProof(KECCAK256(signer1.address));

            await expect(distributor.connect(signer1).claim(proof))
                .to.emit(distributor, "Claimed")
                .withArgs(signer1.address, _dropAmount)
        })
    })
})