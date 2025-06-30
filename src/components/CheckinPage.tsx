import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, Shield, Heart, ArrowLeft } from 'lucide-react';
import { checkinService } from '../services/checkinService';

interface CheckinPageProps {
  onBack: () => void;
}

const CheckinPage: React.FC<CheckinPageProps> = ({ onBack }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [userConfirmation, setUserConfirmation] = useState({
    isAlive: false,
    hasAccess: false,
    contactsUpdated: false,
    understandsImportance: false
  });

  const handleStepComplete = (step: number) => {
    if (step < 4) {
      setCurrentStep(step + 1);
    } else {
      processCheckin();
    }
  };

  const processCheckin = async () => {
    setIsProcessing(true);
    
    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Process the check-in
      await checkinService.processUserCheckin('current_user_id', 'aniefuna.chisom@gmail.com');
      
      setIsCompleted(true);
    } catch (error) {
      console.error('Check-in failed:', error);
      alert('Check-in failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const steps = [
    {
      id: 1,
      title: 'Confirm Your Status',
      description: 'Let us know you\'re doing well',
      icon: Heart,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <Heart className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">How are you doing?</h3>
            <p className="text-slate-600">
              This check-in helps ensure your Heritage Vault remains active and your loved ones 
              know you're well.
            </p>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={userConfirmation.isAlive}
                onChange={(e) => setUserConfirmation(prev => ({ ...prev, isAlive: e.target.checked }))}
                className="mt-1 rounded border-green-300 text-green-600 focus:ring-green-500"
              />
              <div>
                <span className="font-medium text-green-900">I am alive and well</span>
                <p className="text-sm text-green-700 mt-1">
                  I confirm that I am in good health and able to manage my Heritage Vault account.
                </p>
              </div>
            </label>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: 'Account Access',
      description: 'Verify you can access your account',
      icon: Shield,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <Shield className="w-16 h-16 text-blue-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Account Security</h3>
            <p className="text-slate-600">
              Confirm that you have full access to your Heritage Vault account and all its features.
            </p>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={userConfirmation.hasAccess}
                onChange={(e) => setUserConfirmation(prev => ({ ...prev, hasAccess: e.target.checked }))}
                className="mt-1 rounded border-blue-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="font-medium text-blue-900">I have full access to my account</span>
                <p className="text-sm text-blue-700 mt-1">
                  I can log in, view my assets, and make changes to my Heritage Vault as needed.
                </p>
              </div>
            </label>
          </div>
        </div>
      )
    },
    {
      id: 3,
      title: 'Update Contacts',
      description: 'Review your beneficiary information',
      icon: Clock,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <Clock className="w-16 h-16 text-purple-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Contact Information</h3>
            <p className="text-slate-600">
              Ensure your beneficiaries' contact information is current and accurate.
            </p>
          </div>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={userConfirmation.contactsUpdated}
                onChange={(e) => setUserConfirmation(prev => ({ ...prev, contactsUpdated: e.target.checked }))}
                className="mt-1 rounded border-purple-300 text-purple-600 focus:ring-purple-500"
              />
              <div>
                <span className="font-medium text-purple-900">My contact information is up to date</span>
                <p className="text-sm text-purple-700 mt-1">
                  I have reviewed and confirmed that all beneficiary contact details are current.
                </p>
              </div>
            </label>
          </div>
        </div>
      )
    },
    {
      id: 4,
      title: 'Final Confirmation',
      description: 'Complete your check-in',
      icon: CheckCircle,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Almost Done!</h3>
            <p className="text-slate-600">
              Please confirm that you understand the importance of regular check-ins.
            </p>
          </div>
          
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={userConfirmation.understandsImportance}
                onChange={(e) => setUserConfirmation(prev => ({ ...prev, understandsImportance: e.target.checked }))}
                className="mt-1 rounded border-slate-300 text-slate-600 focus:ring-slate-500"
              />
              <div>
                <span className="font-medium text-slate-900">I understand the importance of regular check-ins</span>
                <p className="text-sm text-slate-700 mt-1">
                  I understand that failing to complete check-ins may trigger inheritance processes 
                  to ensure my wishes are carried out.
                </p>
              </div>
            </label>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-900 mb-2">📅 Next Check-in</h4>
            <p className="text-sm text-yellow-800">
              Your next check-in will be due in 6 months. We'll send you reminders 30, 14, 7, and 1 days 
              before the due date.
            </p>
          </div>
        </div>
      )
    }
  ];

  const currentStepData = steps[currentStep - 1];
  const StepIcon = currentStepData.icon;
  const canProceed = () => {
    switch (currentStep) {
      case 1: return userConfirmation.isAlive;
      case 2: return userConfirmation.hasAccess;
      case 3: return userConfirmation.contactsUpdated;
      case 4: return userConfirmation.understandsImportance;
      default: return false;
    }
  };

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl max-w-2xl w-full p-8 shadow-2xl text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Check-in Completed!</h1>
          <p className="text-lg text-slate-700 mb-6">
            Thank you for completing your 6-month check-in. Your Heritage Vault account remains active 
            and your inheritance plan is secure.
          </p>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-green-900 mb-2">✅ What happens next:</h3>
            <ul className="text-sm text-green-800 space-y-1 text-left">
              <li>• Your account status has been updated to "Active"</li>
              <li>• Your next check-in is scheduled for 6 months from today</li>
              <li>• You'll receive reminder notifications before it's due</li>
              <li>• Your beneficiaries will not be contacted</li>
            </ul>
          </div>
          
          <div className="flex space-x-4 justify-center">
            <button
              onClick={onBack}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={onBack}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold">6-Month Check-in</h1>
                <p className="text-blue-100">Step {currentStep} of {steps.length}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-100">Heritage Vault</div>
              <div className="text-xs text-blue-200">Digital Inheritance Management</div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-slate-50 px-6 py-4">
          <div className="flex items-center space-x-2">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step.id 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-200 text-slate-600'
                }`}>
                  {currentStep > step.id ? <CheckCircle className="w-4 h-4" /> : step.id}
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 rounded ${
                    currentStep > step.id ? 'bg-blue-600' : 'bg-slate-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="mt-2 text-sm text-slate-600">
            {currentStepData.title}: {currentStepData.description}
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {currentStepData.content}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-8 py-6 border-t border-slate-200">
          <div className="flex justify-between items-center">
            <button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            
            <div className="flex space-x-3">
              <button
                onClick={onBack}
                className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              
              {currentStep < steps.length ? (
                <button
                  onClick={() => handleStepComplete(currentStep)}
                  disabled={!canProceed()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
                >
                  Next Step
                </button>
              ) : (
                <button
                  onClick={() => handleStepComplete(currentStep)}
                  disabled={!canProceed() || isProcessing}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  {isProcessing ? (
                    <>
                      <Clock className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Complete Check-in</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckinPage;