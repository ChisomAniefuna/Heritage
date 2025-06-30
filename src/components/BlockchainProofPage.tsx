import React from 'react';
import { Shield, Hash, Clock, ExternalLink, CheckCircle, Copy, ArrowLeft } from 'lucide-react';

interface BlockchainProofPageProps {
  vault: {
    id: string;
    name: string;
    description: string;
    category: string;
    blockchainProof: {
      vaultId: string;
      hash: string;
      timestamp: number;
      transactionId: string;
    };
  };
  onBack: () => void;
}

const BlockchainProofPage: React.FC<BlockchainProofPageProps> = ({ vault, onBack }) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const openAlgoExplorer = () => {
    window.open(`https://testnet.algoexplorer.io/tx/${vault.blockchainProof.transactionId}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Vault</span>
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-6 text-white">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Blockchain Proof</h1>
                <p className="text-purple-100">Tamper-proof verification for "{vault.name}"</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 space-y-8">
            {/* Verification Status */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <h2 className="text-lg font-semibold text-green-900">Verified on Algorand Blockchain</h2>
              </div>
              <p className="text-green-800">
                This vault's fingerprint has been logged on Algorand's decentralized ledger to ensure 
                it remains tamper-proof and verifiable. The blockchain record serves as immutable proof 
                of the vault's existence and integrity.
              </p>
            </div>

            {/* Vault Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-50 rounded-lg p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Vault Details</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-slate-600">Name:</span>
                    <p className="font-medium text-slate-900">{vault.name}</p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-600">Category:</span>
                    <p className="font-medium text-slate-900">{vault.category}</p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-600">Description:</span>
                    <p className="font-medium text-slate-900">{vault.description}</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Security Features</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-slate-700">Cryptographic hashing</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-slate-700">Immutable blockchain record</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-slate-700">Tamper detection</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-slate-700">Decentralized verification</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Blockchain Details */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Hash className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">Blockchain Record</h3>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-1">Vault ID</label>
                    <div className="flex items-center space-x-2">
                      <code className="flex-1 px-3 py-2 bg-white border border-blue-200 rounded text-sm font-mono text-blue-900">
                        {vault.blockchainProof.vaultId}
                      </code>
                      <button
                        onClick={() => copyToClipboard(vault.blockchainProof.vaultId)}
                        className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-1">Timestamp</label>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 px-3 py-2 bg-white border border-blue-200 rounded text-sm text-blue-900">
                        {new Date(vault.blockchainProof.timestamp).toLocaleString()}
                      </div>
                      <Clock className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-1">Cryptographic Hash</label>
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 px-3 py-2 bg-white border border-blue-200 rounded text-sm font-mono text-blue-900 break-all">
                      {vault.blockchainProof.hash}
                    </code>
                    <button
                      onClick={() => copyToClipboard(vault.blockchainProof.hash)}
                      className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-1">Transaction ID</label>
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 px-3 py-2 bg-white border border-blue-200 rounded text-sm font-mono text-blue-900 break-all">
                      {vault.blockchainProof.transactionId}
                    </code>
                    <button
                      onClick={() => copyToClipboard(vault.blockchainProof.transactionId)}
                      className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={openAlgoExplorer}
                      className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
                      title="View on Algorand Explorer"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* How It Works */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <h3 className="font-semibold text-purple-900 mb-4">How Blockchain Verification Works</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      1
                    </div>
                    <div>
                      <h4 className="font-medium text-purple-900">Data Hashing</h4>
                      <p className="text-sm text-purple-700">Your vault data is converted to a unique cryptographic fingerprint.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      2
                    </div>
                    <div>
                      <h4 className="font-medium text-purple-900">Blockchain Recording</h4>
                      <p className="text-sm text-purple-700">The hash is permanently recorded on Algorand's blockchain.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      3
                    </div>
                    <div>
                      <h4 className="font-medium text-purple-900">Tamper Detection</h4>
                      <p className="text-sm text-purple-700">Any changes to your vault are immediately detectable.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      4
                    </div>
                    <div>
                      <h4 className="font-medium text-purple-900">Global Verification</h4>
                      <p className="text-sm text-purple-700">Anyone can verify the vault's authenticity using the blockchain.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Important Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
              <h3 className="font-semibold text-amber-900 mb-2">Important Notice</h3>
              <p className="text-sm text-amber-800">
                This blockchain proof is viewable by the vault owner only, unless the vault has been unlocked 
                by an authorized beneficiary. The proof serves as immutable evidence of the vault's creation 
                and integrity, ensuring your digital heritage remains secure and verifiable.
              </p>
            </div>

            {/* Actions */}
            <div className="flex space-x-4 pt-6 border-t border-slate-200">
              <button
                onClick={onBack}
                className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Back to Vault
              </button>
              <button
                onClick={openAlgoExplorer}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <ExternalLink className="w-4 h-4" />
                <span>View on Blockchain</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockchainProofPage;