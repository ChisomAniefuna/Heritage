import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle, AlertTriangle, Loader } from 'lucide-react';
import { HeritageVaultAlgorand, AssetProof } from '../services/algorand';
import { Asset } from '../types';

interface AssetSecurityBadgeProps {
  asset: Asset;
  onSecure?: (proof: AssetProof) => void;
}

const AssetSecurityBadge: React.FC<AssetSecurityBadgeProps> = ({ asset, onSecure }) => {
  const [securityStatus, setSecurityStatus] = useState<'unsecured' | 'securing' | 'secured' | 'verified' | 'tampered'>('unsecured');
  const [proof, setProof] = useState<AssetProof | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkAssetSecurity();
  }, [asset]);

  const checkAssetSecurity = async () => {
    // Check if asset has blockchain proof stored
    const storedProof = localStorage.getItem(`asset_proof_${asset.id}`);
    
    if (storedProof) {
      try {
        const assetProof: AssetProof = JSON.parse(storedProof);
        setProof(assetProof);
        
        // Verify the asset hasn't been tampered with
        const isValid = await HeritageVaultAlgorand.verifyAsset(asset, assetProof);
        setSecurityStatus(isValid ? 'verified' : 'tampered');
      } catch (error) {
        console.error('Error checking asset security:', error);
        setSecurityStatus('unsecured');
      }
    }
  };

  const secureAsset = async () => {
    setLoading(true);
    setSecurityStatus('securing');
    
    try {
      // Get beneficiary addresses (simplified - in production, you'd have proper address mapping)
      const beneficiaryAddress = await HeritageVaultAlgorand.getUserAddress();
      
      const assetProof = await HeritageVaultAlgorand.secureAsset(asset, beneficiaryAddress || undefined);
      
      if (assetProof) {
        setProof(assetProof);
        setSecurityStatus('secured');
        
        // Store proof locally (in production, this would be in a secure database)
        localStorage.setItem(`asset_proof_${asset.id}`, JSON.stringify(assetProof));
        
        if (onSecure) {
          onSecure(assetProof);
        }
      } else {
        setSecurityStatus('unsecured');
      }
    } catch (error) {
      console.error('Error securing asset:', error);
      setSecurityStatus('unsecured');
    } finally {
      setLoading(false);
    }
  };

  const getStatusDisplay = () => {
    switch (securityStatus) {
      case 'unsecured':
        return {
          icon: Shield,
          text: 'Secure on Blockchain',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          buttonColor: 'bg-purple-700 hover:bg-purple-800 text-white',
          clickable: true
        };
      case 'securing':
        return {
          icon: Loader,
          text: 'Securing...',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          buttonColor: 'bg-blue-600 text-white cursor-not-allowed',
          clickable: false
        };
      case 'secured':
      case 'verified':
        return {
          icon: CheckCircle,
          text: 'Blockchain Secured',
          color: 'bg-green-100 text-green-800 border-green-200',
          buttonColor: 'bg-green-600 text-white cursor-not-allowed',
          clickable: false
        };
      case 'tampered':
        return {
          icon: AlertTriangle,
          text: 'Security Alert',
          color: 'bg-red-100 text-red-800 border-red-200',
          buttonColor: 'bg-red-600 hover:bg-red-700 text-white',
          clickable: true
        };
      default:
        return {
          icon: Shield,
          text: 'Secure',
          color: 'bg-slate-100 text-slate-800 border-slate-200',
          buttonColor: 'bg-slate-600 text-white',
          clickable: false
        };
    }
  };

  const status = getStatusDisplay();
  const Icon = status.icon;

  return (
    <div className="space-y-2">
      <button
        onClick={status.clickable ? secureAsset : undefined}
        disabled={loading || !status.clickable}
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${status.color} ${status.buttonColor}`}
      >
        <Icon className={`w-4 h-4 ${securityStatus === 'securing' ? 'animate-spin' : ''}`} />
        <span>{status.text}</span>
      </button>

      {proof && (
        <div className="text-xs text-slate-600 space-y-1">
          <div>Block: #{proof.blockNumber}</div>
          <div className="font-mono truncate">TX: {proof.transactionId.substring(0, 16)}...</div>
          <div>Secured: {new Date(proof.timestamp).toLocaleDateString()}</div>
        </div>
      )}

      {securityStatus === 'tampered' && (
        <div className="text-xs text-red-700 bg-red-50 p-2 rounded border border-red-200">
          ⚠️ Asset data has been modified since blockchain verification. This could indicate tampering.
        </div>
      )}
    </div>
  );
};

export default AssetSecurityBadge;