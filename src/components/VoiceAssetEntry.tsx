import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Type, Volume2, RefreshCw, Globe, Check } from 'lucide-react';
import { elevenLabsService, LANGUAGE_OPTIONS, VOICE_OPTIONS, CULTURAL_VOICE_PATTERNS } from '../services/elevenlabs';

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
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [filteredLanguages, setFilteredLanguages] = useState(LANGUAGE_OPTIONS);
  const [languageSearch, setLanguageSearch] = useState('');
  const [voiceOptions, setVoiceOptions] = useState<typeof VOICE_OPTIONS>([]);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [showVoiceSelector, setShowVoiceSelector] = useState(false);
  const [culturalContext, setCulturalContext] = useState<any>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const languageSelectorRef = useRef<HTMLDivElement>(null);
  const voiceSelectorRef = useRef<HTMLDivElement>(null);

  const fieldLabels = {
    name: 'Asset Name',
    location: 'Platform/Institution',
    value: 'Estimated Value',
    instructions: 'Additional Notes',
    accountInfo: 'Account Information',
    accessInstructions: 'Access Instructions'
  };

  useEffect(() => {
    // Update available voices when language changes
    const voices = elevenLabsService.getVoicesByLanguage(selectedLanguage);
    setVoiceOptions(voices);
    
    if (voices.length > 0) {
      setSelectedVoice(voices[0].voice_id);
    }
    
    // Get cultural context for the selected language
    const context = elevenLabsService.getCulturalContext(selectedLanguage);
    setCulturalContext(context);
    
  }, [selectedLanguage]);

  useEffect(() => {
    // Close language selector when clicking outside
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
      document.addEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
      selectedLanguage,
      fieldName // Pass field name as context
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
        // Use cultural context for asset names if available
        if (culturalContext) {
          processed = elevenLabsService.processAssetName(processed, selectedLanguage);
        } else {
          // Capitalize first letter of each word for asset names
          processed = processed.replace(/\b\w/g, l => l.toUpperCase());
        }
        break;
      
      case 'value':
        // Apply cultural number formats if available
        if (culturalContext) {
          processed = elevenLabsService.processFinancialValue(processed, selectedLanguage);
        } else {
          // Try to format monetary values
          processed = processed.replace(/\b(\d+)\s*(thousand|k)\b/gi, '$1,000');
          processed = processed.replace(/\b(\d+)\s*(million|m)\b/gi, '$1,000,000');
          processed = processed.replace(/\bdollar(s)?\b/gi, '$');
        }
        break;
      
      case 'location':
        // Apply cultural location processing if available
        if (culturalContext) {
          processed = elevenLabsService.processLocation(processed, selectedLanguage);
        } else {
          // Capitalize institution names
          processed = processed.replace(/\b(bank|credit union|investment|brokerage)\b/gi, match => 
            match.charAt(0).toUpperCase() + match.slice(1).toLowerCase()
          );
        }
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
    // Get language-specific prompts if available
    if (culturalContext && culturalContext.commonPhrases) {
      const langCode = selectedLanguage.split('-')[0];
      
      const prompts: { [key: string]: { [key: string]: string } } = {
        'en': {
          name: "What would you like to call this asset? For example, 'Primary Checking Account' or 'Family Home'",
          location: "Where is this asset located? For example, 'Chase Bank' or 'Safety Deposit Box 123'",
          value: "What's the estimated value? You can say 'fifty thousand dollars' or 'priceless'",
          instructions: "Any additional notes or instructions for your beneficiaries?",
          accountInfo: "Please provide account numbers, reference information, or identifying details",
          accessInstructions: "How should your beneficiaries access this asset? Include login steps or contact information"
        },
        'es': {
          name: "¿Cómo quieres llamar a este activo? Por ejemplo, 'Cuenta Corriente Principal' o 'Casa Familiar'",
          location: "¿Dónde está ubicado este activo? Por ejemplo, 'Banco Santander' o 'Caja de Seguridad 123'",
          value: "¿Cuál es el valor estimado? Puedes decir 'cincuenta mil pesos' o 'invaluable'",
          instructions: "¿Alguna nota o instrucción adicional para tus beneficiarios?",
          accountInfo: "Por favor proporciona números de cuenta, información de referencia o detalles de identificación",
          accessInstructions: "¿Cómo deberían tus beneficiarios acceder a este activo? Incluye pasos de inicio de sesión o información de contacto"
        },
        'fr': {
          name: "Comment voulez-vous appeler cet actif? Par exemple, 'Compte Courant Principal' ou 'Maison Familiale'",
          location: "Où se trouve cet actif? Par exemple, 'Banque BNP Paribas' ou 'Coffre-fort 123'",
          value: "Quelle est la valeur estimée? Vous pouvez dire 'cinquante mille euros' ou 'inestimable'",
          instructions: "Des notes ou instructions supplémentaires pour vos bénéficiaires?",
          accountInfo: "Veuillez fournir les numéros de compte, les informations de référence ou les détails d'identification",
          accessInstructions: "Comment vos bénéficiaires devraient-ils accéder à cet actif? Incluez les étapes de connexion ou les coordonnées"
        },
        'de': {
          name: "Wie möchten Sie diesen Vermögenswert nennen? Zum Beispiel 'Hauptgirokonto' oder 'Familienhaus'",
          location: "Wo befindet sich dieser Vermögenswert? Zum Beispiel 'Deutsche Bank' oder 'Schließfach 123'",
          value: "Was ist der geschätzte Wert? Sie können 'fünfzigtausend Euro' oder 'unbezahlbar' sagen",
          instructions: "Zusätzliche Hinweise oder Anweisungen für Ihre Begünstigten?",
          accountInfo: "Bitte geben Sie Kontonummern, Referenzinformationen oder Identifikationsdetails an",
          accessInstructions: "Wie sollten Ihre Begünstigten auf diesen Vermögenswert zugreifen? Fügen Sie Anmeldeschritte oder Kontaktinformationen hinzu"
        },
        'zh': {
          name: "您想如何称呼这项资产？例如，'主要支票账户'或'家庭住宅'",
          location: "这项资产位于哪里？例如，'中国银行'或'保险箱123'",
          value: "估计价值是多少？您可以说'五万元'或'无价'",
          instructions: "对受益人有什么额外的说明或指示吗？",
          accountInfo: "请提供账号、参考信息或识别详情",
          accessInstructions: "您的受益人应如何访问此资产？包括登录步骤或联系信息"
        },
        'hi': {
          name: "आप इस संपत्ति को क्या नाम देना चाहेंगे? उदाहरण के लिए, 'प्राथमिक चेकिंग खाता' या 'पारिवारिक घर'",
          location: "यह संपत्ति कहां स्थित है? उदाहरण के लिए, 'स्टेट बैंक ऑफ इंडिया' या 'लॉकर 123'",
          value: "अनुमानित मूल्य क्या है? आप कह सकते हैं 'पचास हजार रुपये' या 'अमूल्य'",
          instructions: "आपके लाभार्थियों के लिए कोई अतिरिक्त नोट्स या निर्देश?",
          accountInfo: "कृपया खाता संख्या, संदर्भ जानकारी या पहचान विवरण प्रदान करें",
          accessInstructions: "आपके लाभार्थियों को इस संपत्ति तक कैसे पहुंचना चाहिए? लॉगिन चरण या संपर्क जानकारी शामिल करें"
        },
        'ar': {
          name: "ماذا تريد أن تسمي هذا الأصل؟ على سبيل المثال، 'حساب جاري رئيسي' أو 'منزل العائلة'",
          location: "أين يقع هذا الأصل؟ على سبيل المثال، 'البنك الأهلي' أو 'خزنة الأمانات 123'",
          value: "ما هي القيمة التقديرية؟ يمكنك أن تقول 'خمسين ألف ريال' أو 'لا تقدر بثمن'",
          instructions: "أي ملاحظات أو تعليمات إضافية للمستفيدين؟",
          accountInfo: "يرجى تقديم أرقام الحسابات أو معلومات مرجعية أو تفاصيل التعريف",
          accessInstructions: "كيف ينبغي للمستفيدين الوصول إلى هذا الأصل؟ قم بتضمين خطوات تسجيل الدخول أو معلومات الاتصال"
        }
      };
      
      return prompts[langCode]?.[fieldName] || prompts['en'][fieldName];
    }

    // Default English prompts
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

  const getLanguageDisplayName = (code: string) => {
    const language = LANGUAGE_OPTIONS.find(lang => lang.code === code);
    return language ? `${language.flag} ${language.name}` : code;
  };

  const getVoiceDisplayName = (voiceId: string) => {
    const voice = VOICE_OPTIONS.find(v => v.voice_id === voiceId);
    return voice ? `${voice.name} (${voice.gender})` : voiceId;
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
          Listening in {getLanguageDisplayName(selectedLanguage).split(' ')[0]}...
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
            <span>Multilingual Voice-Powered Asset Entry</span>
          </h3>
          <p className="text-sm text-slate-600 mt-1">
            Speak in your preferred language to add asset information
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Language Selector */}
          <div className="relative" ref={languageSelectorRef}>
            <button
              onClick={() => {
                setShowLanguageSelector(!showLanguageSelector);
                setShowVoiceSelector(false);
              }}
              className="flex items-center space-x-2 px-3 py-2 border border-slate-300 rounded-lg text-sm hover:bg-slate-50 transition-colors"
              disabled={isRecording}
            >
              <Globe className="w-4 h-4 text-blue-600" />
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
                        setSelectedLanguage(language.code);
                        setShowLanguageSelector(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm rounded-lg flex items-center space-x-2 hover:bg-slate-100 ${
                        selectedLanguage === language.code ? 'bg-blue-50 text-blue-700' : ''
                      }`}
                    >
                      <span className="text-lg">{language.flag}</span>
                      <div className="flex-1">
                        <div>{language.name}</div>
                        <div className="text-xs text-slate-500">{language.family} • {language.speakers} speakers</div>
                      </div>
                      {selectedLanguage === language.code && (
                        <Check className="w-4 h-4 text-blue-600" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Voice Selector */}
          <div className="relative" ref={voiceSelectorRef}>
            <button
              onClick={() => {
                setShowVoiceSelector(!showVoiceSelector);
                setShowLanguageSelector(false);
              }}
              className="flex items-center space-x-2 px-3 py-2 border border-slate-300 rounded-lg text-sm hover:bg-slate-50 transition-colors"
              disabled={isRecording}
            >
              <Volume2 className="w-4 h-4 text-purple-600" />
              <span>Voice</span>
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
                          selectedVoice === voice.voice_id ? 'bg-purple-50 text-purple-700' : ''
                        }`}
                      >
                        <div className="flex-1">
                          <div>{voice.name}</div>
                          <div className="text-xs text-slate-500">
                            {voice.gender} • {voice.accent || voice.category}
                          </div>
                        </div>
                        {selectedVoice === voice.voice_id && (
                          <Check className="w-4 h-4 text-purple-600" />
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
              Recording for "{fieldLabels[activeField as keyof typeof fieldLabels]}" in {getLanguageDisplayName(selectedLanguage)}
            </span>
          </div>
          <p className="text-xs text-red-600 mt-1">
            {getVoicePrompt(activeField!)}
          </p>
        </div>
      )}

      {culturalContext && (
        <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <h4 className="text-sm font-medium text-purple-900 mb-2">
            {selectedLanguage.split('-')[1]} Cultural Context Enabled
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-purple-800">
            {culturalContext.bankTerms && (
              <div>
                <span className="font-medium">Common Banks:</span> {culturalContext.bankTerms.join(', ')}
              </div>
            )}
            {culturalContext.numberFormats && (
              <div>
                <span className="font-medium">Currency Format:</span> {culturalContext.numberFormats.join(', ')}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Multilingual Voice Input Tips:</h4>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• Speak clearly in your selected language</li>
          <li>• Use natural expressions and currency formats for your region</li>
          <li>• For values, use your local currency format (e.g., "fifty thousand naira", "5 lakh rupees")</li>
          <li>• Click the microphone again to stop recording</li>
          <li>• Switch languages anytime using the language selector</li>
        </ul>
      </div>
    </div>
  );
};

export default VoiceAssetEntry;