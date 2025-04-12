const router = require("express").Router();
const { ethers } = require("ethers");
const puppeteer = require("puppeteer");
const pinataSDK = require("@pinata/sdk");
const { Readable } = require("stream");
require("dotenv").config();

const { CivicSoulboundNFTABI } = require("./nft-abi");
const response = require("./response");

/* 
  NB: we are using base testnet, 
  so make sure to deploy your contract on the base sepolia testnet 
*/

function getContract() {
  try {
    const alchemyUrl = process.env.BASE_SEPOLIA_RPC_URL;
    const privateKey = process.env.PRIVATE_KEY;
    const contractAddress = process.env.CONTRACT_ADDRESS;

    if (!alchemyUrl || !privateKey || !contractAddress) {
      throw new Error("Missing required environment variables");
    }

    const provider = new ethers.providers.JsonRpcProvider(alchemyUrl);
    const wallet = new ethers.Wallet(privateKey, provider);

    // Create contract instance with the ABI
    const contract = new ethers.Contract(
      contractAddress,
      CivicSoulboundNFTABI,
      wallet
    );

    return contract;
  } catch (error) {
    console.error("Error in getContract:", error);
    throw error;
  }
}

async function connectWallet() {
  try {
    const alchemyUrl = process.env.BASE_SEPOLIA_RPC_URL;
    const privateKey = process.env.PRIVATE_KEY;

    if (!alchemyUrl || !privateKey) {
      throw new Error(
        "Missing required environment variables for wallet connection"
      );
    }

    const provider = new ethers.providers.JsonRpcProvider(alchemyUrl);
    const wallet = new ethers.Wallet(privateKey, provider);

    return wallet;
  } catch (error) {
    console.error("Error in connectWallet:", error);
    throw error;
  }
}

