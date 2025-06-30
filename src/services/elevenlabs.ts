import { ElevenLabsClient } from 'elevenlabs';

// Initialize ElevenLabs client
const elevenlabs = new ElevenLabsClient({
  apiKey: import.meta.env.VITE_ELEVENLABS_API_KEY || '',
});

export interface VoiceOption {
  voice_id: string;
  name: string;
  category: string;
  description: string;
  preview_url?: string;
  languages: string[];
  accent?: string;
  gender: 'male' | 'female' | 'neutral';
}

export interface VoiceMessage {
  id: string;
  text: string;
  audioUrl: string;
  voiceId: string;
  language: string;
  createdAt: string;
}

// Comprehensive multilingual voice options with cultural representation
export const VOICE_OPTIONS: VoiceOption[] = [
  // English Voices
  {
    voice_id: 'pNInz6obpgDQGcFmaJgB',
    name: 'Adam',
    category: 'english',
    description: 'Deep, warm American English voice',
    languages: ['en-US', 'en-CA'],
    accent: 'American',
    gender: 'male'
  },
  {
    voice_id: 'EXAVITQu4vr4xnSDxMaL',
    name: 'Bella',
    category: 'english',
    description: 'Gentle, caring British English voice',
    languages: ['en-GB', 'en-AU'],
    accent: 'British',
    gender: 'female'
  },
  {
    voice_id: 'ErXwobaYiN019PkySvjV',
    name: 'Antoni',
    category: 'english',
    description: 'Clear, professional American English',
    languages: ['en-US'],
    accent: 'American',
    gender: 'male'
  },
  {
    voice_id: 'MF3mGyEYCl7XYWbV9V6O',
    name: 'Elli',
    category: 'english',
    description: 'Warm, friendly American English',
    languages: ['en-US'],
    accent: 'American',
    gender: 'female'
  },

  // Spanish Voices
  {
    voice_id: 'VR6AewLTigWG4xSOukaG',
    name: 'Arnold',
    category: 'spanish',
    description: 'Confident Mexican Spanish voice',
    languages: ['es-MX', 'es-US'],
    accent: 'Mexican',
    gender: 'male'
  },
  {
    voice_id: 'pqHfZKP75CvOlQylNhV4',
    name: 'Bill',
    category: 'spanish',
    description: 'Professional Argentinian Spanish',
    languages: ['es-AR', 'es-ES'],
    accent: 'Argentinian',
    gender: 'male'
  },

  // French Voices
  {
    voice_id: 'g5CIjZEefAph4nQFvHAz',
    name: 'Ethan',
    category: 'french',
    description: 'Elegant Parisian French voice',
    languages: ['fr-FR'],
    accent: 'Parisian',
    gender: 'male'
  },
  {
    voice_id: 'cgSgspJ2msm6clMCkdW9',
    name: 'Sarah',
    category: 'french',
    description: 'Warm Canadian French voice',
    languages: ['fr-CA'],
    accent: 'Canadian',
    gender: 'female'
  },

  // German Voices
  {
    voice_id: 'yoZ06aMxZJJ28mfd3POQ',
    name: 'Sam',
    category: 'german',
    description: 'Clear, professional German voice',
    languages: ['de-DE'],
    accent: 'Standard German',
    gender: 'male'
  },

  // Italian Voices
  {
    voice_id: 'AZnzlk1XvdvUeBnXmlld',
    name: 'Domi',
    category: 'italian',
    description: 'Expressive Italian voice',
    languages: ['it-IT'],
    accent: 'Standard Italian',
    gender: 'male'
  },

  // Portuguese Voices
  {
    voice_id: 'onwK4e9ZLuTAKqWW03F9',
    name: 'Daniel',
    category: 'portuguese',
    description: 'Warm Brazilian Portuguese',
    languages: ['pt-BR'],
    accent: 'Brazilian',
    gender: 'male'
  },

  // Chinese Voices
  {
    voice_id: 'XrExE9yKIg1WjnnlVkGX',
    name: 'Matilda',
    category: 'chinese',
    description: 'Clear Mandarin Chinese voice',
    languages: ['zh-CN'],
    accent: 'Beijing',
    gender: 'female'
  },

  // Japanese Voices
  {
    voice_id: 'bVMeCyTHy58xNoL34h3p',
    name: 'Jeremy',
    category: 'japanese',
    description: 'Professional Japanese voice',
    languages: ['ja-JP'],
    accent: 'Tokyo',
    gender: 'male'
  },

  // Hindi Voices
  {
    voice_id: 'flq6f7yk4E4fJM5XTYuZ',
    name: 'Michael',
    category: 'hindi',
    description: 'Clear Hindi voice with English accent',
    languages: ['hi-IN', 'en-IN'],
    accent: 'Indian',
    gender: 'male'
  },

  // Arabic Voices
  {
    voice_id: 'TxGEqnHWrfWFTfGW9XjX',
    name: 'Josh',
    category: 'arabic',
    description: 'Professional Arabic voice',
    languages: ['ar-SA', 'ar-EG'],
    accent: 'Modern Standard',
    gender: 'male'
  },

  // Nigerian English (Igbo/Yoruba influenced)
  {
    voice_id: 'ThT5KcBeYPX3keUQqHPh',
    name: 'Dorothy',
    category: 'nigerian',
    description: 'Nigerian English with local accent',
    languages: ['en-NG', 'ig-NG', 'yo-NG'],
    accent: 'Nigerian',
    gender: 'female'
  },

  // Kenyan English (Swahili influenced)
  {
    voice_id: 'CYw3kZ02Hs0563khs1Fj',
    name: 'Marcus',
    category: 'kenyan',
    description: 'Kenyan English with Swahili influence',
    languages: ['en-KE', 'sw-KE'],
    accent: 'Kenyan',
    gender: 'male'
  }
];

// Comprehensive language options with cultural context
export const LANGUAGE_OPTIONS = [
  // Major World Languages
  { code: 'en-US', name: 'English (US)', flag: '🇺🇸', family: 'Germanic', speakers: '380M' },
  { code: 'en-GB', name: 'English (UK)', flag: '🇬🇧', family: 'Germanic', speakers: '67M' },
  { code: 'en-AU', name: 'English (Australia)', flag: '🇦🇺', family: 'Germanic', speakers: '25M' },
  { code: 'en-CA', name: 'English (Canada)', flag: '🇨🇦', family: 'Germanic', speakers: '30M' },
  { code: 'en-IN', name: 'English (India)', flag: '🇮🇳', family: 'Germanic', speakers: '125M' },
  { code: 'en-NG', name: 'English (Nigeria)', flag: '🇳🇬', family: 'Germanic', speakers: '79M' },
  { code: 'en-KE', name: 'English (Kenya)', flag: '🇰🇪', family: 'Germanic', speakers: '2.7M' },
  { code: 'en-ZA', name: 'English (South Africa)', flag: '🇿🇦', family: 'Germanic', speakers: '4.9M' },

  // Spanish Variants
  { code: 'es-ES', name: 'Español (España)', flag: '🇪🇸', family: 'Romance', speakers: '47M' },
  { code: 'es-MX', name: 'Español (México)', flag: '🇲🇽', family: 'Romance', speakers: '129M' },
  { code: 'es-AR', name: 'Español (Argentina)', flag: '🇦🇷', family: 'Romance', speakers: '45M' },
  { code: 'es-CO', name: 'Español (Colombia)', flag: '🇨🇴', family: 'Romance', speakers: '50M' },
  { code: 'es-US', name: 'Español (Estados Unidos)', flag: '🇺🇸', family: 'Romance', speakers: '41M' },

  // French Variants
  { code: 'fr-FR', name: 'Français (France)', flag: '🇫🇷', family: 'Romance', speakers: '67M' },
  { code: 'fr-CA', name: 'Français (Canada)', flag: '🇨🇦', family: 'Romance', speakers: '7M' },
  { code: 'fr-BE', name: 'Français (Belgique)', flag: '🇧🇪', family: 'Romance', speakers: '4M' },
  { code: 'fr-CH', name: 'Français (Suisse)', flag: '🇨🇭', family: 'Romance', speakers: '2M' },

  // German Variants
  { code: 'de-DE', name: 'Deutsch (Deutschland)', flag: '🇩🇪', family: 'Germanic', speakers: '83M' },
  { code: 'de-AT', name: 'Deutsch (Österreich)', flag: '🇦🇹', family: 'Germanic', speakers: '9M' },
  { code: 'de-CH', name: 'Deutsch (Schweiz)', flag: '🇨🇭', family: 'Germanic', speakers: '5M' },

  // Italian
  { code: 'it-IT', name: 'Italiano', flag: '🇮🇹', family: 'Romance', speakers: '65M' },

  // Portuguese Variants
  { code: 'pt-BR', name: 'Português (Brasil)', flag: '🇧🇷', family: 'Romance', speakers: '215M' },
  { code: 'pt-PT', name: 'Português (Portugal)', flag: '🇵🇹', family: 'Romance', speakers: '10M' },

  // Chinese Variants
  { code: 'zh-CN', name: '中文 (简体)', flag: '🇨🇳', family: 'Sino-Tibetan', speakers: '918M' },
  { code: 'zh-TW', name: '中文 (繁體)', flag: '🇹🇼', family: 'Sino-Tibetan', speakers: '23M' },
  { code: 'zh-HK', name: '中文 (香港)', flag: '🇭🇰', family: 'Sino-Tibetan', speakers: '7M' },

  // Japanese
  { code: 'ja-JP', name: '日本語', flag: '🇯🇵', family: 'Japonic', speakers: '125M' },

  // Korean
  { code: 'ko-KR', name: '한국어', flag: '🇰🇷', family: 'Koreanic', speakers: '77M' },

  // Hindi and Indian Languages
  { code: 'hi-IN', name: 'हिन्दी', flag: '🇮🇳', family: 'Indo-European', speakers: '602M' },
  { code: 'bn-BD', name: 'বাংলা (Bangladesh)', flag: '🇧🇩', family: 'Indo-European', speakers: '265M' },
  { code: 'ta-IN', name: 'தமிழ்', flag: '🇮🇳', family: 'Dravidian', speakers: '78M' },
  { code: 'te-IN', name: 'తెలుగు', flag: '🇮🇳', family: 'Dravidian', speakers: '96M' },
  { code: 'mr-IN', name: 'मराठी', flag: '🇮🇳', family: 'Indo-European', speakers: '83M' },
  { code: 'gu-IN', name: 'ગુજરાતી', flag: '🇮🇳', family: 'Indo-European', speakers: '56M' },
  { code: 'pa-IN', name: 'ਪੰਜਾਬੀ', flag: '🇮🇳', family: 'Indo-European', speakers: '113M' },

  // Arabic Variants
  { code: 'ar-SA', name: 'العربية (السعودية)', flag: '🇸🇦', family: 'Semitic', speakers: '34M' },
  { code: 'ar-EG', name: 'العربية (مصر)', flag: '🇪🇬', family: 'Semitic', speakers: '104M' },
  { code: 'ar-AE', name: 'العربية (الإمارات)', flag: '🇦🇪', family: 'Semitic', speakers: '9M' },

  // African Languages
  { code: 'sw-KE', name: 'Kiswahili', flag: '🇰🇪', family: 'Niger-Congo', speakers: '16M' },
  { code: 'am-ET', name: 'አማርኛ', flag: '🇪🇹', family: 'Semitic', speakers: '57M' },
  { code: 'yo-NG', name: 'Yorùbá', flag: '🇳🇬', family: 'Niger-Congo', speakers: '46M' },
  { code: 'ig-NG', name: 'Igbo', flag: '🇳🇬', family: 'Niger-Congo', speakers: '27M' },
  { code: 'ha-NG', name: 'Hausa', flag: '🇳🇬', family: 'Afro-Asiatic', speakers: '70M' },
  { code: 'zu-ZA', name: 'isiZulu', flag: '🇿🇦', family: 'Niger-Congo', speakers: '12M' },
  { code: 'xh-ZA', name: 'isiXhosa', flag: '🇿🇦', family: 'Niger-Congo', speakers: '8M' },
  { code: 'af-ZA', name: 'Afrikaans', flag: '🇿🇦', family: 'Germanic', speakers: '7M' },

  // Southeast Asian Languages
  { code: 'th-TH', name: 'ไทย', flag: '🇹🇭', family: 'Kra-Dai', speakers: '69M' },
  { code: 'vi-VN', name: 'Tiếng Việt', flag: '🇻🇳', family: 'Austroasiatic', speakers: '95M' },
  { code: 'id-ID', name: 'Bahasa Indonesia', flag: '🇮🇩', family: 'Austronesian', speakers: '199M' },
  { code: 'ms-MY', name: 'Bahasa Melayu', flag: '🇲🇾', family: 'Austronesian', speakers: '19M' },
  { code: 'tl-PH', name: 'Filipino', flag: '🇵🇭', family: 'Austronesian', speakers: '45M' },

  // Eastern European Languages
  { code: 'ru-RU', name: 'Русский', flag: '🇷🇺', family: 'Indo-European', speakers: '258M' },
  { code: 'pl-PL', name: 'Polski', flag: '🇵🇱', family: 'Indo-European', speakers: '45M' },
  { code: 'uk-UA', name: 'Українська', flag: '🇺🇦', family: 'Indo-European', speakers: '40M' },
  { code: 'cs-CZ', name: 'Čeština', flag: '🇨🇿', family: 'Indo-European', speakers: '10M' },

  // Nordic Languages
  { code: 'sv-SE', name: 'Svenska', flag: '🇸🇪', family: 'Germanic', speakers: '10M' },
  { code: 'no-NO', name: 'Norsk', flag: '🇳🇴', family: 'Germanic', speakers: '5M' },
  { code: 'da-DK', name: 'Dansk', flag: '🇩🇰', family: 'Germanic', speakers: '6M' },
  { code: 'fi-FI', name: 'Suomi', flag: '🇫🇮', family: 'Uralic', speakers: '5M' },

  // Other Languages
  { code: 'tr-TR', name: 'Türkçe', flag: '🇹🇷', family: 'Turkic', speakers: '88M' },
  { code: 'he-IL', name: 'עברית', flag: '🇮🇱', family: 'Semitic', speakers: '9M' },
  { code: 'fa-IR', name: 'فارسی', flag: '🇮🇷', family: 'Indo-European', speakers: '70M' },
  { code: 'ur-PK', name: 'اردو', flag: '🇵🇰', family: 'Indo-European', speakers: '70M' }
];

