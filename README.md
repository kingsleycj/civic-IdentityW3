# Civic Identity NFT Minting Application

This project is an extension of **Civic Link**,  this repository contains the **Civic Identity App**, it allows users to connect their wallets, verify their identity, and mint a **Soulbound NFT** as a form of digital ID. The application is built using **Node.js**, **Express**, and **Ethers.js**, and it integrates with **Pinata** for IPFS storage and the **Base Sepolia Testnet** for blockchain interactions. Also, because we're considering new WEB3 users that may not have ETH, we made the gas fee payment free for those minting their Civic IDs, and the payment done by a gas bank which is the creator of the smart contract.

---

## Features

1. **Wallet Connection**:
   - Users connect their wallets to the application.
   - The connected wallet address serves as the recipient of the minted NFT.

2. **Identity Verification**:
   - Users provide their name and role, which are used to generate a dynamic HTML Civic ID NFT.

3. **NFT Minting**:
   - The certificate is converted into an image and uploaded to IPFS using Pinata.
   - Metadata for the NFT is created and uploaded to IPFS.
   - The NFT is minted on the **Base Sepolia Testnet**, with the creator (private key in `.env`) paying the gas fees.

4. **Dynamic HTML for Civic ID**:
   - A visually appealing ID is generated, including:
     - Name
     - Role
     - Wallet Address
     - Issue Date
     - Profile Avatar

5. **Gas Fee Payment**:
   - The creator of the NFT (address in `.env`) pays the gas fees for minting.

6. **Optional OpenSea Testnet Integration**:
   - The minted NFT can be viewed on OpenSea's testnet marketplace.

---

## Prerequisites

1. **Node.js** and **npm** installed on your system.
2. A wallet with test ETH on the **Base Sepolia Testnet**.
3. A `.env` file with the following variables:
   ```plaintext
   BASE_SEPOLIA_RPC_URL=<your-alchemy-or-infura-url>
   PRIVATE_KEY=<your-private-key>
   CONTRACT_ADDRESS=<your-deployed-contract-address>
   PINATA_API_KEY=<your-pinata-api-key>
   PINATA_SECRET_KEY=<your-pinata-secret-key>
   ```

---

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/kingsleycj/civic-IdentityW3.git
   cd nft-mint
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add the required environment variables.

4. Start the server:
   ```bash
   node nft-router.js
   ```
   or 
   ```
   npm run dev
   ```

---

## API Documentation

### **POST https://civic-identityw3.onrender.com/api/v1/nftmint**

#### Description:
Mint a Civic Identity NFT for a user.

#### Request Body:
```json
{
  "name": "Sophia Abubakar",
  "role": "Civilian"
}
```

#### Response:
- **Success (200)**:
  ```json
  {
    "status": 200,
    "message": "Civic Identity Verification NFT minted successfully",
    "data": {
      "name": "Sophia Abubakar",
      "role": "Civilian",
      "receipient": "0x1234...abcd",
      "issueDate": "Fri Apr 11 2025",
      "transactionHash": "0x5678...efgh"
    }
  }
  ```
- **Error (400)**:
  ```json
  {
    "status": 400,
    "message": "Missing required fields: name and role are required",
    "data": null
  }
  ```
- **Error (500)**:
  ```json
  {
    "status": 500,
    "message": "Internal server error",
    "data": null
  }
  ```

---

## How It Works

1. **Wallet Connection**:
   - The backend connects to the creator's wallet using the private key in `.env`.

2. **Civic ID Generation**:
   - A dynamic HTML ID is generated using the user's name, role, wallet address, and issue date.
   - The Civic ID includes a profile avatar.

3. **NFT Metadata Creation**:
   - The Civic ID is converted into an image using Puppeteer.
   - The image and metadata are uploaded to IPFS via Pinata.

4. **NFT Minting**:
   - The NFT is minted on the **Base Sepolia Testnet**.
   - The creator's wallet pays the gas fees.

5. **Response**:
   - The API returns the transaction hash and other details.

---

## Frontend Integration Guide

1. **Wallet Connection**:
   - Use a library like `ethers.js` to connect the user's wallet.
   - Example:
     ```javascript
     async function connectWallet() {
       if (window.ethereum) {
         const provider = new ethers.providers.Web3Provider(window.ethereum);
         await provider.send("eth_requestAccounts", []);
         const signer = provider.getSigner();
         const walletAddress = await signer.getAddress();
         return walletAddress;
       } else {
         throw new Error("No Ethereum wallet detected");
       }
     }
     ```

2. **Mint Civic ID**:
   - Send a POST request to `/nftmint` with the user's name and role.
   - Example:
The backend provides an endpoint (`/nftmint`) to mint Civic IDs. Below is a code snippet for the frontend team to implement the minting functionality:

```javascript
async function mintCivicID(name, role) {
  try {
    // Validate input fields
    if (!name || !role) {
      throw new Error("Name and role are required to mint the Civic ID.");
    }

    // Send a POST request to the backend API
    const response = await fetch("https://civic-identityw3.onrender.com/api/v1/nftmint", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, role }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log("Civic ID minted successfully:", data);
      alert(`Civic ID minted successfully! Transaction Hash: ${data.data.transactionHash}`);
    } else {
      console.error("Error minting Civic ID:", data.message);
      alert(`Error: ${data.message}`);
    }
  } catch (error) {
    console.error("Error in mintCivicID function:", error);
    alert("An error occurred while minting the Civic ID. Check the console for details.");
  }
}

// Example usage:
// Call this function when the user clicks the "Mint Civic ID" button
// mintCivicID("Sophia Abubakar", "Civilian");
```

3. **View NFT on OpenSea Testnet**:
   - After minting, use the transaction hash to find the NFT on OpenSea's testnet marketplace:
     - URL format: `https://testnets.opensea.io/assets/<contract-address>/<token-id>`

---

## Testing the Application

1. **Test the Wallet Connection**:
   - Use Postman or cURL to send a POST request to `/nftmint`.
   - Verify the connected wallet address in the server logs.

2. **Test the NFT Minting**:
   - Check the transaction hash in the response.
   - Use a blockchain explorer (e.g., Etherscan for Base Sepolia) to verify the transaction.

3. **Test the OpenSea Integration**:
   - Use the [contract address](https://testnets.opensea.io/assets/base_sepolia/0xf8c55535dbcc22b67da42d409ee91e6ae11969f3/) to view all Civic-ID NFTs minted through that contract address 
   
4. **Viewing NFT on Metamask** 
   - Use token ID to view the NFT on Base Seoplia Network.

---

## Dependencies

- **Node.js**: Backend runtime.
- **Express**: Web framework.
- **Ethers.js**: Blockchain interaction.
- **Puppeteer**: HTML to image conversion.
- **Pinata SDK**: IPFS integration.

---

## Notes

- Ensure the creator's wallet has sufficient test ETH for gas fees.
- The application is configured for the **Base Sepolia Testnet**. Update the `.env` file for other networks if needed.
- The profile avatar in the certificate is currently static. Update the `src` attribute in the `photo-container` section of the `generateHTML` function to make it dynamic.
- The contact-abi in `nft-abi.js` was inserted after the contract was deployed and verified on the **Base Sepolia Network**, so before proceeding with running the application. Ensure that you have **compiled**, **deployed** and **verified** the contract.
---

## Screenshots

> API Tests ![API Tests](<./screenshots/api-tests.png>)

> OpenSea Testnet: To view minted Civic ID ![Civic ID](<./screenshots/opensea_civicid.png>)

---

## Deliverables

- [Civic Link Web3 Project Live Link](https://civic-link-five.vercel.app/)
- [Verified Smart Contract](https://base-sepolia.blockscout.com/address/0xf8c55535dbcc22b67da42d409ee91e6ae11969f3?tab=contract)
- [View All Minted Civc IDs on OpenSea Testnet](https://testnets.opensea.io/collection/civic-id-1)