async function generateHTML(variables) {
  const { name, role, issueDate, walletAddress } = variables;

  // Format wallet address for display (first 6 and last 4 characters)
  const formattedWallet = walletAddress
    ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(
        walletAddress.length - 4
      )}`
    : "Not Connected";

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Civic ID Card</title>
  <style>
    body {
      font-family: 'Segoe UI', Roboto, Arial, sans-serif;
      background-color: #f5f7fa;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      padding: 20px;
    }
    
    .card {
      background: linear-gradient(135deg, #1b7e3d 0%, #25a04d 100%);
      border-radius: 24px;
      padding: 35px;
      width: 100%;
      max-width: 650px; /* Increased from 500px to 650px */
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
      position: relative;
      overflow: hidden;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    
    .card:hover {
      transform: translateY(-5px);
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
    }
    
    .card::before {
      content: "";
      position: absolute;
      top: -80px;
      right: -80px;
      width: 200px;
      height: 200px;
      background-color: rgba(167, 233, 188, 0.1);
      border-radius: 50%;
    }
    
    .card::after {
      content: "";
      position: absolute;
      bottom: -60px;
      left: -60px;
      width: 150px;
      height: 150px;
      background-color: rgba(167, 233, 188, 0.08);
      border-radius: 50%;
    }
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      position: relative;
      z-index: 1;
    }
    
    .card-title {
      color: #fff;
      font-size: 28px;
      font-weight: 800;
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .card-logo {
      background-color: rgba(255, 255, 255, 0.95);
      border-radius: 50%;
      width: 48px;
      height: 48px;
      display: flex;
      justify-content: center;
      align-items: center;
      font-weight: bold;
      font-size: 18px;
      color: #1b7e3d;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
    
    .card-content {
      display: flex;
      flex-direction: column;
      gap: 30px;
      position: relative;
      z-index: 1;
    }
    
    .photo-container {
      width: 100%;
      height: 240px; /* Increased from 200px to 240px */
      border-radius: 16px;
      overflow: hidden;
      background-color: #e0e0e0;
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
      position: relative;
    }
    
    .photo {
      width: 100%;
      height: 100%;
      object-fit: cover; /* This makes the image fill the container */
      display: block;
      transition: transform 0.3s ease;
    }
    
    .photo-container:hover .photo {
      transform: scale(1.05);
    }
    
    .details {
      color: #fff;
      background-color: rgba(0, 0, 0, 0.15);
      border-radius: 16px;
      padding: 25px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
    
    .field {
      margin-bottom: 22px;
    }
    
    .field:last-child {
      margin-bottom: 0;
    }
    
    .field-label {
      color: #a7e9bc;
      font-size: 14px;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      font-weight: 600;
      display: flex;
      align-items: center;
    }
    
    .field-value {
      font-weight: 600;
      margin: 0;
      font-size: 18px;
      letter-spacing: 0.5px;
    }
    
    .wallet-address {
      display: flex;
      gap: 6px;
      margin-top: 10px;
      flex-wrap: wrap;
      font-family: monospace;
    }
    
    .wallet-digit {
      width: 30px;
      height: 36px;
      background-color: white;
      border-radius: 8px;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 16px;
      font-weight: 600;
      color: #1b7e3d;
      box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    
    .wallet-digit:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }
    
    .issue-date {
      color: #a7e9bc;
      font-size: 13px;
      margin-top: 15px;
      text-align: right;
      font-style: italic;
    }
    
    @media (min-width: 768px) {
      .card-content {
        flex-direction: row;
      }
      
      .photo-container {
        width: 45%; /* Increased from 40% to 45% */
        height: auto;
        min-height: 280px; /* Increased from 250px to 280px */
      }
      
      .details {
        width: 55%; /* Adjusted from 60% to 55% */
        margin-left: 24px;
      }
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="card-header">
      <h1 class="card-title">Civic ID</h1>
      <div class="card-logo">CI</div>
    </div>
    
    <div class="card-content">
      <div class="photo-container">
        <img src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png" alt="Profile Avatar" class="photo">
      </div>
      
      <div class="details">
        <div class="field">
          <div class="field-label">Name</div>
          <p class="field-value">${name}</p>
        </div>
        
        <div class="field">
          <div class="field-label">Role</div>
          <p class="field-value">${role}</p>
        </div>
        
        <div class="field">
          <div class="field-label">Wallet Address</div>
          <div class="wallet-address">
            ${formattedWallet
              .split("")
              .map((char) => `<div class="wallet-digit">${char}</div>`)
              .join("")}
          </div>
        </div>

        <div class="issue-date">
          Issued: ${issueDate}
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;

  return html;
}

async function createHTMLCertificate(name, role, issueDate, walletAddress) {
  try {
    // Create a dynamic HTML string for the certificate
    const html = await generateHTML({ name, role, issueDate, walletAddress });

    // Launch Puppeteer with proper configuration
    const browser = await puppeteer.launch({
      headless: true, // Ensure headless mode is enabled
      args: [
        "--no-sandbox", // Disable sandboxing for Render compatibility
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage", // Prevent shared memory issues
        "--disable-gpu", // Disable GPU acceleration
        "--no-zygote",
        "--single-process",
      ],
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH, // Use pre-installed Chromium
    });

    const page = await browser.newPage();

    // Set the HTML content of the page
    await page.setContent(html, { waitUntil: "domcontentloaded" });

    // Take a screenshot of the Civic ID
    const screenshot = await page.screenshot({ type: "png", fullPage: true });

    // Close the browser
    await browser.close();

    console.log("Generated image buffer size:", screenshot.length);

    return screenshot;
  } catch (error) {
    console.error("Error in createHTMLCertificate:", error);
    throw new Error("Failed to generate the Civic ID SoulboundNFT.");
  }
}

async function saveToPinata(file, name, role) {
  try {
    if (!process.env.PINATA_API_KEY || !process.env.PINATA_SECRET_KEY) {
      throw new Error("Missing Pinata API credentials");
    }

    // Initialize the Pinata client
    const pinata = new pinataSDK(
      process.env.PINATA_API_KEY,
      process.env.PINATA_SECRET_KEY
    );

    // Convert the screenshot buffer to a ReadableStream
    const readableStreamForFile = new Readable();
    readableStreamForFile.push(file);
    readableStreamForFile.push(null);

    // Upload the image file to Pinata
    const imageResult = await pinata.pinFileToIPFS(readableStreamForFile, {
      pinataMetadata: { name: `Civic ID for ${name}` },
    });
    const imageURL = `https://gateway.pinata.cloud/ipfs/${imageResult.IpfsHash}`;

    console.log("Uploaded image URL:", imageURL);

    // Now create a metadata object, for OpenSea to read from
    const metadata = {
      name: `Civic Identity Verification for ${name}`,
      description: `This is a proof of ${name}'s verified civic identity as a ${role}`,
      image: imageURL,
      attributes: [
        { trait_type: "Name", value: name },
        { trait_type: "Role", value: role },
      ],
    };

    // Convert the metadata object to a JSON string
    const metadataJSON = JSON.stringify(metadata);

    // Convert the metadata JSON string to a buffer
    const metadataBuffer = Buffer.from(metadataJSON);

    // Convert the metadata buffer to a ReadableStream
    const readableStreamForMetadata = new Readable();
    readableStreamForMetadata.push(metadataBuffer);
    readableStreamForMetadata.push(null);

    // Upload the metadata file to Pinata
    const metadataResult = await pinata.pinFileToIPFS(
      readableStreamForMetadata,
      { pinataMetadata: { name: `Metadata for ${imageResult.IpfsHash}` } }
    );

    // Return the direct metadata URL
    return `https://gateway.pinata.cloud/ipfs/${metadataResult.IpfsHash}`;
  } catch (error) {
    console.error("Error in saveToPinata:", error);
    throw error;
  }
}