// Cultural context for better voice recognition
export const CULTURAL_VOICE_PATTERNS = {
  'en-NG': {
    commonPhrases: ['How far?', 'No wahala', 'I dey fine', 'Wetin dey happen?'],
    numberFormats: ['naira', 'kobo', 'million naira', 'billion naira'],
    bankTerms: ['GTBank', 'First Bank', 'Access Bank', 'Zenith Bank', 'UBA']
  },
  'en-KE': {
    commonPhrases: ['Mambo vipi?', 'Poa', 'Sawa sawa', 'Hakuna matata'],
    numberFormats: ['shilling', 'bob', 'million shillings'],
    bankTerms: ['KCB', 'Equity Bank', 'Cooperative Bank', 'Standard Chartered']
  },
  'en-IN': {
    commonPhrases: ['Namaste', 'Acha', 'Theek hai', 'Kya haal hai?'],
    numberFormats: ['rupee', 'paisa', 'lakh', 'crore'],
    bankTerms: ['SBI', 'HDFC', 'ICICI', 'Axis Bank', 'PNB']
  },
  'es-MX': {
    commonPhrases: ['¿Qué tal?', 'Está bien', 'No hay problema', '¿Cómo estás?'],
    numberFormats: ['peso', 'centavo', 'millón de pesos'],
    bankTerms: ['BBVA', 'Santander', 'Banorte', 'Citibanamex']
  },
  'fr-CA': {
    commonPhrases: ['Salut', 'Ça va?', 'Pas de problème', 'Comment allez-vous?'],
    numberFormats: ['dollar canadien', 'cent', 'million de dollars'],
    bankTerms: ['RBC', 'TD', 'Banque Nationale', 'Desjardins']
  },
  'zh-CN': {
    commonPhrases: ['你好', '没问题', '怎么样?', '很好'],
    numberFormats: ['元', '角', '分', '万元', '亿元'],
    bankTerms: ['中国银行', '工商银行', '建设银行', '农业银行']
  }
};

