// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title BankStatementStorage
 * @dev Smart contract for storing bank statement metadata on-chain
 * Files are stored on IPFS, only metadata and hashes are stored on-chain
 */
contract BankStatementStorage is Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    Counters.Counter private _statementIds;
    
    struct BankStatement {
        uint256 id;
        string statementHash;
        string bankName;
        string accountNumber;
        string statementDate;
        string ipfsHash;
        uint256 timestamp;
        address owner;
        bool verified;
        bool exists;
    }
    
    // Mapping from statement hash to statement data
    mapping(string => BankStatement) public statements;
    
    // Mapping from owner address to their statement hashes
    mapping(address => string[]) public ownerStatements;
    
    // Mapping to track if a statement hash already exists
    mapping(string => bool) public statementExists;
    
    // Events
    event StatementUploaded(
        uint256 indexed id,
        string indexed statementHash,
        address indexed owner,
        string bankName,
        string ipfsHash,
        uint256 timestamp
    );
    
    event StatementVerified(
        string indexed statementHash,
        address indexed verifier,
        uint256 timestamp
    );
    
    event StatementUpdated(
        string indexed statementHash,
        address indexed owner,
        string newIpfsHash,
        uint256 timestamp
    );
    
    /**
     * @dev Upload a new bank statement
     * @param _statementHash SHA-256 hash of the statement file
     * @param _bankName Name of the bank
     * @param _accountNumber Account number (should be masked for privacy)
     * @param _statementDate Date of the statement
     * @param _ipfsHash IPFS hash where the file is stored
     * @param _timestamp Timestamp of the statement
     */
    function uploadStatement(
        string memory _statementHash,
        string memory _bankName,
        string memory _accountNumber,
        string memory _statementDate,
        string memory _ipfsHash,
        uint256 _timestamp
    ) external nonReentrant {
        require(bytes(_statementHash).length > 0, "Statement hash cannot be empty");
        require(bytes(_bankName).length > 0, "Bank name cannot be empty");
        require(bytes(_ipfsHash).length > 0, "IPFS hash cannot be empty");
        require(!statementExists[_statementHash], "Statement already exists");
        
        _statementIds.increment();
        uint256 newStatementId = _statementIds.current();
        
        BankStatement memory newStatement = BankStatement({
            id: newStatementId,
            statementHash: _statementHash,
            bankName: _bankName,
            accountNumber: _accountNumber,
            statementDate: _statementDate,
            ipfsHash: _ipfsHash,
            timestamp: _timestamp,
            owner: msg.sender,
            verified: true, // Auto-verify for now, can add verification logic later
            exists: true
        });
        
        statements[_statementHash] = newStatement;
        ownerStatements[msg.sender].push(_statementHash);
        statementExists[_statementHash] = true;
        
        emit StatementUploaded(
            newStatementId,
            _statementHash,
            msg.sender,
            _bankName,
            _ipfsHash,
            _timestamp
        );
    }
    
    /**
     * @dev Get statement by hash
     * @param _statementHash The statement hash to lookup
     * @return The statement data
     */
    function getStatement(string memory _statementHash) 
        external 
        view 
        returns (BankStatement memory) 
    {
        require(statementExists[_statementHash], "Statement does not exist");
        return statements[_statementHash];
    }
    
    /**
     * @dev Get all statement hashes for an owner
     * @param _owner The owner address
     * @return Array of statement hashes
     */
    function getStatementsByOwner(address _owner) 
        external 
        view 
        returns (string[] memory) 
    {
        return ownerStatements[_owner];
    }
    
    /**
     * @dev Get total number of statements
     * @return Total count of statements
     */
    function getTotalStatements() external view returns (uint256) {
        return _statementIds.current();
    }
    
    /**
     * @dev Verify a statement (only owner or contract owner)
     * @param _statementHash The statement hash to verify
     */
    function verifyStatement(string memory _statementHash) external {
        require(statementExists[_statementHash], "Statement does not exist");
        
        BankStatement storage statement = statements[_statementHash];
        require(
            msg.sender == statement.owner || msg.sender == owner(),
            "Only statement owner or contract owner can verify"
        );
        
        statement.verified = true;
        
        emit StatementVerified(_statementHash, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Update IPFS hash for a statement (only owner)
     * @param _statementHash The statement hash
     * @param _newIpfsHash New IPFS hash
     */
    function updateStatementIPFS(
        string memory _statementHash,
        string memory _newIpfsHash
    ) external {
        require(statementExists[_statementHash], "Statement does not exist");
        require(bytes(_newIpfsHash).length > 0, "IPFS hash cannot be empty");
        
        BankStatement storage statement = statements[_statementHash];
        require(msg.sender == statement.owner, "Only statement owner can update");
        
        statement.ipfsHash = _newIpfsHash;
        
        emit StatementUpdated(_statementHash, msg.sender, _newIpfsHash, block.timestamp);
    }
    
    /**
     * @dev Check if a statement exists
     * @param _statementHash The statement hash to check
     * @return True if statement exists
     */
    function doesStatementExist(string memory _statementHash) 
        external 
        view 
        returns (bool) 
    {
        return statementExists[_statementHash];
    }
    
    /**
     * @dev Get statement count for an owner
     * @param _owner The owner address
     * @return Number of statements owned
     */
    function getStatementCount(address _owner) external view returns (uint256) {
        return ownerStatements[_owner].length;
    }
    
    /**
     * @dev Emergency function to remove a statement (only contract owner)
     * @param _statementHash The statement hash to remove
     */
    function removeStatement(string memory _statementHash) external onlyOwner {
        require(statementExists[_statementHash], "Statement does not exist");
        
        BankStatement storage statement = statements[_statementHash];
        address statementOwner = statement.owner;
        
        // Remove from owner's statements array
        string[] storage ownerStmts = ownerStatements[statementOwner];
        for (uint256 i = 0; i < ownerStmts.length; i++) {
            if (keccak256(bytes(ownerStmts[i])) == keccak256(bytes(_statementHash))) {
                ownerStmts[i] = ownerStmts[ownerStmts.length - 1];
                ownerStmts.pop();
                break;
            }
        }
        
        // Remove statement
        delete statements[_statementHash];
        statementExists[_statementHash] = false;
    }
}