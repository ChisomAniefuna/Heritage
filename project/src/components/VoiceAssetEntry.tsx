import React, { useState, useRef } from 'react';
import { Mic, MicOff, Type, Volume2, RefreshCw } from 'lucide-react';
import { elevenLabsService, LANGUAGE_OPTIONS } from '../services/elevenlabs';

interface VoiceAssetEntryProps {
  onFieldUpdate: (field: string, value: string) => void;
  currentValues: {
    name: string;
    location: string;
    value: string;
    instructions: string;
    accountInfo: string;
    accessInstructions: string;
  };
}

const VoiceAssetEntry: React.FC<VoiceAssetEntryProps> = ({ onFieldUpdate, currentValues }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [activeField, setActiveField] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const [isProcessing, setIsProcessing] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const fieldLabels = {
    name: 'Asset Name',
    location: 'Platform/Institution',
    value: 'Estimated Value',
    instructions: 'Additional Notes',
    accountInfo: 'Account Information',
    accessInstructions: 'Access Instructions'
  };

  const startVoiceInput = (fieldName: string) => {
    setActiveField(fieldName);
    setIsProcessing(true);

    const recognition = elevenLabsService.startVoiceRecognition(
      (transcript) => {
        // Process the transcript to make it more suitable for the field
        const processedText = processTranscriptForField(transcript, fieldName);
        onFieldUpdate(fieldName, processedText);
        setIsRecording(false);
        setActiveField(null);
        setIsProcessing(false);
      },
      (error) => {
        console.error('Voice recognition error:', error);
        setIsRecording(false);
        setActiveField(null);
        setIsProcessing(false);
      },
      selectedLanguage
    );

    if (recognition) {
      recognitionRef.current = recognition;
      setIsRecording(true);
      setIsProcessing(false);
    } else {
      setIsProcessing(false);
    }
  };

  const stopVoiceInput = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
      setActiveField(null);
    }
  };

  const processTranscriptForField = (transcript: string, fieldName: string): string => {
    let processed = transcript.trim();

    switch (fieldName) {
      case 'name':
        // Capitalize first letter of each word for asset names
        processed = processed.replace(/\b\w/g, l => l.toUpperCase());
        break;
      
      case 'value':
        // Try to format monetary values
        processed = processed.replace(/\b(\d+)\s*(thousand|k)\b/gi, '$1,000');
        processed = processed.replace(/\b(\d+)\s*(million|m)\b/gi, '$1,000,000');
        processed = processed.replace(/\bdollar(s)?\b/gi, '$');
        break;
      
      case 'location':
        // Capitalize institution names
        processed = processed.replace(/\b(bank|credit union|investment|brokerage)\b/gi, match => 
          match.charAt(0).toUpperCase() + match.slice(1).toLowerCase()
        );
        break;
      
      default:
        // For instructions and notes, keep as is but ensure proper sentence structure
        processed = processed.charAt(0).toUpperCase() + processed.slice(1);
        if (!processed.endsWith('.') && !processed.endsWith('!') && !processed.endsWith('?')) {
          processed += '.';
        }
        break;
    }

    return processed;
  };

  const getVoicePrompt = (fieldName: string): string => {
    const prompts = {
      name: "What would you like to call this asset? For example, 'Primary Checking Account' or 'Family Home'",
      location: "Where is this asset located? For example, 'Chase Bank' or 'Safety Deposit Box 123'",
      value: "What's the estimated value? You can say 'fifty thousand dollars' or 'priceless'",
      instructions: "Any additional notes or instructions for your beneficiaries?",
      accountInfo: "Please provide account numbers, reference information, or identifying details",
      accessInstructions: "How should your beneficiaries access this asset? Include login steps or contact information"
    };
    return prompts[fieldName as keyof typeof prompts] || "Please speak your input";
  };

  const VoiceInputButton: React.FC<{ fieldName: string }> = ({ fieldName }) => (
    <div className="relative">
      <button
        onClick={() => isRecording && activeField === fieldName ? stopVoiceInput() : startVoiceInput(fieldName)}
        disabled={isRecording && activeField !== fieldName}
        className={`p-2 rounded-lg transition-all duration-200 ${
          isRecording && activeField === fieldName
            ? 'bg-red-100 text-red-600 animate-pulse'
            : isProcessing && activeField === fieldName
            ? 'bg-blue-100 text-blue-600'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
        } ${isRecording && activeField !== fieldName ? 'opacity-50 cursor-not-allowed' : ''}`}
        title={getVoicePrompt(fieldName)}
      >
        {isProcessing && activeField === fieldName ? (
          <RefreshCw className="w-4 h-4 animate-spin" />
        ) : isRecording && activeField === fieldName ? (
          <MicOff className="w-4 h-4" />
        ) : (
          <Mic className="w-4 h-4" />
        )}
      </button>
      
      {isRecording && activeField === fieldName && (
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-3 py-1 rounded-lg text-xs whitespace-nowrap">
          Listening...
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 flex items-center space-x-2">
            <Volume2 className="w-5 h-5 text-blue-600" />
            <span>Voice-Powered Asset Entry</span>
          </h3>
          <p className="text-sm text-slate-600 mt-1">
            Click the microphone next to any field to speak your input instead of typing
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="px-3 py-1 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isRecording}
          >
            <option value="en-US">🇺🇸 English (US)</option>
            <option value="en-GB">🇬🇧 English (UK)</option>
            <option value="es-ES">🇪🇸 Spanish</option>
            <option value="fr-FR">🇫🇷 French</option>
            <option value="de-DE">🇩🇪 German</option>
            <option value="it-IT">🇮🇹 Italian</option>
            <option value="pt-PT">🇵🇹 Portuguese</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(fieldLabels).map(([fieldName, label]) => (
          <div key={fieldName} className="flex items-center space-x-2">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {label}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={currentValues[fieldName as keyof typeof currentValues]}
                  onChange={(e) => onFieldUpdate(fieldName, e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder={`Enter ${label.toLowerCase()} or use voice input`}
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  <VoiceInputButton fieldName={fieldName} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isRecording && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-red-700 font-medium">
              Recording for "{fieldLabels[activeField as keyof typeof fieldLabels]}"
            </span>
          </div>
          <p className="text-xs text-red-600 mt-1">
            {getVoicePrompt(activeField!)}
          </p>
        </div>
      )}

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Voice Input Tips:</h4>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• Speak clearly and at a normal pace</li>
          <li>• For values, you can say "fifty thousand dollars" or "50K"</li>
          <li>• Institution names will be automatically capitalized</li>
          <li>• Click the microphone again to stop recording</li>
        </ul>
      </div>
    </div>
  );
};

export default VoiceAssetEntry;