import React, { useState } from 'react';
import { Plus, Search, Filter, DollarSign, Building, Smartphone, Heart, FileText } from 'lucide-react';
import { Asset, Contact, ReleaseCondition } from '../types';
import AssetCard from './AssetCard';
import AddAssetModal from './AddAssetModal';
import ConditionalReleaseModal from './ConditionalReleaseModal';

interface AssetsViewProps {
  assets: Asset[];
  setAssets: (assets: Asset[]) => void;
  contacts: Contact[];
}

const AssetsView: React.FC<AssetsViewProps> = ({ assets, setAssets, contacts }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showReleaseModal, setShowReleaseModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  const categories = [
    { id: 'all', label: 'All Assets', icon: null },
    { id: 'financial', label: 'Financial', icon: DollarSign },
    { id: 'property', label: 'Property', icon: Building },
    { id: 'digital', label: 'Digital', icon: Smartphone },
    { id: 'personal', label: 'Personal', icon: Heart },
    { id: 'legal', label: 'Legal', icon: FileText },
  ];

  const filteredAssets = assets.filter(asset => {
    // Add null check to prevent accessing properties on null objects
    if (!asset) return false;
    
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || asset.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddAsset = (newAsset: Omit<Asset, 'id' | 'dateAdded' | 'lastUpdated'>) => {
    const asset: Asset = {
      ...newAsset,
      id: Date.now().toString(),
      dateAdded: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    setAssets([...assets, asset]);
  };

  const handleUpdateAsset = (updatedAsset: Asset) => {
    setAssets(assets.map(asset => 
      asset.id === updatedAsset.id 
        ? { ...updatedAsset, lastUpdated: new Date().toISOString().split('T')[0] }
        : asset
    ));
  };

  const handleDeleteAsset = (assetId: string) => {
    setAssets(assets.filter(asset => asset.id !== assetId));
  };

  const handleConfigureRelease = (asset: Asset) => {
    setSelectedAsset(asset);
    setShowReleaseModal(true);
  };

  const handleSaveReleaseConditions = (conditions: ReleaseCondition[]) => {
    if (selectedAsset) {
      const updatedAsset = {
        ...selectedAsset,
        releaseConditions: conditions,
        lastUpdated: new Date().toISOString().split('T')[0]
      };
      handleUpdateAsset(updatedAsset);
    }
    setShowReleaseModal(false);
    setSelectedAsset(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Assets</h2>
          <p className="text-slate-600 mt-1">Manage your valuable assets and inheritance items</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Asset</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2 overflow-x-auto">
            <Filter className="w-4 h-4 text-slate-600 flex-shrink-0" />
            {categories.map(category => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    selectedCategory === category.id
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  <span>{category.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredAssets.map(asset => (
          <AssetCard
            key={asset.id}
            asset={asset}
            contacts={contacts}
            onUpdate={handleUpdateAsset}
            onDelete={handleDeleteAsset}
            onConfigureRelease={handleConfigureRelease}
          />
        ))}
      </div>

      {filteredAssets.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">No assets found</h3>
          <p className="text-slate-600 mb-4">
            {searchTerm || selectedCategory !== 'all' 
              ? 'Try adjusting your search or filters' 
              : 'Get started by adding your first asset'}
          </p>
          {!searchTerm && selectedCategory === 'all' && (
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              Add Your First Asset
            </button>
          )}
        </div>
      )}

      {showAddModal && (
        <AddAssetModal
          contacts={contacts}
          onAdd={handleAddAsset}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {showReleaseModal && selectedAsset && (
        <ConditionalReleaseModal
          contacts={contacts}
          existingConditions={selectedAsset.releaseConditions}
          onSave={handleSaveReleaseConditions}
          onClose={() => {
            setShowReleaseModal(false);
            setSelectedAsset(null);
          }}
        />
      )}
    </div>
  );
};

export default AssetsView;