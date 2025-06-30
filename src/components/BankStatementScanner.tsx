import React, { useState, useEffect } from 'react';
import { Mail, Upload, Shield, Clock, CheckCircle, AlertCircle, Settings, FileText, Link, Eye, Star, ExternalLink } from 'lucide-react';
import { emailBankStatementScanner, EmailConfig, BankStatement, NFTCreationResult } from '../services/emailScanner';
import { NFTMintResult } from '../services/nftService';

interface BankStatementScannerProps {
  onClose: () => void;
}

const BankStatementScanner: React.FC<BankStatementScannerProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [emailConfig, setEmailConfig] = useState<EmailConfig>({
    provider: 'gmail',
    credentials: {
      email: '',
      accessToken: ''
    }
  });
  const [blockchainConfig, setBlockchainConfig] = useState({
    privateKey: '',
    rpcUrl: 'https://mainnet.infura.io/v3/YOUR_PROJECT_ID',
    contractAddress: '',
    network: 'ethereum'
  });
  const [isScanning, setIsScanning] = useState(false);
  const [scannedStatements, setScannedStatements] = useState<BankStatement[]>([]);
  const [createdNFTs, setCreatedNFTs] = useState<NFTCreationResult[]>([]);
  const [userNFTCollection, setUserNFTCollection] = useState<any>(null);
  const [autoScanEnabled, setAutoScanEnabled] = useState(false);
  const [lastScanDate, setLastScanDate] = useState<Date | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    loadSavedConfiguration();
  }, []);

  const loadSavedConfiguration = () => {
    // Load saved configuration from localStorage
    const savedEmailConfig = localStorage.getItem('emailScannerConfig');
    const savedBlockchainConfig = localStorage.getItem('blockchainScannerConfig');
    const savedAutoScan = localStorage.getItem('autoScanEnabled');
    const savedLastScan = localStorage.getItem('lastScanDate');

    if (savedEmailConfig) {
      setEmailConfig(JSON.parse(savedEmailConfig));
    }
    if (savedBlockchainConfig) {
      setBlockchainConfig(JSON.parse(savedBlockchainConfig));
    }
    if (savedAutoScan) {
      setAutoScanEnabled(JSON.parse(savedAutoScan));
    }
    if (savedLastScan) {
      setLastScanDate(new Date(savedLastScan));
    }
  };

  const saveConfiguration = () => {
    localStorage.setItem('emailScannerConfig', JSON.stringify(emailConfig));
    localStorage.setItem('blockchainScannerConfig', JSON.stringify(blockchainConfig));
    localStorage.setItem('autoScanEnabled', JSON.stringify(autoScanEnabled));
  };

  const initializeServices = async () => {
    try {
      setErrors([]);
      
      // Initialize email scanning
      await emailBankStatementScanner.initializeEmailScanning(emailConfig);
      
      // Initialize NFT service
      await emailBankStatementScanner.initializeNFTService(
        blockchainConfig.privateKey,
        blockchainConfig.rpcUrl,
        blockchainConfig.contractAddress
      );

      saveConfiguration();
      setCurrentStep(3);
      
      // Load existing NFT collection
      await loadNFTCollection();
    } catch (error) {
      setErrors([`Initialization failed: ${error}`]);
    }
  };

  const loadNFTCollection = async () => {
    try {
      const collection = await emailBankStatementScanner.getUserNFTCollection();
      setUserNFTCollection(collection);
    } catch (error) {
      console.error('Error loading NFT collection:', error);
    }
  };

  const performScan = async () => {
    setIsScanning(true);
    setErrors([]);
    
    try {
      const results = await emailBankStatementScanner.performMonthlyNFTScan();
      
      setScannedStatements(results.scannedStatements);
      setCreatedNFTs(results.createdNFTs);
      setErrors(results.errors);
      setLastScanDate(new Date());
      
      localStorage.setItem('lastScanDate', new Date().toISOString());
      
      // Reload NFT collection
      await loadNFTCollection();
      
    } catch (error) {
      setErrors([`Scan failed: ${error}`]);
    } finally {
      setIsScanning(false);
    }
  };

  const renderEmailConfiguration = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Mail className="w-12 h-12 text-blue-600 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-slate-900">Email Configuration</h3>
        <p className="text-slate-600">Connect your email to scan for bank statements</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Email Provider</label>
        <select
          value={emailConfig.provider}
          onChange={(e) => setEmailConfig(prev => ({ ...prev, provider: e.target.value as any }))}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="gmail">Gmail</option>
          <option value="outlook">Outlook</option>
          <option value="imap">Custom IMAP</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
        <input
          type="email"
          value={emailConfig.credentials.email}
          onChange={(e) => setEmailConfig(prev => ({
            ...prev,
            credentials: { ...prev.credentials, email: e.target.value }
          }))}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="your.email@gmail.com"
        />
      </div>

      {emailConfig.provider === 'gmail' && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">OAuth Access Token</label>
          <input
            type="password"
            value={emailConfig.credentials.accessToken || ''}
            onChange={(e) => setEmailConfig(prev => ({
              ...prev,
              credentials: { ...prev.credentials, accessToken: e.target.value }
            }))}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="OAuth access token"
          />
          <p className="text-xs text-slate-500 mt-1">
            Generate an OAuth token from Google Cloud Console
          </p>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">🏦 NFT Bank Statements</h4>
        <p className="text-sm text-blue-800">
          Your bank statements will be converted into unique NFTs, providing immutable proof of your financial records 
          while maintaining privacy through masked account numbers.
        </p>
      </div>
    </div>
  );

  const renderBlockchainConfiguration = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Shield className="w-12 h-12 text-green-600 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-slate-900">NFT Configuration</h3>
        <p className="text-slate-600">Configure blockchain for your bank statement NFTs</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Network</label>
        <select
          value={blockchainConfig.network}
          onChange={(e) => setBlockchainConfig(prev => ({ ...prev, network: e.target.value }))}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
        >
          <option value="ethereum">Ethereum Mainnet</option>
          <option value="polygon">Polygon</option>
          <option value="arbitrum">Arbitrum</option>
          <option value="optimism">Optimism</option>
          <option value="sepolia">Sepolia Testnet</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">RPC URL</label>
        <input
          type="url"
          value={blockchainConfig.rpcUrl}
          onChange={(e) => setBlockchainConfig(prev => ({ ...prev, rpcUrl: e.target.value }))}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
          placeholder="https://mainnet.infura.io/v3/YOUR_PROJECT_ID"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Private Key</label>
        <input
          type="password"
          value={blockchainConfig.privateKey}
          onChange={(e) => setBlockchainConfig(prev => ({ ...prev, privateKey: e.target.value }))}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
          placeholder="0x..."
        />
        <p className="text-xs text-slate-500 mt-1">
          Your private key is stored locally and never transmitted
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">NFT Contract Address</label>
        <input
          type="text"
          value={blockchainConfig.contractAddress}
          onChange={(e) => setBlockchainConfig(prev => ({ ...prev, contractAddress: e.target.value }))}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
          placeholder="0x..."
        />
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-medium text-green-900 mb-2">🎨 NFT Features</h4>
        <ul className="text-sm text-green-800 space-y-1">
          <li>• Unique NFT for each bank statement</li>
          <li>• On-chain metadata with privacy protection</li>
          <li>• IPFS storage for document files</li>
          <li>• OpenSea marketplace compatibility</li>
          <li>• Transferable and tradeable assets</li>
        </ul>
      </div>
    </div>
  );

  const renderNFTResults = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Star className="w-12 h-12 text-purple-600 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-slate-900">Bank Statement NFTs</h3>
        <p className="text-slate-600">Your financial documents as unique digital assets</p>
      </div>

      {/* Scan Controls */}
      <div className="bg-slate-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-medium text-slate-900">Automated NFT Creation</h4>
            <p className="text-sm text-slate-600">Scan for new statements and create NFTs monthly</p>
          </div>
          <button
            onClick={() => setAutoScanEnabled(!autoScanEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              autoScanEnabled ? 'bg-blue-600' : 'bg-slate-300'
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              autoScanEnabled ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={performScan}
            disabled={isScanning}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-slate-400"
          >
            {isScanning ? (
              <Clock className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            <span>{isScanning ? 'Creating NFTs...' : 'Scan & Create NFTs'}</span>
          </button>

          {lastScanDate && (
            <span className="text-sm text-slate-600">
              Last scan: {lastScanDate.toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <h4 className="font-medium text-red-900">Errors</h4>
          </div>
          <ul className="text-sm text-red-800 space-y-1">
            {errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* NFT Collection Overview */}
      {userNFTCollection && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-purple-900">Your NFT Collection</h4>
            <div className="flex items-center space-x-4 text-sm text-purple-700">
              <span>Total NFTs: {userNFTCollection.tokenIds.length}</span>
              <span>Global Supply: {userNFTCollection.totalSupply}</span>
            </div>
          </div>
          
          {userNFTCollection.nfts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userNFTCollection.nfts.slice(0, 4).map((nft: any, index: number) => (
                <div key={nft.tokenId} className="bg-white rounded-lg p-4 border border-purple-200">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h5 className="font-medium text-slate-900">NFT #{nft.tokenId}</h5>
                      <p className="text-sm text-slate-600">{nft.metadata?.bankName}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => window.open(nft.openseaUrl, '_blank')}
                        className="p-1 text-purple-600 hover:text-purple-800"
                        title="View on OpenSea"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 space-y-1">
                    <div>Date: {nft.metadata?.statementDate}</div>
                    <div>Balance: {nft.metadata?.balance}</div>
                    <div>Transactions: {nft.metadata?.transactionCount}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Created NFTs */}
      {createdNFTs.length > 0 && (
        <div>
          <h4 className="font-medium text-slate-900 mb-3">Recently Created NFTs ({createdNFTs.length})</h4>
          <div className="space-y-3">
            {createdNFTs.map((result, index) => (
              <div key={index} className={`border rounded-lg p-4 ${
                result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h5 className="font-medium text-slate-900">{result.statement.bankName}</h5>
                      <span className="text-sm text-slate-500">({result.statement.accountNumber})</span>
                      {result.success && (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                    
                    {result.success ? (
                      <div className="space-y-2">
                        <p className="text-sm text-green-700">
                          ✅ NFT Created Successfully! Token ID: #{result.nftResult.tokenId}
                        </p>
                        <div className="grid grid-cols-2 gap-4 text-xs text-slate-600">
                          <div>Statement: {result.statement.fileName}</div>
                          <div>Date: {result.statement.statementDate}</div>
                          <div>Balance: {result.statement.extractedData.balance}</div>
                          <div>Transactions: {result.statement.extractedData.transactions.length}</div>
                        </div>
                        <div className="flex items-center space-x-2 mt-2">
                          <button
                            onClick={() => window.open(result.nftResult.openseaUrl, '_blank')}
                            className="flex items-center space-x-1 px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs hover:bg-purple-200"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>OpenSea</span>
                          </button>
                          <span className="text-xs text-slate-500">
                            TX: {result.nftResult.transactionHash.substring(0, 10)}...
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-red-700">
                        ❌ {result.error}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Success Summary */}
      {createdNFTs.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h4 className="font-medium text-green-900">NFT Creation Summary</h4>
          </div>
          <p className="text-sm text-green-800">
            Successfully created {createdNFTs.filter(r => r.success).length} bank statement NFTs out of {createdNFTs.length} statements found.
            Your financial documents are now unique, verifiable digital assets on the blockchain!
          </p>
        </div>
      )}
    </div>
  );

  const steps = [
    { id: 1, title: 'Email Setup', description: 'Configure email scanning' },
    { id: 2, title: 'NFT Setup', description: 'Configure blockchain for NFTs' },
    { id: 3, title: 'Create NFTs', description: 'Scan statements and create NFTs' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-xl">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Bank Statement NFT Creator</h2>
            <p className="text-slate-600 mt-1">Convert your bank statements into unique NFTs</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            ×
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center space-x-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step.id ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {step.id}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-1 mx-2 ${
                    currentStep > step.id ? 'bg-purple-600' : 'bg-slate-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="mt-2 text-sm text-slate-600">
            Step {currentStep}: {steps[currentStep - 1]?.title}
          </div>
        </div>

        <div className="p-6">
          {currentStep === 1 && renderEmailConfiguration()}
          {currentStep === 2 && renderBlockchainConfiguration()}
          {currentStep === 3 && renderNFTResults()}

          {/* Navigation */}
          <div className="flex justify-between pt-6 border-t border-slate-200 mt-6">
            <button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
              >
                Close
              </button>
              {currentStep < 3 ? (
                <button
                  onClick={currentStep === 1 ? () => setCurrentStep(2) : initializeServices}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  {currentStep === 2 ? 'Initialize & Continue' : 'Next'}
                </button>
              ) : (
                <button
                  onClick={saveConfiguration}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Save Configuration
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankStatementScanner;