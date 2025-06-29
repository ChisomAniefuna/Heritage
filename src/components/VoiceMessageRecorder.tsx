import React, { useState, useRef } from 'react';
import { Mic, MicOff, Play, Pause, Trash2, Save, Volume2, Languages } from 'lucide-react';
import { elevenLabsService, VOICE_OPTIONS, LANGUAGE_OPTIONS } from '../services/elevenlabs';

interface VoiceMessageRecorderProps {
  onSave: (voiceMessage: {
    text: string;
    audioUrl: string;
    voiceId: string;
    language: string;
  }) => void;
  onClose: () => void;
  initialText?: string;
  title?: string;
}

const VoiceMessageRecorder: React.FC<VoiceMessageRecorderProps> = ({
  onSave,
  onClose,
  initialText = '',
  title = 'Record Voice Message'
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [text, setText] = useState(initialText);
  const [selectedVoice, setSelectedVoice] = useState(VOICE_OPTIONS[0].voice_id);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [multilingualMode, setMultilingualMode] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['en']);

  const audioRef = useRef<HTMLAudioElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const startRecording = () => {
    const recognition = elevenLabsService.startVoiceRecognition(
      (transcript) => {
        setText(prev => prev + ' ' + transcript);
        setIsRecording(false);
      },
      (error) => {
        console.error('Voice recognition error:', error);
        setIsRecording(false);
      },
      selectedLanguage === 'en' ? 'en-US' : selectedLanguage
    );

    if (recognition) {
      recognitionRef.current = recognition;
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const generateAudio = async () => {
    if (!text.trim()) return;

    setIsGenerating(true);
    try {
      const audioBuffer = await elevenLabsService.generateSpeech(
        text,
        selectedVoice,
        {
          stability: 0.5,
          similarity_boost: 0.8,
          use_speaker_boost: true
        }
      );

      const url = elevenLabsService.createAudioUrl(audioBuffer);
      setAudioUrl(url);
    } catch (error) {
      console.error('Error generating audio:', error);
      alert('Failed to generate audio. Please check your ElevenLabs API key.');
    } finally {
      setIsGenerating(false);
    }
  };

  const playAudio = () => {
    if (audioRef.current && audioUrl) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const clearRecording = () => {
    setText('');
    setAudioUrl(null);
    setIsPlaying(false);
  };

  const handleSave = () => {
    if (text.trim() && audioUrl) {
      onSave({
        text,
        audioUrl,
        voiceId: selectedVoice,
        language: selectedLanguage
      });
    }
  };

  const handleLanguageToggle = (langCode: string) => {
    if (selectedLanguages.includes(langCode)) {
      setSelectedLanguages(prev => prev.filter(l => l !== langCode));
    } else {
      setSelectedLanguages(prev => [...prev, langCode]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-xl">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{title}</h2>
            <p className="text-slate-600 text-sm mt-1">Create a personal voice message for your beneficiaries</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Voice Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-3">
              Choose Voice
            </label>
            <div className="grid grid-cols-2 gap-3">
              {VOICE_OPTIONS.map(voice => (
                <button
                  key={voice.voice_id}
                  type="button"
                  onClick={() => setSelectedVoice(voice.voice_id)}
                  className={`p-3 text-left border-2 rounded-lg transition-all ${
                    selectedVoice === voice.voice_id
                      ? 'border-slate-900 bg-slate-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="font-medium text-slate-900">{voice.name}</div>
                  <div className="text-xs text-slate-600">{voice.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Language Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-semibold text-slate-900">
                Language Options
              </label>
              <button
                onClick={() => setMultilingualMode(!multilingualMode)}
                className={`flex items-center space-x-2 px-3 py-1 rounded-lg text-sm transition-colors ${
                  multilingualMode 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Languages className="w-4 h-4" />
                <span>Multilingual</span>
              </button>
            </div>

            {multilingualMode ? (
              <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                {LANGUAGE_OPTIONS.map(lang => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleLanguageToggle(lang.code)}
                    className={`flex items-center space-x-2 p-2 text-left border rounded-lg text-sm transition-all ${
                      selectedLanguages.includes(lang.code)
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.name}</span>
                  </button>
                ))}
              </div>
            ) : (
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              >
                {LANGUAGE_OPTIONS.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Text Input */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-semibold text-slate-900">
                Message Text
              </label>
              <div className="flex items-center space-x-2">
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`flex items-center space-x-2 px-3 py-1 rounded-lg text-sm transition-colors ${
                    isRecording 
                      ? 'bg-red-100 text-red-700' 
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  <span>{isRecording ? 'Stop' : 'Voice Input'}</span>
                </button>
                <button
                  onClick={clearRecording}
                  className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              placeholder="Type your message or use voice input..."
            />
          </div>

          {/* Audio Generation */}
          <div className="flex items-center space-x-3">
            <button
              onClick={generateAudio}
              disabled={!text.trim() || isGenerating}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:bg-slate-400 transition-colors"
            >
              <Volume2 className="w-4 h-4" />
              <span>{isGenerating ? 'Generating...' : 'Generate Audio'}</span>
            </button>

            {audioUrl && (
              <button
                onClick={playAudio}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>
            )}
          </div>

          {/* Audio Player */}
          {audioUrl && (
            <audio
              ref={audioRef}
              src={audioUrl}
              onEnded={handleAudioEnded}
              className="hidden"
            />
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4 border-t border-slate-200">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!text.trim() || !audioUrl}
              className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:bg-slate-400 transition-colors flex items-center justify-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Voice Message</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceMessageRecorder;