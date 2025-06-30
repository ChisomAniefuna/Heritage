import React, { useState } from 'react';
import { User, Camera, Palette, Globe, Heart, Crown, Upload } from 'lucide-react';
import { 
  CULTURAL_IDENTITIES, 
  ROLE_REPRESENTATIONS, 
  VISUAL_STYLES, 
  HAIRSTYLE_OPTIONS,
  IdentityProfile,
  RepresentationPreferences 
} from '../services/tavus';

interface AvatarIdentitySelectorProps {
  onSelectionComplete: (profile: IdentityProfile, preferences: RepresentationPreferences, photoFile?: File) => void;
  onClose: () => void;
}

const AvatarIdentitySelector: React.FC<AvatarIdentitySelectorProps> = ({ 
  onSelectionComplete, 
  onClose 
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [creationMethod, setCreationMethod] = useState<'video_training' | 'photo_generation' | 'preset_selection'>('preset_selection');
  const [selectedCulture, setSelectedCulture] = useState(CULTURAL_IDENTITIES[0]?.id || '');
  const [selectedRole, setSelectedRole] = useState(ROLE_REPRESENTATIONS[0]?.id || '');
  const [selectedStyle, setSelectedStyle] = useState(VISUAL_STYLES[0]?.id || '');
  const [selectedHairstyle, setSelectedHairstyle] = useState(HAIRSTYLE_OPTIONS[0]?.id || '');
  const [customDescription, setCustomDescription] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getFilteredHairstyles = () => {
    if (!selectedCulture) return HAIRSTYLE_OPTIONS;
    return HAIRSTYLE_OPTIONS.filter(h => 
      h.cultural.includes(selectedCulture) || h.cultural.includes('universal')
    );
  };

  const handleComplete = () => {
    const culture = CULTURAL_IDENTITIES.find(c => c.id === selectedCulture);
    const role = ROLE_REPRESENTATIONS.find(r => r.id === selectedRole);
    const style = VISUAL_STYLES.find(s => s.id === selectedStyle);
    const hairstyle = HAIRSTYLE_OPTIONS.find(h => h.id === selectedHairstyle);

    const identityProfile: IdentityProfile = {
      cultural_identity: culture?.label || CULTURAL_IDENTITIES[0]?.label,
      representation_style: role?.label || ROLE_REPRESENTATIONS[0]?.label,
      clothing_style: style?.label || VISUAL_STYLES[0]?.label,
      hairstyle: hairstyle?.label || HAIRSTYLE_OPTIONS[0]?.label,
      custom_description: customDescription
    };

    const preferences: RepresentationPreferences = {
      creation_method: creationMethod,
      cultural_identity: selectedCulture || CULTURAL_IDENTITIES[0]?.id,
      role_representation: selectedRole || ROLE_REPRESENTATIONS[0]?.id,
      visual_style: selectedStyle || VISUAL_STYLES[0]?.id
    };

    onSelectionComplete(identityProfile, preferences, photoFile || undefined);
  };

  const steps = [
    {
      id: 1,
      title: 'Choose Creation Method',
      description: 'How would you like to create your avatar?'
    },
    {
      id: 2,
      title: 'Cultural Identity',
      description: 'Select your cultural background and heritage'
    },
    {
      id: 3,
      title: 'Role Representation',
      description: 'How would you like to be represented?'
    },
    {
      id: 4,
      title: 'Visual Style',
      description: 'Choose your appearance and style preferences'
    },
    {
      id: 5,
      title: 'Final Touches',
      description: 'Add any additional customizations'
    }
  ];

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <button
                onClick={() => setCreationMethod('video_training')}
                className={`p-6 border-2 rounded-xl text-left transition-all ${
                  creationMethod === 'video_training'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <Camera className="w-8 h-8 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-slate-900">Video Training (Recommended)</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      Upload a 2-5 minute video of yourself speaking. Most accurate representation.
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setCreationMethod('photo_generation')}
                className={`p-6 border-2 rounded-xl text-left transition-all ${
                  creationMethod === 'photo_generation'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <Upload className="w-8 h-8 text-purple-600" />
                  <div>
                    <h3 className="font-semibold text-slate-900">Photo Generation</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      Upload your photo and we'll create an avatar that looks like you.
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setCreationMethod('preset_selection')}
                className={`p-6 border-2 rounded-xl text-left transition-all ${
                  creationMethod === 'preset_selection'
                    ? 'border-green-500 bg-green-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <Palette className="w-8 h-8 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-slate-900">Preset Selection</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      Choose from culturally representative preset avatars.
                    </p>
                  </div>
                </div>
              </button>
            </div>

            {creationMethod === 'photo_generation' && (
              <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h4 className="font-medium text-purple-900 mb-3">Upload Your Photo</h4>
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label
                    htmlFor="photo-upload"
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 cursor-pointer transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Choose Photo</span>
                  </label>
                  {photoPreview && (
                    <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-purple-300">
                      <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-purple-700 mt-2">
                  Best results with clear, front-facing photos with good lighting
                </p>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {CULTURAL_IDENTITIES.map(culture => (
                <button
                  key={culture.id}
                  onClick={() => setSelectedCulture(culture.id)}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    selectedCulture === culture.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Globe className="w-5 h-5 text-blue-600" />
                    <div>
                      <h3 className="font-medium text-slate-900">{culture.label}</h3>
                      <p className="text-xs text-slate-600">{culture.region}</p>
                      {culture.subgroups.length > 0 && (
                        <p className="text-xs text-slate-500 mt-1">
                          {culture.subgroups.slice(0, 3).join(', ')}
                          {culture.subgroups.length > 3 && '...'}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
            
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Why this matters:</strong> Selecting your cultural identity helps us create 
                an avatar that authentically represents your heritage, including appropriate 
                facial features, skin tone, and cultural elements.
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {ROLE_REPRESENTATIONS.map(role => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    selectedRole === role.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <Heart className="w-5 h-5 text-purple-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-slate-900">{role.label}</h3>
                      <p className="text-xs text-slate-600 mt-1">{role.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-sm text-purple-800">
                <strong>Express yourself:</strong> Choose how you want to be remembered and 
                represented to your beneficiaries. This affects your avatar's demeanor, 
                posture, and overall presence.
              </p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-slate-900 mb-3">Clothing & Style</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {VISUAL_STYLES.map(style => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`p-3 border-2 rounded-lg text-left transition-all ${
                      selectedStyle === style.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <h3 className="font-medium text-slate-900 text-sm">{style.label}</h3>
                    <p className="text-xs text-slate-600 mt-1">{style.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-slate-900 mb-3">Hairstyle</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                {getFilteredHairstyles().map(hairstyle => (
                  <button
                    key={hairstyle.id}
                    onClick={() => setSelectedHairstyle(hairstyle.id)}
                    className={`p-3 border-2 rounded-lg text-left transition-all ${
                      selectedHairstyle === hairstyle.id
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <h3 className="font-medium text-slate-900 text-sm">{hairstyle.label}</h3>
                    <p className="text-xs text-slate-600 mt-1">
                      Cultural: {hairstyle.cultural.join(', ')}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Additional Description (Optional)
              </label>
              <textarea
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe any specific features, expressions, or characteristics you'd like your avatar to have..."
              />
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <h4 className="font-medium text-slate-900 mb-3">Your Avatar Profile</h4>
              <div className="space-y-2 text-sm">
                <div><strong>Creation Method:</strong> {creationMethod.replace('_', ' ')}</div>
                <div><strong>Cultural Identity:</strong> {CULTURAL_IDENTITIES.find(c => c.id === selectedCulture)?.label || 'Not selected'}</div>
                <div><strong>Role:</strong> {ROLE_REPRESENTATIONS.find(r => r.id === selectedRole)?.label || 'Not selected'}</div>
                <div><strong>Style:</strong> {VISUAL_STYLES.find(s => s.id === selectedStyle)?.label || 'Not selected'}</div>
                <div><strong>Hairstyle:</strong> {HAIRSTYLE_OPTIONS.find(h => h.id === selectedHairstyle)?.label || 'Not selected'}</div>
                {photoFile && <div><strong>Photo:</strong> {photoFile.name}</div>}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-xl">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Create Your Avatar Identity</h2>
            <p className="text-slate-600 mt-1">Step {currentStep} of {steps.length}: {steps[currentStep - 1]?.title}</p>
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
                  {step.id}
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
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {steps[currentStep - 1]?.title}
            </h3>
            <p className="text-slate-600">{steps[currentStep - 1]?.description}</p>
          </div>

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
              {currentStep < steps.length ? (
                <button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleComplete}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Create Avatar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvatarIdentitySelector;