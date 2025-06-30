import React, { useState } from 'react';
import { MoreVertical, Edit, Trash2, DollarSign, Building, Smartphone, Heart, FileText, Users, MapPin, FileCheck, Settings, Clock } from 'lucide-react';
import { Asset, Contact } from '../types';

interface AssetCardProps {
  asset: Asset;
  contacts: Contact[];
  onUpdate: (asset: Asset) => void;
  onDelete: (assetId: string) => void;
  onConfigureRelease: (asset: Asset) => void;
}

const AssetCard: React.FC<AssetCardProps> = ({ asset, contacts, onUpdate, onDelete, onConfigureRelease }) => {
  const [showMenu, setShowMenu] = useState(false);

  // Add defensive check for null asset
  if (!asset) {
    return null;
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'financial': return DollarSign;
      case 'property': return Building;
      case 'digital': return Smartphone;
      case 'personal': return Heart;
      case 'legal': return FileText;
      default: return FileCheck;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'financial': return 'bg-green-100 text-green-800';
      case 'property': return 'bg-blue-100 text-blue-800';
      case 'digital': return 'bg-purple-100 text-purple-800';
      case 'personal': return 'bg-pink-100 text-pink-800';
      case 'legal': return 'bg-orange-100 text-orange-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const Icon = getCategoryIcon(asset.category || '');
  const hasReleaseConditions = asset.releaseConditions && asset.releaseConditions.length > 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${getCategoryColor(asset.category || '')}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">{asset.name || 'Unnamed Asset'}</h3>
            <p className="text-xs text-slate-500">{asset.type || 'Unknown Type'}</p>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-8 bg-white border border-slate-200 rounded-lg shadow-lg py-2 w-48 z-10">
              <button className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center space-x-2">
                <Edit className="w-4 h-4" />
                <span>Edit Asset</span>
              </button>
              <button 
                onClick={() => {
                  onConfigureRelease(asset);
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
              >
                <Settings className="w-4 h-4" />
                <span>Release Conditions</span>
              </button>
              <button 
                onClick={() => onDelete(asset.id)}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600">Value</span>
          <span className="font-semibold text-slate-900">{asset.value || 'Not specified'}</span>
        </div>

        <div className="flex items-start space-x-2">
          <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
          <span className="text-sm text-slate-600">{asset.location || 'Location not specified'}</span>
        </div>

        {asset.beneficiaries && asset.beneficiaries.length > 0 && (
          <div className="flex items-start space-x-2">
            <Users className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-slate-600">
                Beneficiaries: {asset.beneficiaries.join(', ')}
              </p>
            </div>
          </div>
        )}

        {hasReleaseConditions && (
          <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-blue-700">
              {asset.releaseConditions!.length} release condition{asset.releaseConditions!.length !== 1 ? 's' : ''} configured
            </span>
          </div>
        )}

        <div className="pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Updated {asset.lastUpdated ? new Date(asset.lastUpdated).toLocaleDateString() : 'Unknown'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AssetCard;