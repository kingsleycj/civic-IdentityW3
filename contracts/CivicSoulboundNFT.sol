// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract CivicSoulboundNFT is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    constructor() ERC721("Civic ID", "CID") {}

    /**
     * @dev Public function to mint a new Civic ID NFT.
     * Any connected wallet can call this function to mint an NFT.
     */
    function issueCertificate(
        address recipient,
        string memory tokenURI
    ) public returns (uint256) {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _mint(recipient, newItemId);
        _setTokenURI(newItemId, tokenURI);
        return newItemId;
    }

    /**
     * @dev Override the transferFrom function to prevent transfers.
     */
    function transferFrom(
        address /* from */,
        address /* to */,
        uint256 /* tokenId */
    ) public virtual override(ERC721, IERC721) {
        revert("Soulbound NFTs cannot be transferred.");
    }

    /**
     * @dev Override the safeTransferFrom function to prevent transfers.
     */
    function safeTransferFrom(
        address /* from */,
        address /* to */,
        uint256 /* tokenId */
    ) public virtual override(ERC721, IERC721) {
        revert("Soulbound NFTs cannot be transferred.");
    }

    /**
     * @dev Override the safeTransferFrom function with data to prevent transfers.
     */
    function safeTransferFrom(
        address /* from */,
        address /* to */,
        uint256 /* tokenId */,
        bytes memory /* data */
    ) public virtual override(ERC721, IERC721) {
        revert("Soulbound NFTs cannot be transferred.");
    }
}