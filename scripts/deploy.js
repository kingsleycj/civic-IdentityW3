const hre = require("hardhat");

async function main() {
    console.log("Fetching contract factory...");
    const CivicSoulboundNFT = await hre.ethers.getContractFactory("CivicSoulboundNFT");
    
    console.log("Deploying contract...");
    const civicNFT = await CivicSoulboundNFT.deploy();

    console.log("Waiting for deployment...");
    await civicNFT.deployed();

    console.log("Getting contract address...");
    const contractAddress = civicNFT.address;
    
    console.log(`✅ Civic Soulbound NFT deployed to: ${contractAddress}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });