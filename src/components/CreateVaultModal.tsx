import React, { useState } from 'react';
import { X, Upload, Users, FileText, Shield, CheckCircle, Hash, Clock } from 'lucide-react';
import { Contact } from '../types';

interface CreateVaultModalProps {
  contacts: Contact[];
  onCreateVault: (vault: VaultData) => void;
  onClose: () => void;
}

interface VaultData {
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
}

const CreateVaultModal: React.FC<CreateVaultModalProps> = ({ contacts, onCreateVault, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [vaultData, setVaultData] = useState<Partial<VaultData>>({
    name: '',
    description: '',
    category: 'Digital',
    flashQuestions: [{ question: '', answer: '' }],
    voiceMessage: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showBlockchainConfirmation, setShowBlockchainConfirmation] = useState(false);

  const categories = [
    { id: 'Digital', label: 'Digital', description: 'Crypto wallets, online accounts, digital assets', color: 'bg-purple-100 text-purple-800' },
    { id: 'Physical', label: 'Physical', description: 'Real estate, jewelry, collectibles', color: 'bg-blue-100 text-blue-800' },
    { id: 'Financial', label: 'Financial', description: 'Bank accounts, investments, insurance', color: 'bg-green-100 text-green-800' },
    { id: 'Emotional', label: 'Emotional', description: 'Letters, photos, family memories', color: 'bg-pink-100 text-pink-800' }
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const addFlashQuestion = () => {
    if (vaultData.flashQuestions && vaultData.flashQuestions.length < 3) {
      setVaultData({
        ...vaultData,
        flashQuestions: [...vaultData.flashQuestions, { question: '', answer: '' }]
      });
    }
  };

  const updateFlashQuestion = (index: number, field: 'question' | 'answer', value: string) => {
    const questions = [...(vaultData.flashQuestions || [])];
    questions[index] = { ...questions[index], [field]: value };
    setVaultData({ ...vaultData, flashQuestions: questions });
  };

  const removeFlashQuestion = (index: number) => {
    const questions = vaultData.flashQuestions?.filter((_, i) => i !== index) || [];
    setVaultData({ ...vaultData, flashQuestions: questions });
  };

  const generateVaultId = () => {
    return 'vault_' + Math.random().toString(36).substr(2, 9).toUpperCase();
  };

  const generateBlockchainHash = (data: any) => {
    // Simulate blockchain hash generation
    const dataString = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < dataString.length; i++) {
      const char = dataString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
  };

  const simulateBlockchainSubmission = async () => {
    setIsSubmitting(true);
    
    // Simulate blockchain processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const vaultId = generateVaultId();
    const blockchainHash = generateBlockchainHash({
      vaultId,
      name: vaultData.name,
      category: vaultData.category,
      timestamp: Date.now()
    });
    
    const blockchainProof = {
      vaultId,
      hash: blockchainHash,
      timestamp: Date.now(),
      transactionId: `tx_${Math.random().toString(36).substr(2, 16).toUpperCase()}`
    };

    const completeVault: VaultData = {
      id: vaultId,
      name: vaultData.name!,
      description: vaultData.description!,
      category: vaultData.category!,
      document: selectedFile || undefined,
      nextOfKin: {
        name: selectedContact!.name,
        email: selectedContact!.email,
        relationship: selectedContact!.relationship
      },
      flashQuestions: vaultData.flashQuestions!.filter(q => q.question && q.answer),
      voiceMessage: vaultData.voiceMessage!,
      blockchainProof
    };

    setIsSubmitting(false);
    setShowBlockchainConfirmation(true);
    
    // Auto-close confirmation after 3 seconds and create vault
    setTimeout(() => {
      onCreateVault(completeVault);
      onClose();
    }, 3000);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-3">
                Vault Name *
              </label>
              <input
                type="text"
                value={vaultData.name || ''}
                onChange={(e) => setVaultData({ ...vaultData, name: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., My crypto wallet, Family home deed, Investment portfolio"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-3">
                Description
              </label>
              <textarea
                value={vaultData.description || ''}
                onChange={(e) => setVaultData({ ...vaultData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Describe what this vault contains and any important details..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-3">
                Category *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {categories.map(category => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setVaultData({ ...vaultData, category: category.id as any })}
                    className={`p-4 text-left border-2 rounded-lg transition-all ${
                      vaultData.category === category.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className={`inline-block px-2 py-1 rounded text-xs font-medium mb-2 ${category.color}`}>
                      {category.label}
                    </div>
                    <p className="text-sm text-slate-600">{category.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-3">
                Upload Document (Optional)
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="document-upload"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
                <label htmlFor="document-upload" className="cursor-pointer">
                  {selectedFile ? (
                    <div className="flex items-center justify-center space-x-2">
                      <FileText className="w-5 h-5 text-green-600" />
                      <span className="text-sm text-slate-700">{selectedFile.name}</span>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-600">Click to upload PDF, image, or document</p>
                    </div>
                  )}
                </label>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-3">
                Assign Next of Kin *
              </label>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {contacts.map(contact => (
                  <button
                    key={contact.id}
                    type="button"
                    onClick={() => setSelectedContact(contact)}
                    className={`w-full flex items-center space-x-3 p-4 border-2 rounded-lg transition-all text-left ${
                      selectedContact?.id === contact.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-900">{contact.name}</h4>
                      <p className="text-sm text-slate-600">{contact.relationship}</p>
                      <p className="text-xs text-slate-500">{contact.email}</p>
                    </div>
                  </button>
                ))}
              </div>
              
              {contacts.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-slate-300 rounded-lg">
                  <Users className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-600 mb-4">No contacts available. Add a contact first.</p>
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-semibold text-slate-900">
                  Flash Questions (Security Gates)
                </label>
                <button
                  type="button"
                  onClick={addFlashQuestion}
                  disabled={vaultData.flashQuestions?.length >= 3}
                  className="text-sm text-purple-700 hover:text-purple-800 disabled:text-slate-400"
                >
                  + Add Question
                </button>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                Create up to 3 questions that your next of kin must answer correctly to unlock the vault.
              </p>
              
              <div className="space-y-4">
                {vaultData.flashQuestions?.map((q, index) => (
                  <div key={index} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-slate-700">Question {index + 1}</span>
                      {vaultData.flashQuestions!.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeFlashQuestion(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={q.question}
                      onChange={(e) => updateFlashQuestion(index, 'question', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg mb-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="e.g., What was mom's favorite flower?"
                    />
                    <input
                      type="text"
                      value={q.answer}
                      onChange={(e) => updateFlashQuestion(index, 'answer', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Correct answer"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-3">
                Voice Message
              </label>
              <p className="text-sm text-slate-600 mb-4">
                Write a heartfelt message that will be converted to voice using AI.
              </p>
              <textarea
                value={vaultData.voiceMessage || ''}
                onChange={(e) => setVaultData({ ...vaultData, voiceMessage: e.target.value })}
                rows={6}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Dear [Name], if you're hearing this message, it means I'm no longer with you. I want you to know that..."
              />
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-purple-900">Upgrade Available</span>
              </div>
              <p className="text-sm text-purple-800 mb-3">
                Add more voice messages with different tones and languages for ₦1,500
              </p>
              <button className="text-sm text-purple-700 hover:text-purple-800 font-medium">
                Learn More →
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (showBlockchainConfirmation) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Vault Created Successfully!</h3>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <Hash className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-900">Blockchain Proof</span>
            </div>
            <p className="text-xs text-green-800 mb-1">
              Vault ID: <span className="font-mono">{vaultData.name}</span>
            </p>
            <p className="text-xs text-green-700">
              ✅ Vault fingerprint recorded on Algorand blockchain
            </p>
          </div>
          <p className="text-sm text-slate-600">
            Your vault is now digitally signed and tamper-proof. Redirecting...
          </p>
        </div>
      </div>
    );
  }

  if (isSubmitting) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-md w-full p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-purple-700 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Creating Vault...</h3>
          <p className="text-sm text-slate-600 mb-4">
            Generating blockchain proof and securing your vault
          </p>
          <div className="space-y-2 text-xs text-slate-500">
            <div className="flex items-center justify-center space-x-2">
              <Clock className="w-3 h-3" />
              <span>Hashing vault data...</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Shield className="w-3 h-3" />
              <span>Recording on Algorand blockchain...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-xl">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Create a Vault</h2>
            <p className="text-slate-600 mt-1">Step {currentStep} of 4: Secure your digital heritage</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 bg-slate-50">
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4].map(step => (
              <React.Fragment key={step}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step 
                    ? 'bg-purple-700 text-white' 
                    : 'bg-slate-200 text-slate-600'
                }`}>
                  {step}
                </div>
                {step < 4 && (
                  <div className={`flex-1 h-1 rounded ${
                    currentStep > step ? 'bg-purple-700' : 'bg-slate-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="p-6">
          {renderStep()}

          {/* Navigation */}
          <div className="flex justify-between pt-6 border-t border-slate-200 mt-6">
            <button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              {currentStep < 4 ? (
                <button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  disabled={
                    (currentStep === 1 && (!vaultData.name || !vaultData.category)) ||
                    (currentStep === 2 && !selectedContact)
                  }
                  className="px-6 py-2 bg-purple-700 text-white rounded-lg hover:bg-purple-800 disabled:bg-slate-400 transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={simulateBlockchainSubmission}
                  disabled={!vaultData.voiceMessage}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-slate-400 transition-colors"
                >
                  Create Vault
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateVaultModal;