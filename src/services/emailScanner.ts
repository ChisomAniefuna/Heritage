import { ethers } from 'ethers';
import { bankStatementNFTService, BankStatementNFTMetadata, NFTMintResult } from './nftService';

// Email scanning configuration
interface EmailConfig {
  provider: 'gmail' | 'outlook' | 'imap';
  credentials: {
    email: string;
    password?: string;
    accessToken?: string;
    refreshToken?: string;
  };
  imapConfig?: {
    host: string;
    port: number;
    secure: boolean;
  };
}

interface BankStatement {
  id: string;
  bankName: string;
  accountNumber: string;
  statementDate: string;
  fileName: string;
  fileContent: ArrayBuffer;
  fileHash: string;
  extractedData: {
    balance: string;
    transactions: Transaction[];
    period: {
      from: string;
      to: string;
    };
  };
}

interface Transaction {
  date: string;
  description: string;
  amount: string;
  type: 'debit' | 'credit';
  balance: string;
}

interface NFTCreationResult {
  statement: BankStatement;
  nftResult: NFTMintResult;
  success: boolean;
  error?: string;
}

class EmailBankStatementScanner {
  private emailConfig: EmailConfig | null = null;
  private ownerAddress: string = '';

  // Initialize email scanning
  async initializeEmailScanning(config: EmailConfig): Promise<void> {
    this.emailConfig = config;
    
    // Test email connection
    await this.testEmailConnection();
    console.log('Email scanning initialized successfully');
  }

  // Initialize blockchain connection for NFTs
  async initializeNFTService(
    privateKey: string,
    rpcUrl: string,
    contractAddress: string
  ): Promise<void> {
    // Initialize NFT service
    await bankStatementNFTService.initialize(privateKey, rpcUrl, contractAddress);
    
    // Get owner address from private key
    const wallet = new ethers.Wallet(privateKey);
    this.ownerAddress = wallet.address;
    
    console.log('NFT service initialized for address:', this.ownerAddress);
  }

  // Test email connection
  private async testEmailConnection(): Promise<boolean> {
    if (!this.emailConfig) {
      throw new Error('Email configuration not set');
    }

    try {
      // This would implement actual email connection testing
      // For now, we'll simulate a successful connection
      console.log(`Testing connection to ${this.emailConfig.provider}`);
      return true;
    } catch (error) {
      console.error('Email connection test failed:', error);
      throw new Error('Failed to connect to email provider');
    }
  }

  // Scan emails for bank statements
  async scanForBankStatements(
    fromDate?: Date,
    toDate?: Date
  ): Promise<BankStatement[]> {
    if (!this.emailConfig) {
      throw new Error('Email configuration not set');
    }

    const statements: BankStatement[] = [];
    
    try {
      // Define bank statement patterns
      const bankPatterns = [
        { name: 'Chase Bank', patterns: ['chase.com', 'jpmorgan', 'statement'] },
        { name: 'Bank of America', patterns: ['bankofamerica.com', 'bofa', 'statement'] },
        { name: 'Wells Fargo', patterns: ['wellsfargo.com', 'wf.com', 'statement'] },
        { name: 'Citibank', patterns: ['citibank.com', 'citi.com', 'statement'] },
        { name: 'Capital One', patterns: ['capitalone.com', 'statement'] },
        { name: 'US Bank', patterns: ['usbank.com', 'statement'] },
        { name: 'PNC Bank', patterns: ['pnc.com', 'statement'] },
        { name: 'TD Bank', patterns: ['tdbank.com', 'statement'] },
      ];

      // Search for emails with bank statement attachments
      const emails = await this.searchEmails({
        from: fromDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        to: toDate || new Date(),
        hasAttachment: true,
        subjects: ['statement', 'monthly statement', 'account statement'],
        senders: bankPatterns.flatMap(bank => bank.patterns)
      });

      for (const email of emails) {
        for (const attachment of email.attachments) {
          if (this.isPDFStatement(attachment)) {
            const statement = await this.processBankStatement(email, attachment);
            if (statement) {
              statements.push(statement);
            }
          }
        }
      }

      console.log(`Found ${statements.length} bank statements`);
      return statements;
    } catch (error) {
      console.error('Error scanning for bank statements:', error);
      throw error;
    }
  }

