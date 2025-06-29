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
}

export interface VoiceMessage {
  id: string;
  text: string;
  audioUrl: string;
  voiceId: string;
  language: string;
  createdAt: string;
}

// Available voices for different purposes
export const VOICE_OPTIONS: VoiceOption[] = [
  {
    voice_id: 'pNInz6obpgDQGcFmaJgB',
    name: 'Adam',
    category: 'male',
    description: 'Deep, warm voice perfect for heartfelt messages'
  },
  {
    voice_id: 'EXAVITQu4vr4xnSDxMaL',
    name: 'Bella',
    category: 'female',
    description: 'Gentle, caring voice ideal for personal messages'
  },
  {
    voice_id: 'ErXwobaYiN019PkySvjV',
    name: 'Antoni',
    category: 'male',
    description: 'Clear, professional voice for instructions'
  },
  {
    voice_id: 'MF3mGyEYCl7XYWbV9V6O',
    name: 'Elli',
    category: 'female',
    description: 'Warm, friendly voice for family messages'
  }
];

// Language options for multilingual support
export const LANGUAGE_OPTIONS = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'pl', name: 'Polish', flag: '🇵🇱' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' }
];

class ElevenLabsService {
  private apiKey: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY || '';
  }

  // Generate speech from text
  async generateSpeech(
    text: string, 
    voiceId: string = 'pNInz6obpgDQGcFmaJgB',
    options: {
      stability?: number;
      similarity_boost?: number;
      style?: number;
      use_speaker_boost?: boolean;
    } = {}
  ): Promise<ArrayBuffer> {
    try {
      const audio = await elevenlabs.generate({
        voice: voiceId,
        text: text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: options.stability || 0.5,
          similarity_boost: options.similarity_boost || 0.8,
          style: options.style || 0.0,
          use_speaker_boost: options.use_speaker_boost || true
        }
      });

      return audio;
    } catch (error) {
      console.error('Error generating speech:', error);
      throw new Error('Failed to generate speech');
    }
  }

  // Convert audio buffer to blob URL for playback
  createAudioUrl(audioBuffer: ArrayBuffer): string {
    const blob = new Blob([audioBuffer], { type: 'audio/mpeg' });
    return URL.createObjectURL(blob);
  }

  // Get available voices
  async getVoices(): Promise<VoiceOption[]> {
    try {
      const voices = await elevenlabs.voices.getAll();
      return voices.voices.map(voice => ({
        voice_id: voice.voice_id,
        name: voice.name,
        category: voice.category || 'general',
        description: voice.description || '',
        preview_url: voice.preview_url
      }));
    } catch (error) {
      console.error('Error fetching voices:', error);
      return VOICE_OPTIONS; // Fallback to default voices
    }
  }

  // Speech-to-text for voice input (using Web Speech API as fallback)
  startVoiceRecognition(
    onResult: (transcript: string) => void,
    onError: (error: string) => void,
    language: string = 'en-US'
  ): SpeechRecognition | null {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      onError('Speech recognition not supported in this browser');
      return null;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = language;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };

    recognition.onerror = (event) => {
      onError(`Speech recognition error: ${event.error}`);
    };

    recognition.start();
    return recognition;
  }

  // Translate text for multilingual support
  async translateText(text: string, targetLanguage: string): Promise<string> {
    // This is a placeholder for translation functionality
    // In a real implementation, you'd integrate with a translation service
    // For now, we'll return the original text with a language indicator
    return `[${targetLanguage.toUpperCase()}] ${text}`;
  }

  // Generate multilingual voice message
  async generateMultilingualMessage(
    text: string,
    languages: string[],
    voiceId: string
  ): Promise<{ language: string; audioUrl: string }[]> {
    const results = [];

    for (const language of languages) {
      try {
        // Translate text (placeholder implementation)
        const translatedText = await this.translateText(text, language);
        
        // Generate speech
        const audioBuffer = await this.generateSpeech(translatedText, voiceId);
        const audioUrl = this.createAudioUrl(audioBuffer);

        results.push({
          language,
          audioUrl
        });
      } catch (error) {
        console.error(`Error generating message for ${language}:`, error);
      }
    }

    return results;
  }
}

// Create singleton instance
export const elevenLabsService = new ElevenLabsService();

// Type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}