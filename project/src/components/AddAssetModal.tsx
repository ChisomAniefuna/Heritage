import React, { useState } from 'react';
import { X, DollarSign, Building, Smartphone, Heart, FileText, ChevronDown, Mic, MessageSquare, Video } from 'lucide-react';
import { Asset, Contact } from '../types';
import VoiceAssetEntry from './VoiceAssetEntry';
import VoiceMessageRecorder from './VoiceMessageRecorder';
import AvatarMessageRecorder from './AvatarMessageRecorder';

interface AddAssetModalProps {
  contacts: Contact[];
  onAdd: (asset: Omit<Asset, 'id' | 'dateAdded' | 'lastUpdated'>) => void;
  onClose: () => void;
}

const AddAssetModal: React.FC<AddAssetModalProps> = ({ contacts, onAdd, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'financial' as Asset['category'],
    type: '',
    value: '',
    location: '',
    instructions: '',
    beneficiaries: [] as string[],
    accountInfo: '',
    accessInstructions: '',
    requiredDocuments: '',
    voiceMessages: [] as Array<{
      id: string;
      text: string;
      audioUrl: string;
      voiceId: string;
      language: string;
      beneficiary?: string;
    }>,
    avatarMessages: [] as Array<{
      id: string;
      videoId: string;
      script: string;
      replicaId: string;
      beneficiary?: string;
      assetName?: string;
    }>
  });

  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showAvatarRecorder, setShowAvatarRecorder] = useState(false);
  const [voiceRecorderTitle, setVoiceRecorderTitle] = useState('');

  const categories = [
    { id: 'financial', label: 'Financial', icon: DollarSign },
    { id: 'property', label: 'Property', icon: Building },
    { id: 'digital', label: 'Digital', icon: Smartphone },
    { id: 'personal', label: 'Personal', icon: Heart },
    { id: 'legal', label: 'Legal', icon: FileText },
  ] as const;

  const assetTypesByCategory = {
    financial: [
      'Bank Account',
      'Investment Account',
      'Retirement Account (401k/IRA)',
      'Crypto Wallet',
      'Brokerage Account',
      'Money Market Account',
      'Certificate of Deposit',
      'Savings Account',
      'Other Financial Asset'
    ],
    property: [
      'Real Estate - Primary Residence',
      'Real Estate - Investment Property',
      'Land/Vacant Lot',
      'Vehicle',
      'Boat/Watercraft',
      'Other Property'
    ],
    digital: [
      'Cloud Storage Account',
      'Social Media Account',
      'Email Account',
      'Digital Photos/Videos',
      'Domain Names',
      'Digital Subscriptions',
      'NFTs/Digital Collectibles',
      'Other Digital Asset'
    ],
    personal: [
      'Jewelry',
      'Gold/Precious Metals',
      'Art/Collectibles',
      'Antiques',
      'Family Heirlooms',
      'Other Personal Items'
    ],
    legal: [
      'Will/Testament',
      'Trust Documents',
      'Power of Attorney',
      'Insurance Policies',
      'Legal Contracts',
      'Other Legal Documents'
    ]
  };

  const handleFieldUpdate = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Combine all instruction fields into the main instructions field
    const combinedInstructions = [
      formData.instructions,
      formData.accountInfo ? `Account Information: ${formData.accountInfo}` : '',
      formData.accessInstructions ? `Access Instructions: ${formData.accessInstructions}` : '',
      formData.requiredDocuments ? `Required Documents: ${formData.requiredDocuments}` : ''
    ].filter(Boolean).join('\n\n');

    // Add voice messages to instructions if any exist
    const voiceMessageText = formData.voiceMessages.length > 0 
      ? `\n\nVoice Messages:\n${formData.voiceMessages.map((vm, index) => 
          `${index + 1}. ${vm.text} (${vm.language})`
        ).join('\n')}`
      : '';

    // Add avatar messages to instructions if any exist
    const avatarMessageText = formData.avatarMessages.length > 0 
      ? `\n\nAvatar Messages:\n${formData.avatarMessages.map((am, index) => 
          `${index + 1}. Video ID: ${am.videoId} - ${am.script.substring(0, 100)}...`
        ).join('\n')}`
      : '';

    onAdd({
      ...formData,
      instructions: combinedInstructions + voiceMessageText + avatarMessageText
    });
    onClose();
  };

  const handleBeneficiaryChange = (contactName: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        beneficiaries: [...formData.beneficiaries, contactName]
      });
    } else {
      setFormData({
        ...formData,
        beneficiaries: formData.beneficiaries.filter(name => name !== contactName)
      });
    }
  };

  const openVoiceRecorder = (title: string) => {
    setVoiceRecorderTitle(title);
    setShowVoiceRecorder(true);
  };

  const handleVoiceMessageSave = (voiceMessage: {
    text: string;
    audioUrl: string;
    voiceId: string;
    language: string;
  }) => {
    const newVoiceMessage = {
      ...voiceMessage,
      id: Date.now().toString()
    };

    setFormData(prev => ({
      ...prev,
      voiceMessages: [...prev.voiceMessages, newVoiceMessage]
    }));
    setShowVoiceRecorder(false);
  };

  const handleAvatarMessageSave = (avatarMessage: {
    videoId: string;
    script: string;
    replicaId: string;
    beneficiary?: string;
    assetName?: string;
  }) => {
    const newAvatarMessage = {
      ...avatarMessage,
      id: Date.now().toString(),
      assetName: formData.name || 'Asset'
    };

    setFormData(prev => ({
      ...prev,
      avatarMessages: [...prev.avatarMessages, newAvatarMessage]
    }));
    setShowAvatarRecorder(false);
  };

  const removeVoiceMessage = (messageId: string) => {
    setFormData(prev => ({
      ...prev,
      voiceMessages: prev.voiceMessages.filter(vm => vm.id !== messageId)
    }));
  };

  const removeAvatarMessage = (messageId: string) => {
    setFormData(prev => ({
      ...prev,
      avatarMessages: prev.avatarMessages.filter(am => am.id !== messageId)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50 rounded-t-xl">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Add New Asset</h2>
            <p className="text-slate-600 mt-1">Secure your legacy with AI-powered voice and video messages</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Asset Category Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-3">
              Asset Category *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {categories.map(category => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: category.id, type: '' })}
                    className={`flex flex-col items-center space-y-3 p-4 border-2 rounded-xl transition-all duration-200 ${
                      formData.category === category.id
                        ? 'border-slate-900 bg-slate-50 shadow-md'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`w-6 h-6 ${
                      formData.category === category.id ? 'text-slate-900' : 'text-slate-600'
                    }`} />
                    <span className={`text-sm font-medium ${
                      formData.category === category.id ? 'text-slate-900' : 'text-slate-700'
                    }`}>{category.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Voice-Powered Asset Entry */}
          <VoiceAssetEntry
            onFieldUpdate={handleFieldUpdate}
            currentValues={{
              name: formData.name,
              location: formData.location,
              value: formData.value,
              instructions: formData.instructions,
              accountInfo: formData.accountInfo,
              accessInstructions: formData.accessInstructions
            }}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Asset Type *
                </label>
                <div className="relative">
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent appearance-none bg-white"
                  >
                    <option value="">Select asset type...</option>
                    {assetTypesByCategory[formData.category].map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Required Documents
                </label>
                <textarea
                  value={formData.requiredDocuments}
                  onChange={(e) => setFormData({ ...formData, requiredDocuments: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  placeholder="Death certificate, ID, legal documents needed for access..."
                />
              </div>
            </div>

            {/* Right Column - AI Messages */}
            <div className="space-y-6">
              {/* Voice Messages */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900 flex items-center space-x-2">
                    <MessageSquare className="w-5 h-5 text-purple-600" />
                    <span>Voice Messages</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => openVoiceRecorder('Personal Voice Message')}
                    className="flex items-center space-x-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                  >
                    <Mic className="w-4 h-4" />
                    <span>Add Voice</span>
                  </button>
                </div>

                {formData.voiceMessages.length > 0 ? (
                  <div className="space-y-3">
                    {formData.voiceMessages.map((message, index) => (
                      <div key={message.id} className="bg-white rounded-lg p-4 border border-purple-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm text-slate-700 mb-2">{message.text}</p>
                            <div className="flex items-center space-x-2">
                              <audio controls className="h-8">
                                <source src={message.audioUrl} type="audio/mpeg" />
                              </audio>
                              <span className="text-xs text-slate-500">
                                {message.language.toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeVoiceMessage(message.id)}
                            className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-600 text-center py-4">
                    No voice messages yet. Add a personal audio message for your beneficiaries.
                  </p>
                )}
              </div>

              {/* Avatar Messages */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900 flex items-center space-x-2">
                    <Video className="w-5 h-5 text-blue-600" />
                    <span>Avatar Messages</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowAvatarRecorder(true)}
                    className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <Video className="w-4 h-4" />
                    <span>Add Avatar</span>
                  </button>
                </div>

                {formData.avatarMessages.length > 0 ? (
                  <div className="space-y-3">
                    {formData.avatarMessages.map((message, index) => (
                      <div key={message.id} className="bg-white rounded-lg p-4 border border-blue-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm text-slate-700 mb-2">
                              {message.script.substring(0, 100)}...
                            </p>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                Video ID: {message.videoId.substring(0, 8)}...
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeAvatarMessage(message.id)}
                            className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-600 text-center py-4">
                    No avatar messages yet. Create a personalized video message with your AI avatar.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Beneficiaries Section */}
          {contacts.length > 0 && (
            <div className="bg-slate-50 rounded-xl p-6">
              <label className="block text-sm font-semibold text-slate-900 mb-4">
                Assign Beneficiaries
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-40 overflow-y-auto">
                {contacts.map(contact => (
                  <label key={contact.id} className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.beneficiaries.includes(contact.name)}
                      onChange={(e) => handleBeneficiaryChange(contact.name, e.target.checked)}
                      className="rounded border-slate-300 text-slate-900 focus:ring-slate-500"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-slate-900">{contact.name}</span>
                      <span className="text-xs text-slate-500 ml-2">({contact.relationship})</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium shadow-lg hover:shadow-xl"
            >
              Add Asset with AI Messages
            </button>
          </div>
        </form>
      </div>

      {showVoiceRecorder && (
        <VoiceMessageRecorder
          title={voiceRecorderTitle}
          onSave={handleVoiceMessageSave}
          onClose={() => setShowVoiceRecorder(false)}
        />
      )}

      {showAvatarRecorder && (
        <AvatarMessageRecorder
          onSave={handleAvatarMessageSave}
          onClose={() => setShowAvatarRecorder(false)}
          assetName={formData.name}
          title="Create Avatar Message for Asset"
        />
      )}
    </div>
  );
};

export default AddAssetModal;