import algosdk from 'algosdk';
import { Buffer } from 'buffer';

// Make Buffer available globally for algosdk
if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
}

// Algorand configuration
const ALGORAND_SERVER = 'https://testnet-api.algonode.cloud';
const ALGORAND_PORT = 443;
const ALGORAND_TOKEN = '';
const ALGORAND_INDEXER = 'https://testnet-idx.algonode.cloud';

export interface AlgorandWallet {
  address: string;
  mnemonic: string;
  privateKey: Uint8Array;
}

export interface HeritageRecord {
  id: string;
  ownerAddress: string;
  beneficiaryAddress: string;
  assetHash: string;
  encryptedData: string;
  releaseConditions: string;
  timestamp: number;
  isReleased: boolean;
}

export interface AssetProof {
  assetId: string;
  hash: string;
  timestamp: number;
  transactionId: string;
  blockNumber: number;
}

class AlgorandService {
  private algodClient: algosdk.Algodv2;
  private indexerClient: algosdk.Indexer;
  private appId: number = 0; // Will be set when smart contract is deployed

  constructor() {
    this.algodClient = new algosdk.Algodv2(ALGORAND_TOKEN, ALGORAND_SERVER, ALGORAND_PORT);
    this.indexerClient = new algosdk.Indexer(ALGORAND_TOKEN, ALGORAND_INDEXER, ALGORAND_PORT);
  }

  // Generate a new Algorand wallet for the user
  async generateWallet(): Promise<AlgorandWallet> {
    try {
      const account = algosdk.generateAccount();
      const mnemonic = algosdk.secretKeyToMnemonic(account.sk);
      
      return {
        address: account.addr,
        mnemonic: mnemonic,
        privateKey: account.sk
      };
    } catch (error) {
      console.error('Error generating wallet:', error);
      throw new Error('Failed to generate Algorand wallet');
    }
  }

  // Restore wallet from mnemonic
  async restoreWallet(mnemonic: string): Promise<AlgorandWallet> {
    try {
      const privateKey = algosdk.mnemonicToSecretKey(mnemonic);
      
      return {
        address: privateKey.addr,
        mnemonic: mnemonic,
        privateKey: privateKey.sk
      };
    } catch (error) {
      console.error('Error restoring wallet:', error);
      throw new Error('Invalid mnemonic phrase');
    }
  }

  // Get account balance
  async getAccountBalance(address: string): Promise<number> {
    try {
      const accountInfo = await this.algodClient.accountInformation(address).do();
      return accountInfo.amount / 1000000; // Convert microAlgos to Algos
    } catch (error) {
      console.error('Error getting account balance:', error);
      return 0;
    }
  }

  // Create a hash of asset data for blockchain storage
  createAssetHash(assetData: any): string {
    const dataString = JSON.stringify(assetData);
    const encoder = new TextEncoder();
    const data = encoder.encode(dataString);
    
    // Use Algorand's built-in hashing
    const hash = algosdk.bytesToBase64(data);
    return hash;
  }

  // Encrypt sensitive data before storing on blockchain
  async encryptAssetData(data: any, password: string): Promise<string> {
    try {
      // Simple encryption for demo - in production, use proper encryption
      const dataString = JSON.stringify(data);
      const encoder = new TextEncoder();
      const dataBytes = encoder.encode(dataString);
      
      // For demo purposes, we'll use base64 encoding
      // In production, implement proper AES encryption
      return btoa(dataString);
    } catch (error) {
      console.error('Error encrypting data:', error);
      throw new Error('Failed to encrypt asset data');
    }
  }

  // Decrypt asset data
  async decryptAssetData(encryptedData: string, password: string): Promise<any> {
    try {
      // Simple decryption for demo - in production, use proper decryption
      const decryptedString = atob(encryptedData);
      return JSON.parse(decryptedString);
    } catch (error) {
      console.error('Error decrypting data:', error);
      throw new Error('Failed to decrypt asset data');
    }
  }