module.exports = function () {
  router.post("/nftmint", async (req, res) => {
    try {
      const { name, role } = req.body;

      if (!name || !role) {
        return res.status(400).json({
          status: 400,
          message: "Missing required fields: name and role are required",
          data: null,
        });
      }

      // Connect wallet and get the recipient address
      const wallet = await connectWallet();
      const receipient = wallet.address;

      const issueDate = new Date().toDateString();
      const soulboundNFT = { name, role, receipient, issueDate };

      const file = await createHTMLCertificate(
        soulboundNFT.name,
        soulboundNFT.role,
        soulboundNFT.issueDate,
        soulboundNFT.receipient
      );

      const tokenURI = await saveToPinata(
        file,
        soulboundNFT.name,
        soulboundNFT.role
      );

      console.log({ tokenURI });

      const contract = getContract();

      try {
        // First estimate gas
        const gasEstimate = await contract.estimateGas.issueCertificate(
          soulboundNFT.receipient,
          tokenURI
        );

        // Then send the transaction with the creator paying the gas fee
        const tx = await contract.issueCertificate(
          soulboundNFT.receipient,
          tokenURI,
          {
            gasLimit: gasEstimate.mul(110).div(100), // Add 10% buffer
            from: wallet.address, // Ensure the creator pays the gas fee
          }
        );

        // Wait for the transaction to be mined
        const receipt = await tx.wait();

        res.json({
          status: 200,
          message: "Civic Identity Verification NFT minted successfully",
          data: {
            ...soulboundNFT,
            transactionHash: receipt.transactionHash,
          },
        });
      } catch (txError) {
        console.error("Transaction error:", txError);
        throw new Error(`Transaction failed: ${txError.message}`);
      }
    } catch (error) {
      console.error("Error in NFT minting:", error);
      res.status(500).json({
        status: 500,
        message: error.message || "Internal server error",
        data: null,
      });
    }
  });

  return router;
};
