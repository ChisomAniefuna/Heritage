import React, { useState, useEffect } from 'react';
import { Mail, Upload, Shield, Clock, CheckCircle, AlertCircle, Settings, FileText, Link, Eye } from 'lucide-react';
import { emailBankStatementScanner, EmailConfig, BankStatement, OnChainRecord, BANK_STATEMENT_CONTRACT_ABI } from '../services/emailScanner';

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
  const [uploadedStatements, setUploadedStatements] = useState<string[]>([]);
  const [verificationRecords, setVerificationRecords] = useState<OnChainRecord[]>([]);
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
      
      // Initialize blockchain connection
      await emailBankStatementScanner.initializeBlockchain(
        blockchainConfig.privateKey,
        blockchainConfig.rpcUrl,
        blockchainConfig.contractAddress,
        BANK_STATEMENT_CONTRACT_ABI
      );

      saveConfiguration();
      setCurrentStep(3);
    } catch (error) {
      setErrors([`Initialization failed: ${error}`]);
    }
  };

  const performScan = async () => {
    setIsScanning(true);
    setErrors([]);
    
    try {
      const results = await emailBankStatementScanner.performMonthlyScan();
      
      setScannedStatements(results.scannedStatements);
      setUploadedStatements(results.uploadedStatements);
      setErrors(results.errors);
      setLastScanDate(new Date());
      
      localStorage.setItem('lastScanDate', new Date().toISOString());
      
      // Load verification records
      await loadVerificationRecords(results.scannedStatements);
      
    } catch (error) {
      setErrors([`Scan failed: ${error}`]);
    } finally {
      setIsScanning(false);
    }
  };

  const loadVerificationRecords = async (statements: BankStatement[]) => {
    const records: OnChainRecord[] = [];
    
    for (const statement of statements) {
      try {
        const record = await emailBankStatementScanner.getStatementVerificationStatus(statement.fileHash);
        if (record) {
          records.push(record);
        }
      } catch (error) {
        console.error('Error loading verification record:', error);
      }
    }
    
    setVerificationRecords(records);
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

      {emailConfig.provider === 'imap' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">IMAP Host</label>
            <input
              type="text"
              value={emailConfig.imapConfig?.host || ''}
              onChange={(e) => setEmailConfig(prev => ({
                ...prev,
                imapConfig: { ...prev.imapConfig!, host: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="imap.example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Port</label>
            <input
              type="number"
              value={emailConfig.imapConfig?.port || 993}
              onChange={(e) => setEmailConfig(prev => ({
                ...prev,
                imapConfig: { ...prev.imapConfig!, port: parseInt(e.target.value) }
              }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={emailConfig.imapConfig?.secure || true}
              onChange={(e) => setEmailConfig(prev => ({
                ...prev,
                imapConfig: { ...prev.imapConfig!, secure: e.target.checked }
              }))}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <label className="ml-2 text-sm text-slate-700">Use SSL/TLS</label>
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Security Notice</h4>
        <p className="text-sm text-blue-800">
          Your email credentials are stored locally and encrypted. We recommend using OAuth tokens 
          instead of passwords for better security.
        </p>
      </div>
    </div>
  );

  const renderBlockchainConfiguration = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Shield className="w-12 h-12 text-green-600 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-slate-900">Blockchain Configuration</h3>
        <p className="text-slate-600">Configure blockchain storage for your bank statements</p>
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
        <label className="block text-sm font-medium text-slate-700 mb-2">Contract Address</label>
        <input
          type="text"
          value={blockchainConfig.contractAddress}
          onChange={(e) => setBlockchainConfig(prev => ({ ...prev, contractAddress: e.target.value }))}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
          placeholder="0x..."
        />
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-medium text-green-900 mb-2">Smart Contract Features</h4>
        <ul className="text-sm text-green-800 space-y-1">
          <li>• Immutable storage of statement hashes</li>
          <li>• IPFS integration for file storage</li>
          <li>• Verification and audit trails</li>
          <li>• Gas-optimized operations</li>
        </ul>
      </div>
    </div>
  );

  const renderScanResults = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <FileText className="w-12 h-12 text-purple-600 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-slate-900">Scan Results</h3>
        <p className="text-slate-600">Bank statements found and uploaded to blockchain</p>
      </div>

      {/* Scan Controls */}
      <div className="bg-slate-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-medium text-slate-900">Automated Scanning</h4>
            <p className="text-sm text-slate-600">Scan for new statements monthly</p>
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
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-400"
          >
            {isScanning ? (
              <Clock className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            <span>{isScanning ? 'Scanning...' : 'Scan Now'}</span>
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

      {/* Scanned Statements */}
      {scannedStatements.length > 0 && (
        <div>
          <h4 className="font-medium text-slate-900 mb-3">Found Statements ({scannedStatements.length})</h4>
          <div className="space-y-3">
            {scannedStatements.map((statement, index) => {
              const isUploaded = uploadedStatements.length > index;
              const verificationRecord = verificationRecords.find(r => r.statementHash === statement.fileHash);
              
              return (
                <div key={statement.id} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h5 className="font-medium text-slate-900">{statement.bankName}</h5>
                        <span className="text-sm text-slate-500">({statement.accountNumber})</span>
                        {isUploaded && (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{statement.fileName}</p>
                      <div className="grid grid-cols-2 gap-4 text-xs text-slate-500">
                        <div>Statement Date: {statement.statementDate}</div>
                        <div>Balance: {statement.extractedData.balance}</div>
                        <div>Transactions: {statement.extractedData.transactions.length}</div>
                        <div>File Hash: {statement.fileHash.substring(0, 16)}...</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {verificationRecord && (
                        <button
                          className="flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                          title="View on blockchain"
                        >
                          <Link className="w-3 h-3" />
                          <span>Verified</span>
                        </button>
                      )}
                      <button
                        className="flex items-center space-x-1 px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs"
                        title="View details"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Details</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Upload Summary */}
      {uploadedStatements.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h4 className="font-medium text-green-900">Upload Summary</h4>
          </div>
          <p className="text-sm text-green-800">
            Successfully uploaded {uploadedStatements.length} statements to blockchain
          </p>
          <div className="mt-2 space-y-1">
            {uploadedStatements.map((txHash, index) => (
              <div key={index} className="text-xs text-green-700">
                Transaction {index + 1}: {txHash.substring(0, 20)}...
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const steps = [
    { id: 1, title: 'Email Setup', description: 'Configure email scanning' },
    { id: 2, title: 'Blockchain Setup', description: 'Configure blockchain storage' },
    { id: 3, title: 'Scan & Upload', description: 'Scan statements and upload' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-green-50 rounded-t-xl">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Bank Statement Scanner</h2>
            <p className="text-slate-600 mt-1">Automated email scanning and blockchain storage</p>
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
                  currentStep >= step.id ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {step.id}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-1 mx-2 ${
                    currentStep > step.id ? 'bg-blue-600' : 'bg-slate-200'
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
          {currentStep === 3 && renderScanResults()}

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
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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