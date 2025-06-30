import React, { useState } from 'react';
import { Play, Pause, Download, CheckCircle, XCircle, Clock, User, FileText, Shield } from 'lucide-react';

interface VaultUnlockFlowProps {
  vault: {
    id: string;
    name: string;
    description: string;
    category: string;
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
  };
  onClose: () => void;
}

const VaultUnlockFlow: React.FC<VaultUnlockFlowProps> = ({ vault, onClose }) => {
  const [currentStep, setCurrentStep] = useState<'questions' | 'denied' | 'unlocked'>('questions');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [incorrectAttempts, setIncorrectAttempts] = useState(0);

  const handleAnswerSubmit = () => {
    const correctAnswer = vault.flashQuestions[currentQuestionIndex].answer.toLowerCase().trim();
    const userAnswer = currentAnswer.toLowerCase().trim();
    
    if (userAnswer === correctAnswer) {
      const newAnswers = [...userAnswers, currentAnswer];
      setUserAnswers(newAnswers);
      setCurrentAnswer('');
      
      if (currentQuestionIndex < vault.flashQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        // All questions answered correctly
        setCurrentStep('unlocked');
      }
    } else {
      const newAttempts = incorrectAttempts + 1;
      setIncorrectAttempts(newAttempts);
      
      if (newAttempts >= 3) {
        setCurrentStep('denied');
      } else {
        alert(`Incorrect answer. ${3 - newAttempts} attempts remaining.`);
        setCurrentAnswer('');
      }
    }
  };

  const playVoiceMessage = () => {
    setIsPlaying(!isPlaying);
    // Simulate voice playback
    if (!isPlaying) {
      setTimeout(() => setIsPlaying(false), 5000);
    }
  };

  const downloadVaultSummary = () => {
    const summary = `
HERITAGE VAULT SUMMARY
======================

Vault ID: ${vault.id}
Vault Name: ${vault.name}
Category: ${vault.category}
Created for: ${vault.nextOfKin.name} (${vault.nextOfKin.relationship})

Description:
${vault.description}

Voice Message:
${vault.voiceMessage}

Blockchain Proof:
- Transaction ID: ${vault.blockchainProof.transactionId}
- Hash: ${vault.blockchainProof.hash}
- Timestamp: ${new Date(vault.blockchainProof.timestamp).toLocaleString()}

This vault was unlocked on ${new Date().toLocaleString()}
    `;
    
    const blob = new Blob([summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${vault.name}_summary.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderQuestions = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-purple-600" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Identity Verification</h3>
        <p className="text-slate-600">
          Answer the security questions to unlock "{vault.name}"
        </p>
      </div>

      <div className="bg-slate-50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-slate-700">
            Question {currentQuestionIndex + 1} of {vault.flashQuestions.length}
          </span>
          <span className="text-sm text-slate-500">
            {3 - incorrectAttempts} attempts remaining
          </span>
        </div>
        
        <div className="mb-4">
          <h4 className="text-lg font-medium text-slate-900 mb-3">
            {vault.flashQuestions[currentQuestionIndex].question}
          </h4>
          <input
            type="text"
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Enter your answer..."
            onKeyPress={(e) => e.key === 'Enter' && handleAnswerSubmit()}
          />
        </div>
        
        <button
          onClick={handleAnswerSubmit}
          disabled={!currentAnswer.trim()}
          className="w-full px-4 py-3 bg-purple-700 text-white rounded-lg hover:bg-purple-800 disabled:bg-slate-400 transition-colors"
        >
          Submit Answer
        </button>
      </div>

      <div className="text-center">
        <p className="text-xs text-slate-500">
          These questions were set by the vault creator to ensure only authorized access.
        </p>
      </div>
    </div>
  );

  const renderDenied = () => (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
        <XCircle className="w-8 h-8 text-red-600" />
      </div>
      
      <div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Access Denied</h3>
        <p className="text-slate-600 mb-4">
          You have exceeded the maximum number of attempts to unlock this vault.
        </p>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="w-4 h-4 text-red-600" />
            <span className="font-medium text-red-900">Security Lockout</span>
          </div>
          <p className="text-sm text-red-800">
            Please return in 90 days to try again, or contact the vault administrator for assistance.
          </p>
        </div>
      </div>

      <button
        onClick={onClose}
        className="px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
      >
        Close
      </button>
    </div>
  );

  const renderUnlocked = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Vault Unlocked Successfully</h3>
        <p className="text-slate-600">
          Welcome, {vault.nextOfKin.name}. Here is your inheritance information.
        </p>
      </div>

      {/* Voice Message */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-900">Personal Message</h4>
            <p className="text-sm text-slate-600">AI Voice Message</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 mb-4">
          <p className="text-slate-800 italic">"{vault.voiceMessage}"</p>
        </div>
        
        <button
          onClick={playVoiceMessage}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-700 text-white rounded-lg hover:bg-purple-800 transition-colors"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          <span>{isPlaying ? 'Playing...' : 'Play Voice Message'}</span>
        </button>
      </div>

      {/* Asset Summary */}
      <div className="bg-slate-50 rounded-lg p-6">
        <h4 className="font-semibold text-slate-900 mb-4">Asset Summary</h4>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-slate-600">Vault Name:</span>
            <span className="font-medium text-slate-900">{vault.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Category:</span>
            <span className="font-medium text-slate-900">{vault.category}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Description:</span>
            <span className="font-medium text-slate-900">{vault.description}</span>
          </div>
        </div>
      </div>

      {/* Blockchain Proof */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-3">
          <Shield className="w-5 h-5 text-blue-600" />
          <h4 className="font-semibold text-blue-900">Blockchain Verification</h4>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-blue-700">Vault ID:</span>
            <span className="font-mono text-blue-900">{vault.blockchainProof.vaultId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-700">Transaction:</span>
            <span className="font-mono text-blue-900">{vault.blockchainProof.transactionId.substring(0, 16)}...</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-700">Secured:</span>
            <span className="text-blue-900">{new Date(vault.blockchainProof.timestamp).toLocaleDateString()}</span>
          </div>
        </div>
        <p className="text-xs text-blue-700 mt-3">
          ✅ This vault's authenticity is verified on the Algorand blockchain
        </p>
      </div>

      {/* Actions */}
      <div className="flex space-x-3">
        <button
          onClick={downloadVaultSummary}
          className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Download Summary</span>
        </button>
        <button
          onClick={onClose}
          className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-purple-50 to-blue-50 rounded-t-xl">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Vault Access</h2>
            <p className="text-slate-600 text-sm mt-1">
              {currentStep === 'questions' && 'Answer security questions to proceed'}
              {currentStep === 'denied' && 'Access has been denied'}
              {currentStep === 'unlocked' && 'Vault successfully unlocked'}
            </p>
          </div>
          {currentStep !== 'questions' && (
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
            >
              ×
            </button>
          )}
        </div>

        <div className="p-6">
          {currentStep === 'questions' && renderQuestions()}
          {currentStep === 'denied' && renderDenied()}
          {currentStep === 'unlocked' && renderUnlocked()}
        </div>
      </div>
    </div>
  );
};

export default VaultUnlockFlow;