class ElevenLabsService {
  private apiKey: string;
  private mockAudioUrls: string[] = [
    'https://audio-samples.github.io/samples/mp3/blizzard_biased/sample-1.mp3',
    'https://audio-samples.github.io/samples/mp3/blizzard_biased/sample-2.mp3',
    'https://audio-samples.github.io/samples/mp3/blizzard_biased/sample-3.mp3',
    'https://audio-samples.github.io/samples/mp3/blizzard_unconditional/sample-1.mp3',
    'https://audio-samples.github.io/samples/mp3/blizzard_unconditional/sample-2.mp3'
  ];

  constructor() {
    this.apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY || '';
  }

  // Check if ElevenLabs is configured
  isConfigured(): boolean {
    return !!this.apiKey;
  }

  // Generate speech from text with language-specific optimization
  async generateSpeech(
    text: string, 
    voiceId: string = 'pNInz6obpgDQGcFmaJgB',
    options: {
      stability?: number;
      similarity_boost?: number;
      style?: number;
      use_speaker_boost?: boolean;
      language?: string;
    } = {}
  ): Promise<ArrayBuffer> {
    try {
      if (!this.isConfigured()) {
        // Return a mock audio buffer for demo purposes
        const response = await fetch(this.getRandomMockAudioUrl());
        return await response.arrayBuffer();
      }

      // Get voice info to optimize settings
      const voice = VOICE_OPTIONS.find(v => v.voice_id === voiceId);
      const isMultilingual = voice?.languages.length > 1;

      const audio = await elevenlabs.generate({
        voice: voiceId,
        text: text,
        model_id: isMultilingual ? 'eleven_multilingual_v2' : 'eleven_monolingual_v1',
        voice_settings: {
          stability: options.stability || (isMultilingual ? 0.6 : 0.5),
          similarity_boost: options.similarity_boost || 0.8,
          style: options.style || 0.0,
          use_speaker_boost: options.use_speaker_boost || true
        }
      });

      return audio;
    } catch (error) {
      console.error('Error generating speech:', error);
      
      // Return a mock audio buffer for demo purposes
      const response = await fetch(this.getRandomMockAudioUrl());
      return await response.arrayBuffer();
    }
  }