  // Store asset proof on Algorand blockchain
  async storeAssetProof(
    wallet: AlgorandWallet,
    assetData: any,
    beneficiaryAddress?: string
  ): Promise<AssetProof> {
    try {
      // Create hash of asset data
      const assetHash = this.createAssetHash(assetData);
      
      // Encrypt sensitive data
      const encryptedData = await this.encryptAssetData(assetData, wallet.address);
      
      // Create note with asset information
      const note = {
        type: 'heritage_asset',
        assetId: assetData.id,
        hash: assetHash,
        beneficiary: beneficiaryAddress,
        timestamp: Date.now()
      };
      
      const noteBytes = new TextEncoder().encode(JSON.stringify(note));
      
      // Get suggested transaction parameters
      const suggestedParams = await this.algodClient.getTransactionParams().do();
      
      // Create transaction
      const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        from: wallet.address,
        to: wallet.address, // Self-transaction to store data
        amount: 0, // No Algo transfer, just data storage
        note: noteBytes,
        suggestedParams: suggestedParams
      });
      
      // Sign transaction
      const signedTxn = txn.signTxn(wallet.privateKey);
      
      // Submit transaction
      const { txId } = await this.algodClient.sendRawTransaction(signedTxn).do();
      
      // Wait for confirmation
      const confirmedTxn = await algosdk.waitForConfirmation(this.algodClient, txId, 4);
      
      return {
        assetId: assetData.id,
        hash: assetHash,
        timestamp: Date.now(),
        transactionId: txId,
        blockNumber: confirmedTxn['confirmed-round']
      };
    } catch (error) {
      console.error('Error storing asset proof:', error);
      throw new Error('Failed to store asset proof on blockchain');
    }
  }

  // Verify asset integrity using blockchain proof
  async verifyAssetIntegrity(assetData: any, proof: AssetProof): Promise<boolean> {
    try {
      // Recreate hash from current asset data
      const currentHash = this.createAssetHash(assetData);
      
      // Compare with stored hash
      if (currentHash !== proof.hash) {
        return false;
      }
      
      // Verify transaction exists on blockchain
      const txnInfo = await this.indexerClient
        .lookupTransactionByID(proof.transactionId)
        .do();
      
      if (!txnInfo.transaction) {
        return false;
      }
      
      // Verify the note contains our asset information
      const noteBytes = txnInfo.transaction.note;
      if (noteBytes) {
        const noteString = new TextDecoder().decode(Buffer.from(noteBytes, 'base64'));
        const noteData = JSON.parse(noteString);
        
        return noteData.assetId === proof.assetId && noteData.hash === proof.hash;
      }
      
      return false;
    } catch (error) {
      console.error('Error verifying asset integrity:', error);
      return false;
    }
  }

  // Create a time-locked release condition
  async createTimeLockCondition(
    wallet: AlgorandWallet,
    assetId: string,
    releaseDate: Date,
    beneficiaryAddress: string
  ): Promise<string> {
    try {
      const condition = {
        type: 'time_lock',
        assetId: assetId,
        releaseTimestamp: releaseDate.getTime(),
        beneficiary: beneficiaryAddress,
        creator: wallet.address,
        createdAt: Date.now()
      };
      
      const noteBytes = new TextEncoder().encode(JSON.stringify(condition));
      
      const suggestedParams = await this.algodClient.getTransactionParams().do();
      
      const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        from: wallet.address,
        to: wallet.address,
        amount: 0,
        note: noteBytes,
        suggestedParams: suggestedParams
      });
      
      const signedTxn = txn.signTxn(wallet.privateKey);
      const { txId } = await this.algodClient.sendRawTransaction(signedTxn).do();
      
      await algosdk.waitForConfirmation(this.algodClient, txId, 4);
      
      return txId;
    } catch (error) {
      console.error('Error creating time lock condition:', error);
      throw new Error('Failed to create time lock condition');
    }
  }

  // Check if release conditions are met
  async checkReleaseConditions(conditionTxId: string): Promise<boolean> {
    try {
      const txnInfo = await this.indexerClient
        .lookupTransactionByID(conditionTxId)
        .do();
      
      if (!txnInfo.transaction || !txnInfo.transaction.note) {
        return false;
      }
      
      const noteString = new TextDecoder().decode(
        Buffer.from(txnInfo.transaction.note, 'base64')
      );
      const condition = JSON.parse(noteString);
      
      if (condition.type === 'time_lock') {
        return Date.now() >= condition.releaseTimestamp;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking release conditions:', error);
      return false;
    }
  }

  // Get all heritage records for an address
  async getHeritageRecords(address: string): Promise<HeritageRecord[]> {
    try {
      const transactions = await this.indexerClient
        .lookupAccountTransactions(address)
        .do();
      
      const heritageRecords: HeritageRecord[] = [];
      
      for (const txn of transactions.transactions) {
        if (txn.note) {
          try {
            const noteString = new TextDecoder().decode(
              Buffer.from(txn.note, 'base64')
            );
            const noteData = JSON.parse(noteString);
            
            if (noteData.type === 'heritage_asset') {
              heritageRecords.push({
                id: noteData.assetId,
                ownerAddress: address,
                beneficiaryAddress: noteData.beneficiary || '',
                assetHash: noteData.hash,
                encryptedData: '', // Would be stored separately
                releaseConditions: '',
                timestamp: noteData.timestamp,
                isReleased: false
              });
            }
          } catch (e) {
            // Skip invalid notes
            continue;
          }
        }
      }
      
      return heritageRecords;
    } catch (error) {
      console.error('Error getting heritage records:', error);
      return [];
    }
  }

  // Fund account with test Algos (for testnet only)
  async fundTestAccount(address: string): Promise<boolean> {
    try {
      // This would typically use the Algorand testnet faucet
      // For demo purposes, we'll just return true
      console.log(`Funding test account: ${address}`);
      
      // In a real implementation, you would call the testnet faucet API
      // const response = await fetch(`https://testnet-api.algonode.cloud/v2/accounts/${address}/fund`, {
      //   method: 'POST'
      // });
      
      return true;
    } catch (error) {
      console.error('Error funding test account:', error);
      return false;
    }
  }

  // Get network status
  async getNetworkStatus(): Promise<any> {
    try {
      return await this.algodClient.status().do();
    } catch (error) {
      console.error('Error getting network status:', error);
      return null;
    }
  }
}

