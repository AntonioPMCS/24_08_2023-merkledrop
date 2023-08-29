const { MerkleTree } = require("merkletreejs");
const KECCAK256 = require("keccak256");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const { BigNumber} = require("ethers");
const { createNodes, toNode } = require("./testUtils");

describe("MerkleDistributor", async () => {
    beforeEach(async () => {
        [signer1, signer2, signer3, signer4, signer5, signer6, signer7, signer8] = await ethers.getSigners();
        whiteList = [
            {"address": signer1.address, amount: "40179309944489754896657"},
            {"address": signer2.address, amount: "20179309944489754896653"},
            {"address": signer3.address, amount: "10179309944489754896654"},
            {"address": signer4.address, amount: "33179309944489754896656"},
            {"address": "0xF0010C5628b269efDf3e46efb2b5ec677c38fDF9", amount: "40179309944489754896657"},
        ]

        leaves = (createNodes(whiteList));
        console.log(leaves);
        tree = new MerkleTree(leaves, KECCAK256, { sortPairs: true});

        TofuCoin = await ethers.getContractFactory("TofuCoin", signer1);
        token = await TofuCoin.deploy();
        
        MerkleDistributor = await ethers.getContractFactory("MerkleDistributor", signer1);
        distributor = await MerkleDistributor.deploy(token.address, tree.getHexRoot());
        
        await token.connect(signer1).mint(
            distributor.address,
            '99999309944489754896657'
        )
    });

    describe("8 account tree", () => {
        it("Successful claim for msg.sender", async () => {

            const _dropAmount = whiteList[0].amount;

            console.log(signer1.address);
            console.log("Balance of Signer1: ", await token.balanceOf(signer1.address))
            expect(await token.balanceOf(signer1.address)).to.be.equal(0);

            const proof = tree.getHexProof(toNode(signer1.address, _dropAmount));

            await distributor.connect(signer1).claim(proof, _dropAmount, signer1.address);

            expect(await token.balanceOf(signer1.address)).to.be.equal(_dropAmount);

        })

        it("Successful claim where msg.sender =! recipient", async () => {
            const _dropAmount = whiteList[1].amount;

            console.log(signer2.address);
            console.log("Balance of Signer2: ", await token.balanceOf(signer2.address))
            expect(await token.balanceOf(signer2.address)).to.be.equal(0);

            const proof = tree.getHexProof(toNode(signer2.address, _dropAmount));

            await distributor.connect(signer1).claim(proof, _dropAmount, signer2.address);

            expect(await token.balanceOf(signer2.address)).to.be.equal(_dropAmount);

        })

        it("Unsuccessful claim: duplicate drop", async () => {
            const _dropAmount = whiteList[0].amount;

            expect(await token.balanceOf(signer1.address)).to.be.equal(0);

            const proof = tree.getHexProof(toNode(signer1.address, _dropAmount));

            await distributor.connect(signer1).claim(proof, _dropAmount, signer1.address);
            await expect(
                distributor.connect(signer1).claim(proof, _dropAmount, signer1.address)
            ).to.be.revertedWith("MerkleDistributor: Drop already claimed");
        })

        it("Unsuccessful claim: invalid proof", async () => {
            const dropAmount = whiteList[4].amount;
            const receiver = whiteList[4].address;
            expect(await token.balanceOf(receiver)).to.be.equal(0);

            const proof = tree.getHexProof(toNode(signer1.address, dropAmount));
           
            await expect(
                distributor.connect(signer1).claim(proof, dropAmount, receiver)
            ).to.be.revertedWith("MerkleDistributor: Invalid proof");
        })

        it("Emits a success event", async () => {
            const dropAmount = whiteList[0].amount;
            const proof = tree.getHexProof(toNode(signer1.address, dropAmount));

            await expect(distributor.connect(signer1).claim(proof, dropAmount, signer1.address))
                .to.emit(distributor, "Claimed")
                .withArgs(signer1.address, dropAmount)
        })
    })
})