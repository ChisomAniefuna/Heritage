// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

/**
 * @title BankStatementNFT
 * @dev NFT contract for bank statements with on-chain metadata and IPFS storage
 * Each bank statement becomes a unique, verifiable NFT
 */
contract BankStatementNFT is ERC721, ERC721URIStorage, ERC721Enumerable, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    using Strings for uint256;
    
    Counters.Counter private _tokenIds;
    
    struct StatementMetadata {
        string bankName;
        string accountNumber; // Masked for privacy
        string statementDate;
        string statementPeriod;
        string balance;
        uint256 transactionCount;
        string fileHash;
        string ipfsHash;
        uint256 uploadTimestamp;
        bool verified;
        string statementType; // "monthly", "quarterly", "annual"
    }
    
    // Mapping from token ID to statement metadata
    mapping(uint256 => StatementMetadata) public statementData;
    
    // Mapping from file hash to token ID (prevents duplicates)
    mapping(string => uint256) public hashToTokenId;
    
    // Mapping from owner to their statement token IDs
    mapping(address => uint256[]) public ownerStatements;
    
    // Base URI for metadata
    string private _baseTokenURI;
    
    // Events
    event StatementNFTMinted(
        uint256 indexed tokenId,
        address indexed owner,
        string bankName,
        string statementDate,
        string ipfsHash,
        uint256 timestamp
    );
    
    event StatementVerified(
        uint256 indexed tokenId,
        address indexed verifier,
        uint256 timestamp
    );
    
    event MetadataUpdated(
        uint256 indexed tokenId,
        string newIpfsHash,
        uint256 timestamp
    );
    
    constructor(string memory name, string memory symbol) ERC721(name, symbol) {}
    
    /**
     * @dev Mint a new bank statement NFT
     * @param to Address to mint the NFT to
     * @param bankName Name of the bank
     * @param accountNumber Masked account number
     * @param statementDate Date of the statement
     * @param statementPeriod Period covered by statement
     * @param balance Account balance
     * @param transactionCount Number of transactions
     * @param fileHash SHA-256 hash of the original file
     * @param ipfsHash IPFS hash where file is stored
     * @param statementType Type of statement
     * @return tokenId The newly minted token ID
     */
    function mintStatementNFT(
        address to,
        string memory bankName,
        string memory accountNumber,
        string memory statementDate,
        string memory statementPeriod,
        string memory balance,
        uint256 transactionCount,
        string memory fileHash,
        string memory ipfsHash,
        string memory statementType
    ) external nonReentrant returns (uint256) {
        require(bytes(fileHash).length > 0, "File hash cannot be empty");
        require(hashToTokenId[fileHash] == 0, "Statement already exists as NFT");
        require(bytes(bankName).length > 0, "Bank name cannot be empty");
        require(bytes(ipfsHash).length > 0, "IPFS hash cannot be empty");
        
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        // Store statement metadata
        statementData[newTokenId] = StatementMetadata({
            bankName: bankName,
            accountNumber: accountNumber,
            statementDate: statementDate,
            statementPeriod: statementPeriod,
            balance: balance,
            transactionCount: transactionCount,
            fileHash: fileHash,
            ipfsHash: ipfsHash,
            uploadTimestamp: block.timestamp,
            verified: true,
            statementType: statementType
        });
        
        // Map file hash to token ID
        hashToTokenId[fileHash] = newTokenId;
        
        // Add to owner's statements
        ownerStatements[to].push(newTokenId);
        
        // Mint the NFT
        _safeMint(to, newTokenId);
        
        // Set token URI with on-chain metadata
        string memory tokenURI = generateTokenURI(newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        
        emit StatementNFTMinted(
            newTokenId,
            to,
            bankName,
            statementDate,
            ipfsHash,
            block.timestamp
        );
        
        return newTokenId;
    }
    
    /**
     * @dev Generate on-chain metadata for the NFT
     * @param tokenId The token ID
     * @return Base64 encoded JSON metadata
     */
    function generateTokenURI(uint256 tokenId) public view returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        
        StatementMetadata memory stmt = statementData[tokenId];
        
        // Create JSON metadata
        string memory json = string(abi.encodePacked(
            '{"name": "Bank Statement #', tokenId.toString(),
            '", "description": "Verified bank statement NFT from ', stmt.bankName,
            ' for account ', stmt.accountNumber,
            '", "image": "data:image/svg+xml;base64,', generateSVGImage(tokenId),
            '", "external_url": "https://ipfs.io/ipfs/', stmt.ipfsHash,
            '", "attributes": [',
            generateAttributes(tokenId),
            ']}'
        ));
        
        return string(abi.encodePacked(
            "data:application/json;base64,",
            Base64.encode(bytes(json))
        ));
    }
    
    /**
     * @dev Generate SVG image for the NFT
     * @param tokenId The token ID
     * @return Base64 encoded SVG
     */
    function generateSVGImage(uint256 tokenId) public view returns (string memory) {
        StatementMetadata memory stmt = statementData[tokenId];
        
        string memory svg = string(abi.encodePacked(
            '<svg width="400" height="600" xmlns="http://www.w3.org/2000/svg">',
            '<defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">',
            '<stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />',
            '<stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />',
            '</linearGradient></defs>',
            '<rect width="400" height="600" fill="url(#grad)" rx="20"/>',
            '<rect x="20" y="20" width="360" height="560" fill="white" rx="15" opacity="0.95"/>',
            '<text x="200" y="60" text-anchor="middle" font-family="Arial" font-size="24" font-weight="bold" fill="#333">',
            'Bank Statement NFT</text>',
            '<text x="200" y="90" text-anchor="middle" font-family="Arial" font-size="16" fill="#666">#', tokenId.toString(), '</text>',
            '<line x1="40" y1="110" x2="360" y2="110" stroke="#ddd" stroke-width="2"/>',
            '<text x="50" y="150" font-family="Arial" font-size="18" font-weight="bold" fill="#333">Bank:</text>',
            '<text x="50" y="175" font-family="Arial" font-size="16" fill="#666">', stmt.bankName, '</text>',
            '<text x="50" y="220" font-family="Arial" font-size="18" font-weight="bold" fill="#333">Account:</text>',
            '<text x="50" y="245" font-family="Arial" font-size="16" fill="#666">', stmt.accountNumber, '</text>',
            '<text x="50" y="290" font-family="Arial" font-size="18" font-weight="bold" fill="#333">Date:</text>',
            '<text x="50" y="315" font-family="Arial" font-size="16" fill="#666">', stmt.statementDate, '</text>',
            '<text x="50" y="360" font-family="Arial" font-size="18" font-weight="bold" fill="#333">Balance:</text>',
            '<text x="50" y="385" font-family="Arial" font-size="16" fill="#666">', stmt.balance, '</text>',
            '<text x="50" y="430" font-family="Arial" font-size="18" font-weight="bold" fill="#333">Transactions:</text>',
            '<text x="50" y="455" font-family="Arial" font-size="16" fill="#666">', stmt.transactionCount.toString(), '</text>',
            '<rect x="40" y="500" width="320" height="60" fill="#f8f9fa" rx="10"/>',
            '<text x="200" y="525" text-anchor="middle" font-family="Arial" font-size="14" font-weight="bold" fill="#333">Verified Statement</text>',
            '<text x="200" y="545" text-anchor="middle" font-family="Arial" font-size="12" fill="#666">Blockchain Verified</text>',
            '</svg>'
        ));
        
        return Base64.encode(bytes(svg));
    }
    
    /**
     * @dev Generate attributes for NFT metadata
     * @param tokenId The token ID
     * @return JSON attributes string
     */
    function generateAttributes(uint256 tokenId) public view returns (string memory) {
        StatementMetadata memory stmt = statementData[tokenId];
        
        return string(abi.encodePacked(
            '{"trait_type": "Bank", "value": "', stmt.bankName, '"},',
            '{"trait_type": "Statement Type", "value": "', stmt.statementType, '"},',
            '{"trait_type": "Statement Date", "value": "', stmt.statementDate, '"},',
            '{"trait_type": "Transaction Count", "value": ', stmt.transactionCount.toString(), '},',
            '{"trait_type": "Verified", "value": "', stmt.verified ? 'Yes' : 'No', '"},',
            '{"trait_type": "Upload Year", "value": "', getYear(stmt.uploadTimestamp).toString(), '"}'
        ));
    }
    
    /**
     * @dev Get year from timestamp
     * @param timestamp Unix timestamp
     * @return Year as uint256
     */
    function getYear(uint256 timestamp) public pure returns (uint256) {
        // Simple year calculation (approximate)
        return 1970 + (timestamp / 365 days);
    }
    
    /**
     * @dev Get statement metadata by token ID
     * @param tokenId The token ID
     * @return Statement metadata
     */
    function getStatementMetadata(uint256 tokenId) external view returns (StatementMetadata memory) {
        require(_exists(tokenId), "Token does not exist");
        return statementData[tokenId];
    }
    
    /**
     * @dev Get token ID by file hash
     * @param fileHash The file hash
     * @return Token ID (0 if not found)
     */
    function getTokenIdByHash(string memory fileHash) external view returns (uint256) {
        return hashToTokenId[fileHash];
    }
    
    /**
     * @dev Get all statement NFTs owned by an address
     * @param owner The owner address
     * @return Array of token IDs
     */
    function getStatementsByOwner(address owner) external view returns (uint256[] memory) {
        return ownerStatements[owner];
    }
    
    /**
     * @dev Verify a statement NFT (only owner or contract owner)
     * @param tokenId The token ID to verify
     */
    function verifyStatement(uint256 tokenId) external {
        require(_exists(tokenId), "Token does not exist");
        require(
            ownerOf(tokenId) == msg.sender || owner() == msg.sender,
            "Only token owner or contract owner can verify"
        );
        
        statementData[tokenId].verified = true;
        
        // Update token URI with new verification status
        string memory newTokenURI = generateTokenURI(tokenId);
        _setTokenURI(tokenId, newTokenURI);
        
        emit StatementVerified(tokenId, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Update IPFS hash for a statement NFT (only owner)
     * @param tokenId The token ID
     * @param newIpfsHash New IPFS hash
     */
    function updateStatementIPFS(uint256 tokenId, string memory newIpfsHash) external {
        require(_exists(tokenId), "Token does not exist");
        require(ownerOf(tokenId) == msg.sender, "Only token owner can update");
        require(bytes(newIpfsHash).length > 0, "IPFS hash cannot be empty");
        
        statementData[tokenId].ipfsHash = newIpfsHash;
        
        // Update token URI with new IPFS hash
        string memory newTokenURI = generateTokenURI(tokenId);
        _setTokenURI(tokenId, newTokenURI);
        
        emit MetadataUpdated(tokenId, newIpfsHash, block.timestamp);
    }
    
    /**
     * @dev Check if a statement exists by file hash
     * @param fileHash The file hash to check
     * @return True if statement NFT exists
     */
    function statementExists(string memory fileHash) external view returns (bool) {
        return hashToTokenId[fileHash] != 0;
    }
    
    /**
     * @dev Get total number of statement NFTs
     * @return Total supply
     */
    function getTotalStatements() external view returns (uint256) {
        return totalSupply();
    }
    
    /**
     * @dev Set base URI for token metadata (only owner)
     * @param baseURI The base URI
     */
    function setBaseURI(string memory baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }
    
    /**
     * @dev Get base URI
     * @return Base URI string
     */
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
    
    // Override required functions
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
        
        // Update owner statements mapping on transfer
        if (from != address(0) && to != address(0)) {
            // Remove from old owner
            uint256[] storage fromStatements = ownerStatements[from];
            for (uint256 i = 0; i < fromStatements.length; i++) {
                if (fromStatements[i] == tokenId) {
                    fromStatements[i] = fromStatements[fromStatements.length - 1];
                    fromStatements.pop();
                    break;
                }
            }
            
            // Add to new owner
            ownerStatements[to].push(tokenId);
        }
    }
    
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
    
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Enumerable, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}