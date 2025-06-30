import React, { useState, useEffect } from 'react';
import { Shield, Key, Clock, CheckCircle, AlertTriangle, Copy, ExternalLink, Wallet } from 'lucide-react';
import { algorandService, HeritageVaultAlgorand, AlgorandWallet, AssetProof } from '../services/algorand';

interface BlockchainSecurityPanelProps {
  onClose: () => void;
}

const BlockchainSecurityPanel: React.FC<BlockchainSecurityPanelProps> = ({ onClose }) => {
  const [wallet, setWallet] = useState<AlgorandWallet | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [networkStatus, setNetworkStatus] = useState<any>(null);

  useEffect(() => {
    initializeBlockchain();
  }, []);

  const initializeBlockchain = async () => {
    try {
      setLoading(true);
      
      // Initialize user wallet
      const userWallet = await HeritageVaultAlgorand.initializeUserWallet();
      setWallet(userWallet);
      
      if (userWallet) {
        // Get account balance
        const accountBalance = await HeritageVaultAlgorand.getAccountBalance();
        setBalance(accountBalance);
        
        // Get network status
        const status = await algorandService.getNetworkStatus();
        setNetworkStatus(status);
      }
    } catch (error) {
      console.error('Error initializing blockchain:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const securityFeatures = [
    {
      icon: Shield,
      title: 'Immutable Asset Records',
      description: 'All your assets are cryptographically secured on the Algorand blockchain, making them tamper-proof.',
      status: 'active'
    },
    {
      icon: Key,
      title: 'Cryptographic Verification',
      description: 'Each asset has a unique hash that proves its authenticity and detects any unauthorized changes.',
      status: 'active'
    },
    {
      icon: Clock,
      title: 'Time-Locked Release',
      description: 'Smart contracts automatically enforce release conditions without human intervention.',
      status: 'active'
    },
    {
      icon: CheckCircle,
      title: 'Decentralized Backup',
      description: 'Your inheritance data is distributed across thousands of nodes worldwide.',
      status: 'active'
    }
  ];

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-purple-700 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-700">Initializing blockchain security...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-purple-50 to-blue-50 rounded-t-xl">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Blockchain Security</h2>
            <p className="text-slate-600 mt-1">Powered by Algorand - Carbon Negative Blockchain</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Wallet Information */}
          {wallet && (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-purple-700" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Your Blockchain Wallet</h3>
                  <p className="text-slate-600 text-sm">Secured by Algorand's quantum-resistant cryptography</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">Wallet Address</span>
                    <button
                      onClick={() => copyToClipboard(wallet.address)}
                      className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs font-mono text-slate-900 break-all">
                    {wallet.address}
                  </p>
                </div>

                <div className="bg-white rounded-lg p-4 border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">Balance</span>
                    <a
                      href={`https://testnet.algoexplorer.io/address/${wallet.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                  <p className="text-lg font-semibold text-slate-900">
                    {balance.toFixed(6)} ALGO
                  </p>
                  <p className="text-xs text-slate-500">Testnet Balance</p>
                </div>
              </div>

              <div className="mt-4">
                <button
                  onClick={() => setShowMnemonic(!showMnemonic)}
                  className="flex items-center space-x-2 text-sm text-purple-700 hover:text-purple-800 transition-colors"
                >
                  <Key className="w-4 h-4" />
                  <span>{showMnemonic ? 'Hide' : 'Show'} Recovery Phrase</span>
                </button>
                
                {showMnemonic && (
                  <div className="mt-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-800">Keep this safe!</span>
                    </div>
                    <p className="text-xs font-mono text-yellow-900 break-all mb-2">
                      {wallet.mnemonic}
                    </p>
                    <p className="text-xs text-yellow-700">
                      This 25-word phrase can restore your wallet. Never share it with anyone.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Security Features */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Security Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {securityFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="bg-white rounded-lg p-4 border border-slate-200 hover:border-purple-300 transition-colors">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-900 mb-1">{feature.title}</h4>
                        <p className="text-sm text-slate-600">{feature.description}</p>
                        <div className="flex items-center space-x-1 mt-2">
                          <CheckCircle className="w-3 h-3 text-green-600" />
                          <span className="text-xs text-green-700 font-medium">Active</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Network Status */}
          {networkStatus && (
            <div className="bg-slate-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Network Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {networkStatus['last-round']?.toLocaleString()}
                  </div>
                  <div className="text-sm text-slate-600">Current Block</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {networkStatus['time-since-last-round']}ms
                  </div>
                  <div className="text-sm text-slate-600">Block Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    Testnet
                  </div>
                  <div className="text-sm text-slate-600">Network</div>
                </div>
              </div>
            </div>
          )}

          {/* How It Works */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">How Blockchain Security Works</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-medium text-slate-900">Asset Hashing</h4>
                  <p className="text-sm text-slate-600">Each asset is converted to a unique cryptographic hash that acts as a digital fingerprint.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-medium text-slate-900">Blockchain Storage</h4>
                  <p className="text-sm text-slate-600">The hash and metadata are permanently recorded on Algorand's carbon-negative blockchain.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-medium text-slate-900">Smart Contract Enforcement</h4>
                  <p className="text-sm text-slate-600">Release conditions are enforced automatically by smart contracts, eliminating human error.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  4
                </div>
                <div>
                  <h4 className="font-medium text-slate-900">Tamper Detection</h4>
                  <p className="text-sm text-slate-600">Any changes to your assets are immediately detected by comparing current data with blockchain records.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-green-50 rounded-xl p-6 border border-green-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Why Algorand?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-slate-700">Carbon negative blockchain</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-slate-700">4.5 second finality</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-slate-700">Quantum-resistant security</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-slate-700">Low transaction fees</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-slate-700">Pure proof-of-stake consensus</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-slate-700">Built-in smart contracts</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-6 border-t border-slate-200">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => window.open('https://developer.algorand.org/', '_blank')}
              className="flex-1 px-6 py-3 bg-purple-700 text-white rounded-lg hover:bg-purple-800 transition-colors flex items-center justify-center space-x-2"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Learn More About Algorand</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockchainSecurityPanel;