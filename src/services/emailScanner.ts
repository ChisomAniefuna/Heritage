import { ethers } from 'ethers';

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

interface OnChainRecord {
  statementHash: string;
  bankName: string;
  accountNumber: string;
  statementDate: string;
  ipfsHash: string;
  timestamp: number;
  verified: boolean;
}

class EmailBankStatementScanner {
  private emailConfig: EmailConfig | null = null;
  private web3Provider: ethers.Provider | null = null;
  private wallet: ethers.Wallet | null = null;
  private contractAddress: string = '';
  private contractABI: any[] = [];

  // Initialize email scanning
  async initializeEmailScanning(config: EmailConfig): Promise<void> {
    this.emailConfig = config;
    
    // Test email connection
    await this.testEmailConnection();
    console.log('Email scanning initialized successfully');
  }

  // Initialize blockchain connection
  async initializeBlockchain(
    privateKey: string,
    rpcUrl: string,
    contractAddress: string,
    contractABI: any[]
  ): Promise<void> {
    this.web3Provider = new ethers.JsonRpcProvider(rpcUrl);
    this.wallet = new ethers.Wallet(privateKey, this.web3Provider);
    this.contractAddress = contractAddress;
    this.contractABI = contractABI;
    
    console.log('Blockchain connection initialized');
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

  // Upload to IPFS
  private async uploadToIPFS(content: ArrayBuffer, metadata: any): Promise<string> {
    try {
      // This would integrate with IPFS
      // For demonstration, we'll return a mock IPFS hash
      const mockHash = `Qm${Math.random().toString(36).substr(2, 44)}`;
      console.log('Uploaded to IPFS:', mockHash);
      return mockHash;
    } catch (error) {
      console.error('IPFS upload failed:', error);
      throw error;
    }
  }

  // Upload statement to blockchain
  async uploadStatementToBlockchain(statement: BankStatement): Promise<string> {
    if (!this.wallet || !this.contractAddress) {
      throw new Error('Blockchain not initialized');
    }

    try {
      // Upload file to IPFS first
      const ipfsHash = await this.uploadToIPFS(statement.fileContent, {
        bankName: statement.bankName,
        accountNumber: statement.accountNumber,
        statementDate: statement.statementDate,
        fileName: statement.fileName
      });

      // Create contract instance
      const contract = new ethers.Contract(
        this.contractAddress,
        this.contractABI,
        this.wallet
      );

      // Prepare transaction data
      const onChainRecord: OnChainRecord = {
        statementHash: statement.fileHash,
        bankName: statement.bankName,
        accountNumber: statement.accountNumber,
        statementDate: statement.statementDate,
        ipfsHash,
        timestamp: Math.floor(Date.now() / 1000),
        verified: true
      };

      // Submit transaction to blockchain
      const tx = await contract.uploadStatement(
        onChainRecord.statementHash,
        onChainRecord.bankName,
        onChainRecord.accountNumber,
        onChainRecord.statementDate,
        onChainRecord.ipfsHash,
        onChainRecord.timestamp
      );

      await tx.wait();
      console.log('Statement uploaded to blockchain:', tx.hash);
      
      return tx.hash;
    } catch (error) {
      console.error('Blockchain upload failed:', error);
      throw error;
    }
  }

  // Monthly automated scan
  async performMonthlyScan(): Promise<{
    scannedStatements: BankStatement[];
    uploadedStatements: string[];
    errors: string[];
  }> {
    const results = {
      scannedStatements: [] as BankStatement[],
      uploadedStatements: [] as string[],
      errors: [] as string[]
    };

    try {
      // Scan for statements from the last month
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      
      const statements = await this.scanForBankStatements(lastMonth, new Date());
      results.scannedStatements = statements;

      // Upload each statement to blockchain
      for (const statement of statements) {
        try {
          const txHash = await this.uploadStatementToBlockchain(statement);
          results.uploadedStatements.push(txHash);
        } catch (error) {
          results.errors.push(`Failed to upload ${statement.fileName}: ${error}`);
        }
      }

      console.log(`Monthly scan completed: ${statements.length} statements found, ${results.uploadedStatements.length} uploaded`);
      return results;
    } catch (error) {
      results.errors.push(`Monthly scan failed: ${error}`);
      return results;
    }
  }

  // Get statement verification status from blockchain
  async getStatementVerificationStatus(statementHash: string): Promise<OnChainRecord | null> {
    if (!this.web3Provider || !this.contractAddress) {
      throw new Error('Blockchain not initialized');
    }

    try {
      const contract = new ethers.Contract(
        this.contractAddress,
        this.contractABI,
        this.web3Provider
      );

      const record = await contract.getStatement(statementHash);
      
      if (record && record.timestamp > 0) {
        return {
          statementHash: record.statementHash,
          bankName: record.bankName,
          accountNumber: record.accountNumber,
          statementDate: record.statementDate,
          ipfsHash: record.ipfsHash,
          timestamp: record.timestamp,
          verified: record.verified
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting verification status:', error);
      return null;
    }
  }
}

// Create singleton instance
export const emailBankStatementScanner = new EmailBankStatementScanner();

// Smart contract ABI for bank statement storage
export const BANK_STATEMENT_CONTRACT_ABI = [
  {
    "inputs": [
      {"name": "_statementHash", "type": "string"},
      {"name": "_bankName", "type": "string"},
      {"name": "_accountNumber", "type": "string"},
      {"name": "_statementDate", "type": "string"},
      {"name": "_ipfsHash", "type": "string"},
      {"name": "_timestamp", "type": "uint256"}
    ],
    "name": "uploadStatement",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "_statementHash", "type": "string"}],
    "name": "getStatement",
    "outputs": [
      {"name": "statementHash", "type": "string"},
      {"name": "bankName", "type": "string"},
      {"name": "accountNumber", "type": "string"},
      {"name": "statementDate", "type": "string"},
      {"name": "ipfsHash", "type": "string"},
      {"name": "timestamp", "type": "uint256"},
      {"name": "verified", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "_owner", "type": "address"}],
    "name": "getStatementsByOwner",
    "outputs": [{"name": "", "type": "string[]"}],
    "stateMutability": "view",
    "type": "function"
  }
];

export type { EmailConfig, BankStatement, Transaction, OnChainRecord };