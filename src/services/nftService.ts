import { ethers } from 'ethers';
import { ipfsService } from './ipfs';

export interface BankStatementNFTMetadata {
  bankName: string;
  accountNumber: string;
  statementDate: string;
  statementPeriod: string;
  balance: string;
  transactionCount: number;
  fileHash: string;
  ipfsHash: string;
  statementType: 'monthly' | 'quarterly' | 'annual';
}

export interface NFTMintResult {
  tokenId: number;
  transactionHash: string;
  nftAddress: string;
  tokenURI: string;
  openseaUrl: string;
}

class BankStatementNFTService {
  private provider: ethers.Provider | null = null;
  private wallet: ethers.Wallet | null = null;
  private contractAddress: string = '';
  private contract: ethers.Contract | null = null;

  // NFT Contract ABI (key functions)
  private readonly contractABI = [
    {
      "inputs": [
        {"name": "to", "type": "address"},
        {"name": "bankName", "type": "string"},
        {"name": "accountNumber", "type": "string"},
        {"name": "statementDate", "type": "string"},
        {"name": "statementPeriod", "type": "string"},
        {"name": "balance", "type": "string"},
        {"name": "transactionCount", "type": "uint256"},
        {"name": "fileHash", "type": "string"},
        {"name": "ipfsHash", "type": "string"},
        {"name": "statementType", "type": "string"}
      ],
      "name": "mintStatementNFT",
      "outputs": [{"name": "", "type": "uint256"}],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{"name": "tokenId", "type": "uint256"}],
      "name": "getStatementMetadata",
      "outputs": [
        {"name": "bankName", "type": "string"},
        {"name": "accountNumber", "type": "string"},
        {"name": "statementDate", "type": "string"},
        {"name": "statementPeriod", "type": "string"},
        {"name": "balance", "type": "string"},
        {"name": "transactionCount", "type": "uint256"},
        {"name": "fileHash", "type": "string"},
        {"name": "ipfsHash", "type": "string"},
        {"name": "uploadTimestamp", "type": "uint256"},
        {"name": "verified", "type": "bool"},
        {"name": "statementType", "type": "string"}
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{"name": "owner", "type": "address"}],
      "name": "getStatementsByOwner",
      "outputs": [{"name": "", "type": "uint256[]"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{"name": "fileHash", "type": "string"}],
      "name": "getTokenIdByHash",
      "outputs": [{"name": "", "type": "uint256"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{"name": "tokenId", "type": "uint256"}],
      "name": "tokenURI",
      "outputs": [{"name": "", "type": "string"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{"name": "tokenId", "type": "uint256"}],
      "name": "ownerOf",
      "outputs": [{"name": "", "type": "address"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "totalSupply",
      "outputs": [{"name": "", "type": "uint256"}],
      "stateMutability": "view",
      "type": "function"
    }
  ];

  // Initialize the service
  async initialize(
    privateKey: string,
    rpcUrl: string,
    contractAddress: string
  ): Promise<void> {
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.wallet = new ethers.Wallet(privateKey, this.provider);
    this.contractAddress = contractAddress;
    this.contract = new ethers.Contract(contractAddress, this.contractABI, this.wallet);
    
    console.log('Bank Statement NFT Service initialized');
  }

  // Convert bank statement to NFT
  async convertStatementToNFT(
    statementFile: ArrayBuffer,
    metadata: BankStatementNFTMetadata,
    ownerAddress: string
  ): Promise<NFTMintResult> {
    if (!this.contract || !this.wallet) {
      throw new Error('Service not initialized');
    }

    try {
      // Step 1: Upload file to IPFS
      console.log('Uploading statement to IPFS...');
      const ipfsResult = await ipfsService.uploadFile(
        statementFile,
        `statement_${metadata.bankName}_${metadata.statementDate}.pdf`,
        {
          bankName: metadata.bankName,
          accountNumber: metadata.accountNumber,
          statementDate: metadata.statementDate,
          type: 'bank_statement'
        }
      );

      // Step 2: Create enhanced metadata for NFT
      const enhancedMetadata = {
        ...metadata,
        ipfsHash: ipfsResult.hash
      };

      // Step 3: Upload metadata to IPFS
      console.log('Uploading metadata to IPFS...');
      const metadataResult = await ipfsService.uploadJSON(
        {
          name: `Bank Statement NFT - ${metadata.bankName}`,
          description: `Verified bank statement from ${metadata.bankName} for account ${metadata.accountNumber} dated ${metadata.statementDate}`,
          image: `data:image/svg+xml;base64,${this.generateNFTImage(metadata)}`,
          external_url: ipfsResult.url,
          attributes: [
            { trait_type: "Bank", value: metadata.bankName },
            { trait_type: "Statement Type", value: metadata.statementType },
            { trait_type: "Statement Date", value: metadata.statementDate },
            { trait_type: "Transaction Count", value: metadata.transactionCount },
            { trait_type: "Verified", value: "Yes" },
            { trait_type: "File Format", value: "PDF" }
          ],
          properties: {
            files: [
              {
                uri: ipfsResult.url,
                type: "application/pdf"
              }
            ],
            category: "document"
          }
        },
        `statement_metadata_${Date.now()}`
      );

      // Step 4: Mint NFT on blockchain
      console.log('Minting NFT on blockchain...');
      const tx = await this.contract.mintStatementNFT(
        ownerAddress,
        metadata.bankName,
        metadata.accountNumber,
        metadata.statementDate,
        metadata.statementPeriod,
        metadata.balance,
        metadata.transactionCount,
        metadata.fileHash,
        ipfsResult.hash,
        metadata.statementType
      );

      const receipt = await tx.wait();
      
      // Extract token ID from events
      const mintEvent = receipt.logs.find((log: any) => {
        try {
          const parsed = this.contract!.interface.parseLog(log);
          return parsed?.name === 'StatementNFTMinted';
        } catch {
          return false;
        }
      });

      if (!mintEvent) {
        throw new Error('Failed to find mint event in transaction receipt');
      }

      const parsedEvent = this.contract.interface.parseLog(mintEvent);
      const tokenId = parsedEvent?.args?.tokenId?.toNumber();

      if (!tokenId) {
        throw new Error('Failed to extract token ID from mint event');
      }

      // Step 5: Get token URI
      const tokenURI = await this.contract.tokenURI(tokenId);

      // Step 6: Generate OpenSea URL
      const network = await this.provider!.getNetwork();
      const openseaUrl = this.generateOpenSeaUrl(network.chainId, this.contractAddress, tokenId);

      console.log(`NFT minted successfully! Token ID: ${tokenId}`);

      return {
        tokenId,
        transactionHash: receipt.hash,
        nftAddress: this.contractAddress,
        tokenURI,
        openseaUrl
      };

    } catch (error) {
      console.error('Error converting statement to NFT:', error);
      throw new Error(`Failed to convert statement to NFT: ${error}`);
    }
  }

  // Generate NFT image (SVG)
  private generateNFTImage(metadata: BankStatementNFTMetadata): string {
    const svg = `
      <svg width="400" height="600" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="400" height="600" fill="url(#grad)" rx="20"/>
        <rect x="20" y="20" width="360" height="560" fill="white" rx="15" opacity="0.95"/>
        <text x="200" y="60" text-anchor="middle" font-family="Arial" font-size="24" font-weight="bold" fill="#333">Bank Statement NFT</text>
        <line x1="40" y1="80" x2="360" y2="80" stroke="#ddd" stroke-width="2"/>
        <text x="50" y="120" font-family="Arial" font-size="18" font-weight="bold" fill="#333">Bank:</text>
        <text x="50" y="145" font-family="Arial" font-size="16" fill="#666">${metadata.bankName}</text>
        <text x="50" y="180" font-family="Arial" font-size="18" font-weight="bold" fill="#333">Account:</text>
        <text x="50" y="205" font-family="Arial" font-size="16" fill="#666">${metadata.accountNumber}</text>
        <text x="50" y="240" font-family="Arial" font-size="18" font-weight="bold" fill="#333">Date:</text>
        <text x="50" y="265" font-family="Arial" font-size="16" fill="#666">${metadata.statementDate}</text>
        <text x="50" y="300" font-family="Arial" font-size="18" font-weight="bold" fill="#333">Balance:</text>
        <text x="50" y="325" font-family="Arial" font-size="16" fill="#666">${metadata.balance}</text>
        <text x="50" y="360" font-family="Arial" font-size="18" font-weight="bold" fill="#333">Transactions:</text>
        <text x="50" y="385" font-family="Arial" font-size="16" fill="#666">${metadata.transactionCount}</text>
        <rect x="40" y="420" width="320" height="80" fill="#f8f9fa" rx="10"/>
        <text x="200" y="445" text-anchor="middle" font-family="Arial" font-size="14" font-weight="bold" fill="#333">🏦 Verified Statement NFT</text>
        <text x="200" y="465" text-anchor="middle" font-family="Arial" font-size="12" fill="#666">Blockchain Verified • IPFS Stored</text>
        <text x="200" y="485" text-anchor="middle" font-family="Arial" font-size="12" fill="#666">Type: ${metadata.statementType.toUpperCase()}</text>
      </svg>
    `;

    return btoa(svg);
  }

  // Generate OpenSea URL
  private generateOpenSeaUrl(chainId: bigint, contractAddress: string, tokenId: number): string {
    const chainIdNum = Number(chainId);
    let baseUrl = 'https://opensea.io/assets';
    
    // Handle different networks
    switch (chainIdNum) {
      case 1: // Ethereum Mainnet
        baseUrl = 'https://opensea.io/assets/ethereum';
        break;
      case 137: // Polygon
        baseUrl = 'https://opensea.io/assets/matic';
        break;
      case 42161: // Arbitrum
        baseUrl = 'https://opensea.io/assets/arbitrum';
        break;
      case 10: // Optimism
        baseUrl = 'https://opensea.io/assets/optimism';
        break;
      case 11155111: // Sepolia Testnet
        baseUrl = 'https://testnets.opensea.io/assets/sepolia';
        break;
      default:
        baseUrl = 'https://opensea.io/assets/ethereum';
    }

    return `${baseUrl}/${contractAddress}/${tokenId}`;
  }

  // Get NFT metadata by token ID
  async getNFTMetadata(tokenId: number): Promise<BankStatementNFTMetadata | null> {
    if (!this.contract) {
      throw new Error('Service not initialized');
    }

    try {
      const metadata = await this.contract.getStatementMetadata(tokenId);
      
      return {
        bankName: metadata.bankName,
        accountNumber: metadata.accountNumber,
        statementDate: metadata.statementDate,
        statementPeriod: metadata.statementPeriod,
        balance: metadata.balance,
        transactionCount: metadata.transactionCount.toNumber(),
        fileHash: metadata.fileHash,
        ipfsHash: metadata.ipfsHash,
        statementType: metadata.statementType
      };
    } catch (error) {
      console.error('Error getting NFT metadata:', error);
      return null;
    }
  }

  // Get all NFTs owned by an address
  async getNFTsByOwner(ownerAddress: string): Promise<number[]> {
    if (!this.contract) {
      throw new Error('Service not initialized');
    }

    try {
      const tokenIds = await this.contract.getStatementsByOwner(ownerAddress);
      return tokenIds.map((id: any) => id.toNumber());
    } catch (error) {
      console.error('Error getting NFTs by owner:', error);
      return [];
    }
  }

  // Check if statement already exists as NFT
  async statementExistsAsNFT(fileHash: string): Promise<number | null> {
    if (!this.contract) {
      throw new Error('Service not initialized');
    }

    try {
      const tokenId = await this.contract.getTokenIdByHash(fileHash);
      return tokenId.toNumber() || null;
    } catch (error) {
      console.error('Error checking if statement exists:', error);
      return null;
    }
  }

  // Get total number of statement NFTs
  async getTotalSupply(): Promise<number> {
    if (!this.contract) {
      throw new Error('Service not initialized');
    }

    try {
      const total = await this.contract.totalSupply();
      return total.toNumber();
    } catch (error) {
      console.error('Error getting total supply:', error);
      return 0;
    }
  }

  // Get NFT owner
  async getNFTOwner(tokenId: number): Promise<string | null> {
    if (!this.contract) {
      throw new Error('Service not initialized');
    }

    try {
      return await this.contract.ownerOf(tokenId);
    } catch (error) {
      console.error('Error getting NFT owner:', error);
      return null;
    }
  }

  // Get token URI
  async getTokenURI(tokenId: number): Promise<string | null> {
    if (!this.contract) {
      throw new Error('Service not initialized');
    }

    try {
      return await this.contract.tokenURI(tokenId);
    } catch (error) {
      console.error('Error getting token URI:', error);
      return null;
    }
  }
}

// Create singleton instance
export const bankStatementNFTService = new BankStatementNFTService();

export type { BankStatementNFTMetadata, NFTMintResult };