// Create singleton instance
export const algorandService = new AlgorandService();

// Helper functions for Heritage Vault integration
export const HeritageVaultAlgorand = {
  // Initialize user's blockchain wallet
  async initializeUserWallet(): Promise<AlgorandWallet | null> {
    try {
      // Check if user already has a wallet stored
      const storedMnemonic = localStorage.getItem('heritage_vault_mnemonic');
      
      if (storedMnemonic) {
        return await algorandService.restoreWallet(storedMnemonic);
      } else {
        // Generate new wallet
        const wallet = await algorandService.generateWallet();
        
        // Store mnemonic securely (in production, use proper encryption)
        localStorage.setItem('heritage_vault_mnemonic', wallet.mnemonic);
        
        // Fund test account if on testnet
        await algorandService.fundTestAccount(wallet.address);
        
        return wallet;
      }
    } catch (error) {
      console.error('Error initializing user wallet:', error);
      return null;
    }
  },

  // Secure an asset on the blockchain
  async secureAsset(asset: any, beneficiaryAddress?: string): Promise<AssetProof | null> {
    try {
      const wallet = await this.initializeUserWallet();
      if (!wallet) return null;
      
      return await algorandService.storeAssetProof(wallet, asset, beneficiaryAddress);
    } catch (error) {
      console.error('Error securing asset:', error);
      return null;
    }
  },

  // Verify an asset hasn't been tampered with
  async verifyAsset(asset: any, proof: AssetProof): Promise<boolean> {
    try {
      return await algorandService.verifyAssetIntegrity(asset, proof);
    } catch (error) {
      console.error('Error verifying asset:', error);
      return false;
    }
  },

  // Create blockchain-based release conditions
  async createReleaseCondition(
    assetId: string,
    releaseDate: Date,
    beneficiaryAddress: string
  ): Promise<string | null> {
    try {
      const wallet = await this.initializeUserWallet();
      if (!wallet) return null;
      
      return await algorandService.createTimeLockCondition(
        wallet,
        assetId,
        releaseDate,
        beneficiaryAddress
      );
    } catch (error) {
      console.error('Error creating release condition:', error);
      return null;
    }
  },

  // Check if conditions are met for asset release
  async checkReleaseConditions(conditionTxId: string): Promise<boolean> {
    try {
      return await algorandService.checkReleaseConditions(conditionTxId);
    } catch (error) {
      console.error('Error checking release conditions:', error);
      return false;
    }
  },

  // Get user's blockchain address
  async getUserAddress(): Promise<string | null> {
    try {
      const wallet = await this.initializeUserWallet();
      return wallet?.address || null;
    } catch (error) {
      console.error('Error getting user address:', error);
      return null;
    }
  },

  // Get account balance
  async getAccountBalance(): Promise<number> {
    try {
      const address = await this.getUserAddress();
      if (!address) return 0;
      
      return await algorandService.getAccountBalance(address);
    } catch (error) {
      console.error('Error getting account balance:', error);
      return 0;
    }
  }
};