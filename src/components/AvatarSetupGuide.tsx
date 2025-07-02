import React, { useState, useEffect } from 'react';
import { Video, Upload, CheckCircle, AlertCircle, Loader, Camera, Play, User } from 'lucide-react';
import { tavusService, TavusReplica } from '../services/tavus';

interface AvatarSetupGuideProps {
  onComplete: () => void;
  onClose: () => void;
}

const AvatarSetupGuide: React.FC<AvatarSetupGuideProps> = ({ onComplete, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [replicas, setReplicas] = useState<TavusReplica[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    loadReplicas();
  }, []);

  const loadReplicas = async () => {
    try {
      const replicaList = await tavusService.getReplicas();
      setReplicas(replicaList);
      
      if (replicaList.some(r => r.status === 'ready')) {
        setCurrentStep(4); // Skip to completion if replica exists
      }
    } catch (error) {
      console.error('Error loading replicas:', error);
    }
  };

  const steps = [
    {
      id: 1,
      title: 'Welcome to Avatar Messages',
      description: 'Create personalized video messages that will be delivered to your beneficiaries',
      content: (
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
            <Video className="w-10 h-10 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">
              Your Digital Legacy, In Your Own Voice
            </h3>
            <p className="text-slate-600 leading-relaxed">
              With Tavus AI avatars, you can create heartfelt video messages that will be delivered 
              to your loved ones when they need them most. Your avatar will look and sound just like you, 
              ensuring your personal touch lives on.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-slate-50 p-4 rounded-lg">
              <Camera className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="font-medium">Realistic Avatar</p>
              <p className="text-slate-600">Looks and sounds like you</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg">
              <User className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="font-medium">Personal Touch</p>
              <p className="text-slate-600">Heartfelt, customized messages</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg">
              <CheckCircle className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <p className="font-medium">Easy Setup</p>
              <p className="text-slate-600">Just one training video needed</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: 'Recording Guidelines',
      description: 'Follow these tips to create the best possible avatar',
      content: (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h4 className="font-semibold text-blue-900 mb-4 flex items-center space-x-2">
              <Camera className="w-5 h-5" />
              <span>Video Recording Tips</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Record in good lighting (natural light preferred)</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Speak clearly and at normal pace</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Look directly at the camera</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Keep your head and shoulders in frame</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Record for 2-5 minutes</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Use a quiet environment</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Wear solid colors (avoid patterns)</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Show various facial expressions</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h5 className="font-medium text-amber-900 mb-2">Sample Script</h5>
            <p className="text-sm text-amber-800 italic">
              "Hello, I'm creating this video to train my AI avatar for Heritage Vault. 
              I want to make sure my loved ones receive personal messages from me. 
              This technology will help me share important information and express my feelings 
              even when I'm not here. I'm excited about the peace of mind this will bring to my family."
            </p>
          </div>
        </div>
      )
    },
    {
      id: 3,
      title: 'Upload Training Video',
      description: 'Upload your training video to create your avatar',
      content: (
        <div className="space-y-6">
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-slate-900 mb-2">Upload Your Training Video</h4>
            <p className="text-slate-600 mb-4">
              Select a video file (MP4, MOV, or AVI) that's 2-5 minutes long
            </p>
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Choose Video File
            </button>
          </div>

          {isLoading && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <Loader className="w-5 h-5 text-blue-600 animate-spin" />
                <div className="flex-1">
                  <p className="font-medium text-blue-900">Processing your avatar...</p>
                  <p className="text-sm text-blue-700">This may take 10-15 minutes</p>
                </div>
              </div>
              <div className="mt-3 bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )
    },
    {
      id: 4,
      title: 'Avatar Ready!',
      description: 'Your avatar has been created and is ready to use',
      content: (
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">
              Your Avatar is Ready!
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Congratulations! Your AI avatar has been successfully created. You can now use it to 
              create personalized video messages for your assets and beneficiaries.
            </p>
          </div>

          {replicas.length > 0 && (
            <div className="bg-slate-50 rounded-lg p-4">
              <h4 className="font-medium text-slate-900 mb-3">Your Avatars</h4>
              <div className="space-y-2">
                {replicas.map(replica => (
                  <div key={replica.replica_id} className="flex items-center justify-between p-3 bg-white rounded border">
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-slate-600" />
                      <div>
                        <p className="font-medium text-slate-900">{replica.name}</p>
                        <p className="text-xs text-slate-500 capitalize">{replica.status}</p>
                      </div>
                    </div>
                    {replica.status === 'ready' && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        Ready
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h5 className="font-medium text-blue-900 mb-2">What's Next?</h5>
            <ul className="text-sm text-blue-800 space-y-1 text-left">
              <li>• Add assets to your Heritage Vault</li>
              <li>• Create personalized avatar messages for each asset</li>
              <li>• Set up conditional release rules</li>
              <li>• Your beneficiaries will receive your video messages when appropriate</li>
            </ul>
          </div>
        </div>
      )
    }
  ];

  const currentStepData = steps.find(step => step.id === currentStep);

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-xl">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Avatar Setup Guide</h2>
            <p className="text-slate-600 mt-1">Step {currentStep} of {steps.length}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            ×
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 bg-slate-50">
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
        </div>

        <div className="p-6">
          {currentStepData && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  {currentStepData.title}
                </h3>
                <p className="text-slate-600">{currentStepData.description}</p>
              </div>

              <div className="min-h-[400px]">
                {currentStepData.content}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-6 border-t border-slate-200">
            <button
              onClick={prevStep}
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
                Skip for Now
              </button>
              <button
                onClick={nextStep}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {currentStep === steps.length ? 'Get Started' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvatarSetupGuide;