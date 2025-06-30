import React, { useState } from 'react';
import { Plus, Shield, Eye, Unlock, Clock, Users, FileText, Hash } from 'lucide-react';
import CreateVaultModal from './CreateVaultModal';
import VaultUnlockFlow from './VaultUnlockFlow';
import BlockchainProofPage from './BlockchainProofPage';
import { Contact } from '../types';

interface Vault {
  id: string;
  name: string;
  description: string;
  category: 'Digital' | 'Physical' | 'Financial' | 'Emotional';
  document?: File;
  nextOfKin: {
    name: string;
    email: string;
    relationship: string;
  };
  flashQuestions: Array<{
    question: string;
    answer: string;
  }>;
  voiceMessage: string;
  blockchainProof: {
    vaultId: string;
    hash: string;
    timestamp: number;
    transactionId: string;
  };
  createdAt: string;
}

interface VaultDashboardProps {
  contacts: Contact[];
}

const VaultDashboard: React.FC<VaultDashboardProps> = ({ contacts }) => {
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUnlockFlow, setShowUnlockFlow] = useState<Vault | null>(null);
  const [showBlockchainProof, setShowBlockchainProof] = useState<Vault | null>(null);

  const handleCreateVault = (vaultData: any) => {
    const newVault: Vault = {
      ...vaultData,
      createdAt: new Date().toISOString()
    };
    setVaults([...vaults, newVault]);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Digital': return 'bg-purple-100 text-purple-800';
      case 'Physical': return 'bg-blue-100 text-blue-800';
      case 'Financial': return 'bg-green-100 text-green-800';
      case 'Emotional': return 'bg-pink-100 text-pink-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const VaultCard: React.FC<{ vault: Vault }> = ({ vault }) => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">{vault.name}</h3>
            <div className={`inline-block px-2 py-1 rounded text-xs font-medium mt-1 ${getCategoryColor(vault.category)}`}>
              {vault.category}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-xs text-green-700 font-medium">Secured</span>
        </div>
      </div>

      <p className="text-sm text-slate-600 mb-4 line-clamp-2">{vault.description}</p>

      <div className="space-y-3 mb-4">
        <div className="flex items-center space-x-2">
          <Users className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-600">
            Next of Kin: {vault.nextOfKin.name} ({vault.nextOfKin.relationship})
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <FileText className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-600">
            {vault.flashQuestions.length} security question{vault.flashQuestions.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <Hash className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-600 font-mono">
            {vault.blockchainProof.vaultId}
          </span>
        </div>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={() => setShowBlockchainProof(vault)}
          className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
        >
          <Eye className="w-4 h-4" />
          <span>Blockchain Proof</span>
        </button>
        
        <button
          onClick={() => setShowUnlockFlow(vault)}
          className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm"
        >
          <Unlock className="w-4 h-4" />
          <span>Test Unlock</span>
        </button>
      </div>

      <div className="pt-3 border-t border-slate-100 mt-4">
        <p className="text-xs text-slate-500">
          Created {new Date(vault.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );

  if (showBlockchainProof) {
    return (
      <BlockchainProofPage
        vault={showBlockchainProof}
        onBack={() => setShowBlockchainProof(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Heritage Vaults</h2>
          <p className="text-slate-600 mt-1">Secure your digital legacy with blockchain-verified vaults</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 bg-purple-700 text-white px-4 py-2 rounded-lg hover:bg-purple-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create Vault</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Total Vaults</p>
              <p className="text-xl font-bold text-slate-900">{vaults.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Hash className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Blockchain Secured</p>
              <p className="text-xl font-bold text-slate-900">{vaults.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Beneficiaries</p>
              <p className="text-xl font-bold text-slate-900">{new Set(vaults.map(v => v.nextOfKin.email)).size}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Avg. Questions</p>
              <p className="text-xl font-bold text-slate-900">
                {vaults.length > 0 ? Math.round(vaults.reduce((sum, v) => sum + v.flashQuestions.length, 0) / vaults.length) : 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Vaults Grid */}
      {vaults.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {vaults.map(vault => (
            <VaultCard key={vault.id} vault={vault} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-purple-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">No vaults created yet</h3>
          <p className="text-slate-600 mb-6">
            Create your first vault to start securing your digital heritage with blockchain technology.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-purple-700 text-white px-6 py-3 rounded-lg hover:bg-purple-800 transition-colors"
          >
            Create Your First Vault
          </button>
        </div>
      )}

      {/* Blockchain Info */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Hash className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Blockchain Security</h3>
            <p className="text-slate-600">Powered by Algorand - Carbon Negative Blockchain</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-slate-700">Tamper-proof records</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-slate-700">Instant verification</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-slate-700">Global accessibility</span>
          </div>
        </div>
      </div>

      {showCreateModal && (
        <CreateVaultModal
          contacts={contacts}
          onCreateVault={handleCreateVault}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {showUnlockFlow && (
        <VaultUnlockFlow
          vault={showUnlockFlow}
          onClose={() => setShowUnlockFlow(null)}
        />
      )}
    </div>
  );
};

export default VaultDashboard;