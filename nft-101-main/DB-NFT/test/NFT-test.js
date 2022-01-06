const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFT", () => {
  let user;

  beforeEach(async function () {
    [user] = await ethers.getSigners();

    const ERC721 = await ethers.getContractFactory("ERC721");
    this.erc721 = await ERC721.deploy();
  });
  describe("balanceOf", () => {
     it("Should return NFT balance", async function () {
      console.log("");
      console.log("*** Balance ***");
      console.log(`User's balance: ${await this.erc721.balanceOf(user.address)}`);

          expect(await this.erc721.balanceOf(user.address)).to.eq("0");
        });        
});
});