  // Get a random mock audio URL for demo purposes
  private getRandomMockAudioUrl(): string {
    const randomIndex = Math.floor(Math.random() * this.mockAudioUrls.length);
    return this.mockAudioUrls[randomIndex];
  }

  // Convert audio buffer to blob URL for playback
  createAudioUrl(audioBuffer: ArrayBuffer): string {
    const blob = new Blob([audioBuffer], { type: 'audio/mpeg' });
    return URL.createObjectURL(blob);
  }

  // Get voices filtered by language
  getVoicesByLanguage(languageCode: string): VoiceOption[] {
    return VOICE_OPTIONS.filter(voice => 
      voice.languages.some(lang => 
        lang.startsWith(languageCode.split('-')[0]) || 
        lang === languageCode
      )
    );
  }

  // Get recommended voice for a language
  getRecommendedVoice(languageCode: string, gender?: 'male' | 'female'): VoiceOption | null {
    const voices = this.getVoicesByLanguage(languageCode);
    
    if (gender) {
      const genderFiltered = voices.filter(v => v.gender === gender);
      if (genderFiltered.length > 0) {
        return genderFiltered[0];
      }
    }
    
    return voices[0] || null;
  }

  // Enhanced speech-to-text with language-specific recognition
  startVoiceRecognition(
    onResult: (transcript: string) => void,
    onError: (error: string) => void,
    language: string = 'en-US',
    culturalContext?: string
  ): SpeechRecognition | null {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      onError('Speech recognition not supported in this browser');
      return null;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = language;
    recognition.maxAlternatives = 3;

    // Enhanced recognition for specific languages
    if (language.startsWith('en-')) {
      recognition.grammars = this.createGrammarForLanguage(language);
    }

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        // Apply cultural context processing
        const processedTranscript = this.processCulturalContext(finalTranscript, language, culturalContext);
        onResult(processedTranscript);
      }
    };

    recognition.onerror = (event) => {
      onError(`Speech recognition error: ${event.error}`);
    };

    recognition.start();
    return recognition;
  }

  // Create grammar for better recognition
  private createGrammarForLanguage(language: string): SpeechGrammarList | undefined {
    if (!('webkitSpeechGrammarList' in window) && !('SpeechGrammarList' in window)) {
      return undefined;
    }

    const SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;
    const grammarList = new SpeechGrammarList();

    // Add common financial terms based on language/culture
    const culturalPatterns = CULTURAL_VOICE_PATTERNS[language as keyof typeof CULTURAL_VOICE_PATTERNS];
    
    if (culturalPatterns) {
      const grammar = `#JSGF V1.0; grammar financial; public <financial> = ${culturalPatterns.bankTerms.join(' | ')} | ${culturalPatterns.numberFormats.join(' | ')};`;
      grammarList.addFromString(grammar, 1);
    }

    return grammarList;
  }

  // Process transcript with cultural context
  private processCulturalContext(transcript: string, language: string, context?: string): string {
    let processed = transcript.trim();

    // Apply language-specific processing
    const culturalPatterns = CULTURAL_VOICE_PATTERNS[language as keyof typeof CULTURAL_VOICE_PATTERNS];
    
    if (culturalPatterns) {
      // Convert common phrases to standard format
      culturalPatterns.commonPhrases.forEach(phrase => {
        const regex = new RegExp(phrase, 'gi');
        if (regex.test(processed)) {
          // Keep the original phrase but ensure proper capitalization
          processed = processed.replace(regex, phrase);
        }
      });

      // Standardize currency formats
      culturalPatterns.numberFormats.forEach(format => {
        const regex = new RegExp(`\\b\\d+\\s*${format}`, 'gi');
        processed = processed.replace(regex, (match) => {
          return match.toLowerCase().replace(/\s+/g, ' ');
        });
      });
    }

    // Apply context-specific processing
    if (context === 'asset_name') {
      processed = this.processAssetName(processed, language);
    } else if (context === 'financial_value') {
      processed = this.processFinancialValue(processed, language);
    } else if (context === 'location') {
      processed = this.processLocation(processed, language);
    }

    return processed;
  }

  // Process asset names with cultural awareness
  processAssetName(text: string, language: string): string {
    // Capitalize first letter of each word
    let processed = text.replace(/\b\w/g, l => l.toUpperCase());

    // Language-specific asset name processing
    if (language.startsWith('en-NG')) {
      // Nigerian context
      processed = processed.replace(/\bgtb\b/gi, 'GTBank');
      processed = processed.replace(/\bfirst bank\b/gi, 'First Bank');
      processed = processed.replace(/\baccess\b/gi, 'Access Bank');
    } else if (language.startsWith('en-KE')) {
      // Kenyan context
      processed = processed.replace(/\bkcb\b/gi, 'KCB Bank');
      processed = processed.replace(/\bequity\b/gi, 'Equity Bank');
    } else if (language.startsWith('en-IN')) {
      // Indian context
      processed = processed.replace(/\bsbi\b/gi, 'State Bank of India');
      processed = processed.replace(/\bhdfc\b/gi, 'HDFC Bank');
    }

    return processed;
  }

  // Process financial values with cultural number formats
  processFinancialValue(text: string, language: string): string {
    let processed = text;

    if (language.startsWith('en-NG')) {
      // Nigerian Naira processing
      processed = processed.replace(/\b(\d+)\s*(naira|NGN)\b/gi, '₦$1');
      processed = processed.replace(/\b(\d+)\s*million\s*naira\b/gi, '₦$1,000,000');
      processed = processed.replace(/\b(\d+)\s*billion\s*naira\b/gi, '₦$1,000,000,000');
    } else if (language.startsWith('en-KE')) {
      // Kenyan Shilling processing
      processed = processed.replace(/\b(\d+)\s*(shilling|KES|bob)\b/gi, 'KSh $1');
      processed = processed.replace(/\b(\d+)\s*million\s*shilling/gi, 'KSh $1,000,000');
    } else if (language.startsWith('en-IN')) {
      // Indian Rupee processing
      processed = processed.replace(/\b(\d+)\s*(rupee|INR)\b/gi, '₹$1');
      processed = processed.replace(/\b(\d+)\s*lakh\b/gi, '₹$1,00,000');
      processed = processed.replace(/\b(\d+)\s*crore\b/gi, '₹$1,00,00,000');
    } else if (language.startsWith('es-')) {
      // Spanish peso processing
      processed = processed.replace(/\b(\d+)\s*(peso|MXN)\b/gi, '$$$1');
      processed = processed.replace(/\b(\d+)\s*millón\s*peso/gi, '$$$1,000,000');
    } else if (language.startsWith('zh-')) {
      // Chinese Yuan processing
      processed = processed.replace(/\b(\d+)\s*(元|CNY)\b/gi, '¥$1');
      processed = processed.replace(/\b(\d+)\s*万\s*元/gi, '¥$1,0000');
    }

    return processed;
  }

  // Process location names with cultural context
  processLocation(text: string, language: string): string {
    let processed = text.replace(/\b\w/g, l => l.toUpperCase());

    // Add cultural location processing
    if (language.startsWith('en-NG')) {
      processed = processed.replace(/\blagos\b/gi, 'Lagos');
      processed = processed.replace(/\babuja\b/gi, 'Abuja');
      processed = processed.replace(/\bvictoria island\b/gi, 'Victoria Island');
    } else if (language.startsWith('en-KE')) {
      processed = processed.replace(/\bnairobi\b/gi, 'Nairobi');
      processed = processed.replace(/\bmombasa\b/gi, 'Mombasa');
    }

    return processed;
  }

  // Translate text for multilingual support
  async translateText(text: string, targetLanguage: string): Promise<string> {
    // This is a placeholder for translation functionality
    // In a real implementation, you'd integrate with a translation service like Google Translate
    const translations: { [key: string]: { [key: string]: string } } = {
      'en': {
        'es': `[ES] ${text}`,
        'fr': `[FR] ${text}`,
        'de': `[DE] ${text}`,
        'zh': `[ZH] ${text}`,
        'hi': `[HI] ${text}`,
        'ar': `[AR] ${text}`
      }
    };

    const sourceLang = 'en'; // Detect source language
    return translations[sourceLang]?.[targetLanguage] || text;
  }

  // Generate multilingual voice message
  async generateMultilingualMessage(
    text: string,
    languages: string[],
    voicePreferences: { [language: string]: string } = {}
  ): Promise<{ language: string; audioUrl: string; voiceUsed: string }[]> {
    const results = [];

    for (const language of languages) {
      try {
        // Get appropriate voice for language
        const preferredVoiceId = voicePreferences[language];
        const voice = preferredVoiceId 
          ? VOICE_OPTIONS.find(v => v.voice_id === preferredVoiceId)
          : this.getRecommendedVoice(language);

        if (!voice) {
          console.warn(`No voice available for language: ${language}`);
          continue;
        }

        // Translate text if needed
        const translatedText = language.startsWith('en') 
          ? text 
          : await this.translateText(text, language.split('-')[0]);
        
        if (!this.isConfigured()) {
          // Use mock audio for demo purposes
          results.push({
            language,
            audioUrl: this.getRandomMockAudioUrl(),
            voiceUsed: voice.name
          });
          continue;
        }
        
        // Generate speech
        const audioBuffer = await this.generateSpeech(
          translatedText, 
          voice.voice_id,
          { language }
        );
        const audioUrl = this.createAudioUrl(audioBuffer);

        results.push({
          language,
          audioUrl,
          voiceUsed: voice.name
        });
      } catch (error) {
        console.error(`Error generating message for ${language}:`, error);
        
        // Add mock audio for failed languages
        const voice = this.getRecommendedVoice(language);
        if (voice) {
          results.push({
            language,
            audioUrl: this.getRandomMockAudioUrl(),
            voiceUsed: voice.name
          });
        }
      }
    }

    return results;
  }

  // Get language family for better voice matching
  getLanguageFamily(languageCode: string): string {
    const language = LANGUAGE_OPTIONS.find(lang => lang.code === languageCode);
    return language?.family || 'Unknown';
  }

  // Get cultural context for language
  getCulturalContext(languageCode: string): any {
    return CULTURAL_VOICE_PATTERNS[languageCode as keyof typeof CULTURAL_VOICE_PATTERNS] || null;
  }
}

// Create singleton instance
export const elevenLabsService = new ElevenLabsService();

// Type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
    SpeechGrammarList: any;
    webkitSpeechGrammarList: any;
  }
}