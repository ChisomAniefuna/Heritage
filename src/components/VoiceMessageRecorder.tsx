import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Play, Pause, Trash2, Save, Volume2, Languages, Globe, Check, RefreshCw } from 'lucide-react';
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
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [multilingualMode, setMultilingualMode] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['en-US']);
  const [multilingualAudio, setMultilingualAudio] = useState<Array<{
    language: string;
    audioUrl: string;
    voiceUsed: string;
  }>>([]);
  const [currentPlayingLanguage, setCurrentPlayingLanguage] = useState<string | null>(null);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [filteredLanguages, setFilteredLanguages] = useState(LANGUAGE_OPTIONS);
  const [languageSearch, setLanguageSearch] = useState('');
  const [voiceOptions, setVoiceOptions] = useState<typeof VOICE_OPTIONS>([]);
  const [showVoiceSelector, setShowVoiceSelector] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const languageSelectorRef = useRef<HTMLDivElement>(null);
  const voiceSelectorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Update available voices when language changes
    const voices = elevenLabsService.getVoicesByLanguage(selectedLanguage);
    setVoiceOptions(voices);
    
    if (voices.length > 0) {
      setSelectedVoice(voices[0].voice_id);
    }
  }, [selectedLanguage]);

  useEffect(() => {
    // Filter languages based on search
    if (languageSearch) {
      const filtered = LANGUAGE_OPTIONS.filter(lang => 
        lang.name.toLowerCase().includes(languageSearch.toLowerCase()) ||
        lang.code.toLowerCase().includes(languageSearch.toLowerCase()) ||
        lang.family.toLowerCase().includes(languageSearch.toLowerCase())
      );
      setFilteredLanguages(filtered);
    } else {
      setFilteredLanguages(LANGUAGE_OPTIONS);
    }
  }, [languageSearch]);

  useEffect(() => {
    // Close selectors when clicking outside
    function handleClickOutside(event: MouseEvent) {
      if (languageSelectorRef.current && !languageSelectorRef.current.contains(event.target as Node)) {
        setShowLanguageSelector(false);
      }
      if (voiceSelectorRef.current && !voiceSelectorRef.current.contains(event.target as Node)) {
        setShowVoiceSelector(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const startRecording = () => {
    setIsProcessing(true);
    const recognition = elevenLabsService.startVoiceRecognition(
      (transcript) => {
        setText(prev => prev + ' ' + transcript);
        setIsRecording(false);
        setIsProcessing(false);
      },
      (error) => {
        console.error('Voice recognition error:', error);
        setIsRecording(false);
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
      if (multilingualMode && selectedLanguages.length > 0) {
        // Generate audio for multiple languages
        const voicePreferences: { [key: string]: string } = {};
        
        // Set voice preferences for each language
        selectedLanguages.forEach(lang => {
          const recommendedVoice = elevenLabsService.getRecommendedVoice(lang);
          if (recommendedVoice) {
            voicePreferences[lang] = recommendedVoice.voice_id;
          }
        });
        
        const results = await elevenLabsService.generateMultilingualMessage(
          text,
          selectedLanguages,
          voicePreferences
        );
        
        setMultilingualAudio(results);
        
        // Set the primary audio URL to the first language
        if (results.length > 0) {
          setAudioUrl(results[0].audioUrl);
          setSelectedLanguage(selectedLanguages[0]);
        }
      } else {
        // Generate audio for a single language
        const audioBuffer = await elevenLabsService.generateSpeech(
          text,
          selectedVoice,
          {
            stability: 0.5,
            similarity_boost: 0.8,
            use_speaker_boost: true,
            language: selectedLanguage
          }
        );

        const url = elevenLabsService.createAudioUrl(audioBuffer);
        setAudioUrl(url);
        setMultilingualAudio([]);
      }
    } catch (error) {
      console.error('Error generating audio:', error);
      alert('Failed to generate audio. Please check your ElevenLabs API key.');
    } finally {
      setIsGenerating(false);
    }
  };

  const playAudio = (language?: string) => {
    if (!audioRef.current) return;
    
    if (language && multilingualMode) {
      // Play specific language in multilingual mode
      const audioForLanguage = multilingualAudio.find(a => a.language === language);
      if (audioForLanguage) {
        audioRef.current.src = audioForLanguage.audioUrl;
        audioRef.current.play();
        setIsPlaying(true);
        setCurrentPlayingLanguage(language);
      }
    } else if (audioUrl) {
      // Play default audio
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        setCurrentPlayingLanguage(null);
      } else {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
        setIsPlaying(true);
        setCurrentPlayingLanguage(selectedLanguage);
      }
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentPlayingLanguage(null);
  };

  const clearRecording = () => {
    setText('');
    setAudioUrl(null);
    setIsPlaying(false);
    setMultilingualAudio([]);
    setCurrentPlayingLanguage(null);
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
      if (selectedLanguages.length > 1) {
        setSelectedLanguages(prev => prev.filter(l => l !== langCode));
      }
    } else {
      setSelectedLanguages(prev => [...prev, langCode]);
    }
  };

  const getLanguageDisplayName = (code: string) => {
    const language = LANGUAGE_OPTIONS.find(lang => lang.code === code);
    return language ? `${language.flag} ${language.name}` : code;
  };

  const getVoiceDisplayName = (voiceId: string) => {
    const voice = VOICE_OPTIONS.find(v => v.voice_id === voiceId);
    return voice ? `${voice.name} (${voice.gender})` : voiceId;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-xl">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{title}</h2>
            <p className="text-slate-600 text-sm mt-1">Create a multilingual voice message for your beneficiaries</p>
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
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-semibold text-slate-900">
                Choose Voice
              </label>
              <div className="relative" ref={voiceSelectorRef}>
                <button
                  onClick={() => {
                    setShowVoiceSelector(!showVoiceSelector);
                    setShowLanguageSelector(false);
                  }}
                  className="flex items-center space-x-2 px-3 py-1 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm"
                  disabled={isRecording}
                >
                  <Volume2 className="w-4 h-4" />
                  <span>{getVoiceDisplayName(selectedVoice)}</span>
                </button>
                
                {showVoiceSelector && (
                  <div className="absolute right-0 mt-1 w-64 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
                    <div className="max-h-64 overflow-y-auto p-1">
                      {voiceOptions.length > 0 ? (
                        voiceOptions.map(voice => (
                          <button
                            key={voice.voice_id}
                            onClick={() => {
                              setSelectedVoice(voice.voice_id);
                              setShowVoiceSelector(false);
                            }}
                            className={`w-full text-left px-3 py-2 text-sm rounded-lg flex items-center space-x-2 hover:bg-slate-100 ${
                              selectedVoice === voice.voice_id ? 'bg-slate-100 text-slate-900' : ''
                            }`}
                          >
                            <div className="flex-1">
                              <div>{voice.name}</div>
                              <div className="text-xs text-slate-500">
                                {voice.gender} • {voice.accent || voice.category}
                              </div>
                            </div>
                            {selectedVoice === voice.voice_id && (
                              <Check className="w-4 h-4 text-blue-600" />
                            )}
                          </button>
                        ))
                      ) : (
                        <div className="p-3 text-sm text-slate-500 text-center">
                          No voices available for this language
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Language Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-semibold text-slate-900">
                Language Options
              </label>
              <div className="flex items-center space-x-2">
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
                
                <div className="relative" ref={languageSelectorRef}>
                  <button
                    onClick={() => {
                      setShowLanguageSelector(!showLanguageSelector);
                      setShowVoiceSelector(false);
                    }}
                    className="flex items-center space-x-2 px-3 py-1 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm"
                    disabled={isRecording}
                  >
                    <Globe className="w-4 h-4" />
                    <span>{getLanguageDisplayName(selectedLanguage)}</span>
                  </button>
                  
                  {showLanguageSelector && (
                    <div className="absolute right-0 mt-1 w-72 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
                      <div className="p-2">
                        <input
                          type="text"
                          placeholder="Search languages..."
                          value={languageSearch}
                          onChange={(e) => setLanguageSearch(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div className="max-h-64 overflow-y-auto p-1">
                        {filteredLanguages.map(language => (
                          <button
                            key={language.code}
                            onClick={() => {
                              if (multilingualMode) {
                                handleLanguageToggle(language.code);
                              } else {
                                setSelectedLanguage(language.code);
                                setShowLanguageSelector(false);
                              }
                            }}
                            className={`w-full text-left px-3 py-2 text-sm rounded-lg flex items-center space-x-2 hover:bg-slate-100 ${
                              multilingualMode 
                                ? selectedLanguages.includes(language.code) ? 'bg-blue-50 text-blue-700' : ''
                                : selectedLanguage === language.code ? 'bg-blue-50 text-blue-700' : ''
                            }`}
                          >
                            <span className="text-lg">{language.flag}</span>
                            <div className="flex-1">
                              <div>{language.name}</div>
                              <div className="text-xs text-slate-500">{language.family} • {language.speakers} speakers</div>
                            </div>
                            {(multilingualMode 
                              ? selectedLanguages.includes(language.code) 
                              : selectedLanguage === language.code) && (
                              <Check className="w-4 h-4 text-blue-600" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {multilingualMode && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Languages className="w-4 h-4 text-blue-600" />
                  <h4 className="font-medium text-blue-900">Multilingual Mode</h4>
                </div>
                <p className="text-sm text-blue-800 mb-2">
                  Your message will be translated and generated in these languages:
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedLanguages.map(lang => (
                    <div key={lang} className="flex items-center space-x-1 bg-white px-2 py-1 rounded-lg border border-blue-200 text-sm">
                      <span>{getLanguageDisplayName(lang)}</span>
                      <button 
                        onClick={() => handleLanguageToggle(lang)}
                        className="text-red-500 hover:text-red-700"
                        disabled={selectedLanguages.length <= 1}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
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
                      : isProcessing
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  {isProcessing ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : isRecording ? (
                    <MicOff className="w-4 h-4" />
                  ) : (
                    <Mic className="w-4 h-4" />
                  )}
                  <span>{isProcessing ? 'Processing...' : isRecording ? 'Stop' : 'Voice Input'}</span>
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
              placeholder={`Type your message in ${getLanguageDisplayName(selectedLanguage).split(' ')[1]} or use voice input...`}
            />
          </div>

          {/* Audio Generation */}
          <div className="flex items-center space-x-3">
            <button
              onClick={generateAudio}
              disabled={!text.trim() || isGenerating}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:bg-slate-400 transition-colors"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Generating{multilingualMode ? ' Multilingual' : ''} Audio...</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-5 h-5" />
                  <span>Generate {multilingualMode ? 'Multilingual ' : ''}Audio</span>
                </>
              )}
            </button>

            {audioUrl && !multilingualMode && (
              <button
                onClick={() => playAudio()}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>
            )}
          </div>

          {/* Multilingual Audio Player */}
          {multilingualAudio.length > 0 && (
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Multilingual Audio</h3>
              <div className="space-y-2">
                {multilingualAudio.map((audio, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => playAudio(audio.language)}
                        className={`p-2 rounded-full ${
                          currentPlayingLanguage === audio.language && isPlaying
                            ? 'bg-green-100 text-green-700'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {currentPlayingLanguage === audio.language && isPlaying ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </button>
                      <div>
                        <div className="font-medium text-slate-900">{getLanguageDisplayName(audio.language)}</div>
                        <div className="text-xs text-slate-500">Voice: {audio.voiceUsed}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Audio Player */}
          <audio
            ref={audioRef}
            onEnded={handleAudioEnded}
            className="hidden"
          />

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
              <span>Save {multilingualMode ? 'Multilingual ' : ''}Voice Message</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceMessageRecorder;