
const { ethers } = require("hardhat");

async function main() {

  const SuperMarioWorld = await ethers.getContractFactory("SuperMarioWorldCollection");
  const superMarioWorld = await SuperMarioWorld.deploy(
    "SuperMarioWorldCollection", 
    "SPWC",
    "https://ipfs.io/ipfs/QmZ3XoTafkJ3C31nE4Av94T5XUHE9StvuwQ3pgVnp2t99c/"
    );

  await superMarioWorld.deployed();
  console.log("Success! Contract was deployed to: ", superMarioWorld.address);

  await superMarioWorld.mint(10) // 1 Mario
  await superMarioWorld.mint(10) // 2 Luigi
  await superMarioWorld.mint(10) 
  await superMarioWorld.mint(10)
  await superMarioWorld.mint(1) // 5 Mario Gold (rare)
  await superMarioWorld.mint(1) // 6 Luigi Gold (rare) 
  await superMarioWorld.mint(1)
  await superMarioWorld.mint(1)

  console.log("NFT successfully minted");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