  // Search emails based on criteria
  private async searchEmails(criteria: {
    from: Date;
    to: Date;
    hasAttachment: boolean;
    subjects: string[];
    senders: string[];
  }): Promise<any[]> {
    // This would implement actual email searching
    // For demonstration, we'll return mock data
    return [
      {
        id: 'email1',
        from: 'statements@chase.com',
        subject: 'Your Monthly Statement is Ready',
        date: new Date(),
        attachments: [
          {
            filename: 'statement_2024_12.pdf',
            contentType: 'application/pdf',
            size: 245760,
            content: new ArrayBuffer(245760)
          }
        ]
      }
    ];
  }

  // Check if attachment is a PDF statement
  private isPDFStatement(attachment: any): boolean {
    const filename = attachment.filename.toLowerCase();
    return (
      attachment.contentType === 'application/pdf' &&
      (filename.includes('statement') || 
       filename.includes('account') ||
       filename.includes('summary'))
    );
  }

  // Process bank statement PDF
  private async processBankStatement(email: any, attachment: any): Promise<BankStatement | null> {
    try {
      // Extract bank name from email sender
      const bankName = this.extractBankName(email.from);
      
      // Generate file hash
      const fileHash = await this.generateFileHash(attachment.content);
      
      // Extract data from PDF (this would use a PDF parsing library)
      const extractedData = await this.extractPDFData(attachment.content);
      
      return {
        id: `stmt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        bankName,
        accountNumber: extractedData.accountNumber,
        statementDate: extractedData.statementDate,
        fileName: attachment.filename,
        fileContent: attachment.content,
        fileHash,
        extractedData: {
          balance: extractedData.balance,
          transactions: extractedData.transactions,
          period: extractedData.period
        }
      };
    } catch (error) {
      console.error('Error processing bank statement:', error);
      return null;
    }
  }

  // Extract bank name from email address
  private extractBankName(emailAddress: string): string {
    const bankMappings: { [key: string]: string } = {
      'chase.com': 'Chase Bank',
      'bankofamerica.com': 'Bank of America',
      'wellsfargo.com': 'Wells Fargo',
      'citibank.com': 'Citibank',
      'capitalone.com': 'Capital One',
      'usbank.com': 'US Bank',
      'pnc.com': 'PNC Bank',
      'tdbank.com': 'TD Bank'
    };

    for (const [domain, bankName] of Object.entries(bankMappings)) {
      if (emailAddress.includes(domain)) {
        return bankName;
      }
    }

    return 'Unknown Bank';
  }

  // Generate file hash
  private async generateFileHash(content: ArrayBuffer): Promise<string> {
    const hashBuffer = await crypto.subtle.digest('SHA-256', content);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Extract data from PDF (mock implementation)
  private async extractPDFData(content: ArrayBuffer): Promise<any> {
    // This would use a PDF parsing library like pdf-parse or PDF.js
    // For demonstration, we'll return mock extracted data
    return {
      accountNumber: '****1234',
      statementDate: '2024-12-31',
      balance: '$15,240.50',
      period: {
        from: '2024-12-01',
        to: '2024-12-31'
      },
      transactions: [
        {
          date: '2024-12-30',
          description: 'Direct Deposit - Salary',
          amount: '+$5,000.00',
          type: 'credit' as const,
          balance: '$15,240.50'
        },
        {
          date: '2024-12-29',
          description: 'ATM Withdrawal',
          amount: '-$100.00',
          type: 'debit' as const,
          balance: '$10,340.50'
        }
      ]
    };
  }

  // Convert statement to NFT
  async convertStatementToNFT(statement: BankStatement): Promise<NFTMintResult> {
    if (!this.ownerAddress) {
      throw new Error('NFT service not initialized');
    }

    try {
      // Check if statement already exists as NFT
      const existingTokenId = await bankStatementNFTService.statementExistsAsNFT(statement.fileHash);
      if (existingTokenId) {
        throw new Error(`Statement already exists as NFT with token ID: ${existingTokenId}`);
      }

      // Determine statement type based on period
      const statementType = this.determineStatementType(statement.extractedData.period);

      // Prepare NFT metadata
      const nftMetadata: BankStatementNFTMetadata = {
        bankName: statement.bankName,
        accountNumber: statement.accountNumber,
        statementDate: statement.statementDate,
        statementPeriod: `${statement.extractedData.period.from} to ${statement.extractedData.period.to}`,
        balance: statement.extractedData.balance,
        transactionCount: statement.extractedData.transactions.length,
        fileHash: statement.fileHash,
        ipfsHash: '', // Will be set during NFT creation
        statementType
      };

      // Convert to NFT
      const nftResult = await bankStatementNFTService.convertStatementToNFT(
        statement.fileContent,
        nftMetadata,
        this.ownerAddress
      );

      console.log('Statement converted to NFT:', nftResult);
      return nftResult;
    } catch (error) {
      console.error('Error converting statement to NFT:', error);
      throw error;
    }
  }

  // Determine statement type based on period
  private determineStatementType(period: { from: string; to: string }): 'monthly' | 'quarterly' | 'annual' {
    const fromDate = new Date(period.from);
    const toDate = new Date(period.to);
    const daysDiff = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff <= 35) {
      return 'monthly';
    } else if (daysDiff <= 100) {
      return 'quarterly';
    } else {
      return 'annual';
    }
  }

  // Monthly automated scan and NFT creation
  async performMonthlyNFTScan(): Promise<{
    scannedStatements: BankStatement[];
    createdNFTs: NFTCreationResult[];
    errors: string[];
  }> {
    const results = {
      scannedStatements: [] as BankStatement[],
      createdNFTs: [] as NFTCreationResult[],
      errors: [] as string[]
    };

    try {
      // Scan for statements from the last month
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      
      const statements = await this.scanForBankStatements(lastMonth, new Date());
      results.scannedStatements = statements;

      // Convert each statement to NFT
      for (const statement of statements) {
        try {
          const nftResult = await this.convertStatementToNFT(statement);
          results.createdNFTs.push({
            statement,
            nftResult,
            success: true
          });
        } catch (error) {
          results.createdNFTs.push({
            statement,
            nftResult: {} as NFTMintResult,
            success: false,
            error: `Failed to create NFT for ${statement.fileName}: ${error}`
          });
          results.errors.push(`Failed to create NFT for ${statement.fileName}: ${error}`);
        }
      }

      console.log(`Monthly NFT scan completed: ${statements.length} statements found, ${results.createdNFTs.filter(r => r.success).length} NFTs created`);
      return results;
    } catch (error) {
      results.errors.push(`Monthly NFT scan failed: ${error}`);
      return results;
    }
  }

  // Get NFT collection for user
  async getUserNFTCollection(): Promise<{
    tokenIds: number[];
    totalSupply: number;
    nfts: Array<{
      tokenId: number;
      metadata: BankStatementNFTMetadata | null;
      tokenURI: string | null;
      openseaUrl: string;
    }>;
  }> {
    if (!this.ownerAddress) {
      throw new Error('NFT service not initialized');
    }

    try {
      const tokenIds = await bankStatementNFTService.getNFTsByOwner(this.ownerAddress);
      const totalSupply = await bankStatementNFTService.getTotalSupply();
      
      const nfts = await Promise.all(
        tokenIds.map(async (tokenId) => {
          const metadata = await bankStatementNFTService.getNFTMetadata(tokenId);
          const tokenURI = await bankStatementNFTService.getTokenURI(tokenId);
          
          return {
            tokenId,
            metadata,
            tokenURI,
            openseaUrl: this.generateOpenSeaUrl(tokenId)
          };
        })
      );

      return {
        tokenIds,
        totalSupply,
        nfts
      };
    } catch (error) {
      console.error('Error getting user NFT collection:', error);
      throw error;
    }
  }

  // Generate OpenSea URL (simplified)
  private generateOpenSeaUrl(tokenId: number): string {
    // This would be more sophisticated in production
    return `https://opensea.io/assets/ethereum/${bankStatementNFTService['contractAddress']}/${tokenId}`;
  }
}

// Create singleton instance
export const emailBankStatementScanner = new EmailBankStatementScanner();

export type { EmailConfig, BankStatement, Transaction, NFTCreationResult };