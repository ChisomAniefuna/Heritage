import axios from 'axios';

// Tavus API Configuration
const TAVUS_API_BASE = 'https://tavusapi.com/v2';

export interface TavusReplica {
  replica_id: string;
  name: string;
  status: 'ready' | 'processing' | 'failed';
  created_at: string;
  thumbnail_url?: string;
  preview_video_url?: string;
  identity_profile?: IdentityProfile;
}

export interface IdentityProfile {
  ethnicity?: string;
  age_range?: string;
  gender_expression?: string;
  cultural_identity?: string;
  representation_style?: string;
  clothing_style?: string;
  hairstyle?: string;
  custom_description?: string;
}

export interface TavusVideo {
  video_id: string;
  replica_id: string;
  video_name: string;
  script: string;
  status: 'generating' | 'completed' | 'failed';
  download_url?: string;
  stream_url?: string;
  created_at: string;
  callback_url?: string;
}

export interface CreateVideoRequest {
  replica_id: string;
  script: string;
  video_name?: string;
  callback_url?: string;
  properties?: {
    voice_settings?: {
      stability?: number;
      similarity_boost?: number;
      style?: number;
    };
    max_video_length?: number;
    identity_enhancement?: {
      cultural_context?: string;
      emotional_tone?: string;
      representation_style?: string;
    };
  };
}

export interface CreateReplicaRequest {
  callback_url?: string;
  replica_name: string;
  train_video_url?: string;
  train_video_file?: File;
  identity_profile?: IdentityProfile;
  photo_reference?: File;
  representation_preferences?: RepresentationPreferences;
}

export interface RepresentationPreferences {
  creation_method: 'video_training' | 'photo_generation' | 'preset_selection';
  cultural_identity?: string;
  role_representation?: string;
  visual_style?: string;
  clothing_preference?: string;
  setting_preference?: string;
}

// Comprehensive identity and cultural representation options
export const CULTURAL_IDENTITIES = [
  // African Diaspora
  { id: 'nigerian', label: 'Nigerian', region: 'West Africa', subgroups: ['Igbo', 'Yoruba', 'Hausa', 'Fulani'] },
  { id: 'ghanaian', label: 'Ghanaian', region: 'West Africa', subgroups: ['Akan', 'Ewe', 'Ga'] },
  { id: 'kenyan', label: 'Kenyan', region: 'East Africa', subgroups: ['Kikuyu', 'Luo', 'Maasai'] },
  { id: 'ethiopian', label: 'Ethiopian', region: 'East Africa', subgroups: ['Amhara', 'Oromo', 'Tigray'] },
  { id: 'south_african', label: 'South African', region: 'Southern Africa', subgroups: ['Zulu', 'Xhosa', 'Afrikaner'] },
  { id: 'african_american', label: 'African American', region: 'Americas', subgroups: ['Southern', 'Northern', 'Caribbean'] },
  
  // Asian
  { id: 'chinese', label: 'Chinese', region: 'East Asia', subgroups: ['Han', 'Cantonese', 'Mandarin'] },
  { id: 'indian', label: 'Indian', region: 'South Asia', subgroups: ['Tamil', 'Bengali', 'Punjabi', 'Gujarati'] },
  { id: 'japanese', label: 'Japanese', region: 'East Asia', subgroups: ['Traditional', 'Modern'] },
  { id: 'korean', label: 'Korean', region: 'East Asia', subgroups: ['Traditional', 'Contemporary'] },
  { id: 'filipino', label: 'Filipino', region: 'Southeast Asia', subgroups: ['Tagalog', 'Cebuano', 'Ilocano'] },
  { id: 'vietnamese', label: 'Vietnamese', region: 'Southeast Asia', subgroups: ['Northern', 'Southern'] },
  { id: 'thai', label: 'Thai', region: 'Southeast Asia', subgroups: ['Central', 'Northern', 'Southern'] },
  
  // Middle Eastern
  { id: 'arab', label: 'Arab', region: 'Middle East', subgroups: ['Lebanese', 'Egyptian', 'Saudi', 'Palestinian'] },
  { id: 'persian', label: 'Persian/Iranian', region: 'Middle East', subgroups: ['Traditional', 'Modern'] },
  { id: 'turkish', label: 'Turkish', region: 'Middle East/Europe', subgroups: ['Anatolian', 'Ottoman'] },
  
  // Latino/Hispanic
  { id: 'mexican', label: 'Mexican', region: 'North America', subgroups: ['Northern', 'Central', 'Southern'] },
  { id: 'puerto_rican', label: 'Puerto Rican', region: 'Caribbean', subgroups: ['Traditional', 'Contemporary'] },
  { id: 'colombian', label: 'Colombian', region: 'South America', subgroups: ['Coastal', 'Andean'] },
  { id: 'brazilian', label: 'Brazilian', region: 'South America', subgroups: ['Afro-Brazilian', 'European-Brazilian'] },
  
  // European
  { id: 'italian', label: 'Italian', region: 'Southern Europe', subgroups: ['Northern', 'Southern', 'Sicilian'] },
  { id: 'irish', label: 'Irish', region: 'Western Europe', subgroups: ['Traditional', 'Modern'] },
  { id: 'german', label: 'German', region: 'Central Europe', subgroups: ['Bavarian', 'Prussian'] },
  { id: 'scandinavian', label: 'Scandinavian', region: 'Northern Europe', subgroups: ['Norwegian', 'Swedish', 'Danish'] },
  
  // Indigenous
  { id: 'native_american', label: 'Native American', region: 'Americas', subgroups: ['Plains', 'Woodland', 'Southwest'] },
  { id: 'aboriginal_australian', label: 'Aboriginal Australian', region: 'Oceania', subgroups: ['Traditional', 'Contemporary'] },
  { id: 'maori', label: 'Māori', region: 'Oceania', subgroups: ['Traditional', 'Contemporary'] },
];

export const ROLE_REPRESENTATIONS = [
  // Family Roles
  { id: 'loving_mother', label: 'Loving Mother', description: 'Warm, nurturing, protective' },
  { id: 'wise_father', label: 'Wise Father', description: 'Strong, guiding, supportive' },
  { id: 'caring_grandmother', label: 'Caring Grandmother', description: 'Gentle, wise, storytelling' },
  { id: 'respected_grandfather', label: 'Respected Grandfather', description: 'Dignified, experienced, patient' },
  
  // Cultural Roles
  { id: 'community_elder', label: 'Community Elder', description: 'Respected, wise, traditional' },
  { id: 'spiritual_guide', label: 'Spiritual Guide', description: 'Peaceful, enlightened, comforting' },
  { id: 'cultural_keeper', label: 'Cultural Keeper', description: 'Traditional, knowledgeable, proud' },
  { id: 'family_matriarch', label: 'Family Matriarch', description: 'Strong, organizing, protective' },
  { id: 'family_patriarch', label: 'Family Patriarch', description: 'Authoritative, caring, responsible' },
  
  // Professional Roles
  { id: 'successful_professional', label: 'Successful Professional', description: 'Confident, accomplished, polished' },
  { id: 'creative_artist', label: 'Creative Artist', description: 'Expressive, passionate, inspiring' },
  { id: 'community_leader', label: 'Community Leader', description: 'Charismatic, responsible, inspiring' },
  { id: 'educator_mentor', label: 'Educator/Mentor', description: 'Patient, knowledgeable, encouraging' },
  
  // Personal Qualities
  { id: 'gentle_soul', label: 'Gentle Soul', description: 'Soft-spoken, kind, peaceful' },
  { id: 'strong_warrior', label: 'Strong Warrior', description: 'Resilient, brave, determined' },
  { id: 'joyful_spirit', label: 'Joyful Spirit', description: 'Happy, optimistic, energetic' },
  { id: 'wise_sage', label: 'Wise Sage', description: 'Thoughtful, philosophical, calm' },
];

export const VISUAL_STYLES = [
  // Traditional Styles
  { id: 'traditional_formal', label: 'Traditional Formal', description: 'Classic, dignified, respectful' },
  { id: 'cultural_traditional', label: 'Cultural Traditional', description: 'Heritage clothing, cultural symbols' },
  { id: 'religious_modest', label: 'Religious/Modest', description: 'Respectful, covered, spiritual' },
  
  // Contemporary Styles
  { id: 'modern_professional', label: 'Modern Professional', description: 'Business attire, polished, contemporary' },
  { id: 'casual_comfortable', label: 'Casual Comfortable', description: 'Relaxed, approachable, everyday' },
  { id: 'elegant_sophisticated', label: 'Elegant Sophisticated', description: 'Refined, graceful, upscale' },
  
  // Cultural Specific
  { id: 'african_inspired', label: 'African Inspired', description: 'Kente, dashiki, traditional patterns' },
  { id: 'asian_traditional', label: 'Asian Traditional', description: 'Kimono, hanbok, qipao, sari' },
  { id: 'latin_vibrant', label: 'Latin Vibrant', description: 'Colorful, festive, cultural' },
  { id: 'middle_eastern_elegant', label: 'Middle Eastern Elegant', description: 'Flowing, modest, beautiful' },
];

export const HAIRSTYLE_OPTIONS = [
  // Natural African Styles
  { id: 'natural_afro', label: 'Natural Afro', cultural: ['african', 'african_american'] },
  { id: 'braids_traditional', label: 'Traditional Braids', cultural: ['african', 'african_american'] },
  { id: 'locs_dreadlocks', label: 'Locs/Dreadlocks', cultural: ['african', 'african_american', 'caribbean'] },
  { id: 'cornrows', label: 'Cornrows', cultural: ['african', 'african_american'] },
  { id: 'bantu_knots', label: 'Bantu Knots', cultural: ['african'] },
  { id: 'head_wrap', label: 'Head Wrap/Gele', cultural: ['african', 'african_american'] },
  
  // Asian Styles
  { id: 'traditional_bun', label: 'Traditional Bun', cultural: ['chinese', 'japanese', 'korean'] },
  { id: 'long_straight', label: 'Long Straight', cultural: ['asian'] },
  { id: 'modern_asian_cut', label: 'Modern Asian Cut', cultural: ['asian'] },
  
  // General Styles
  { id: 'short_professional', label: 'Short Professional', cultural: ['universal'] },
  { id: 'medium_layered', label: 'Medium Layered', cultural: ['universal'] },
  { id: 'long_curly', label: 'Long Curly', cultural: ['universal'] },
  { id: 'pixie_cut', label: 'Pixie Cut', cultural: ['universal'] },
  { id: 'bob_cut', label: 'Bob Cut', cultural: ['universal'] },
  
  // Cultural/Religious
  { id: 'hijab_modest', label: 'Hijab/Modest Covering', cultural: ['muslim', 'middle_eastern'] },
  { id: 'turban_sikh', label: 'Turban', cultural: ['sikh', 'indian'] },
  { id: 'kippah_orthodox', label: 'With Kippah', cultural: ['jewish'] },
];

// Mock data for testing without API key
const MOCK_REPLICAS = [
  {
    replica_id: 'rep_123456',
    name: 'Nigerian Heritage Avatar',
    status: 'ready',
    created_at: new Date().toISOString(),
    thumbnail_url: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=300',
    preview_video_url: 'https://example.com/preview.mp4',
    identity_profile: {
      cultural_identity: 'Nigerian',
      representation_style: 'Family Elder',
      clothing_style: 'Traditional Formal',
      hairstyle: 'Natural'
    }
  },
  {
    replica_id: 'rep_234567',
    name: 'Professional Avatar',
    status: 'ready',
    created_at: new Date().toISOString(),
    thumbnail_url: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=300',
    preview_video_url: 'https://example.com/preview2.mp4',
    identity_profile: {
      cultural_identity: 'African American',
      representation_style: 'Successful Professional',
      clothing_style: 'Modern Professional',
      hairstyle: 'Short Professional'
    }
  },
  {
    replica_id: 'rep_345678',
    name: 'Cultural Heritage Avatar',
    status: 'processing',
    created_at: new Date().toISOString(),
    identity_profile: {
      cultural_identity: 'Indian',
      representation_style: 'Family Patriarch',
      clothing_style: 'Cultural Traditional',
      hairstyle: 'Traditional'
    }
  }
];

const MOCK_VIDEOS = [
  {
    video_id: 'vid_123456',
    replica_id: 'rep_123456',
    video_name: 'Heritage Message - Family Home',
    script: 'Hello my dear family, this is an important message about our family home...',
    status: 'completed',
    download_url: 'https://example.com/video1.mp4',
    stream_url: 'https://example.com/stream1.mp4',
    created_at: new Date().toISOString()
  },
  {
    video_id: 'vid_234567',
    replica_id: 'rep_123456',
    video_name: 'Heritage Message - Investment Account',
    script: 'This message is about the investment account I have set up for you...',
    status: 'completed',
    download_url: 'https://example.com/video2.mp4',
    stream_url: 'https://example.com/stream2.mp4',
    created_at: new Date().toISOString()
  }
];

class TavusService {
  private apiKey: string;
  private headers: Record<string, string>;
  private mockReplicas: TavusReplica[] = [...MOCK_REPLICAS];
  private mockVideos: TavusVideo[] = [...MOCK_VIDEOS];

  constructor() {
    this.apiKey = import.meta.env.VITE_TAVUS_API_KEY || '';
    this.headers = {
      'x-api-key': this.apiKey,
      'Content-Type': 'application/json',
    };
  }

  // Check if Tavus is configured
  isConfigured(): boolean {
    return !!this.apiKey;
  }

  // Get all replicas for the user
  async getReplicas(): Promise<TavusReplica[]> {
    try {
      if (!this.isConfigured()) {
        return this.mockReplicas;
      }

      const response = await axios.get(`${TAVUS_API_BASE}/replicas`, {
        headers: this.headers,
      });
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching replicas:', error);
      // Fallback to mock data if API call fails
      return this.mockReplicas;
    }
  }

  // Get a specific replica
  async getReplica(replicaId: string): Promise<TavusReplica> {
    try {
      if (!this.isConfigured()) {
        const mockReplica = this.mockReplicas.find(r => r.replica_id === replicaId);
        if (!mockReplica) throw new Error('Replica not found');
        return mockReplica;
      }

      const response = await axios.get(`${TAVUS_API_BASE}/replicas/${replicaId}`, {
        headers: this.headers,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching replica:', error);
      
      // Fallback to mock data if API call fails
      const mockReplica = this.mockReplicas.find(r => r.replica_id === replicaId);
      if (mockReplica) return mockReplica;
      
      throw new Error('Failed to fetch replica');
    }
  }

  // Create a new replica with identity preferences
  async createReplica(request: CreateReplicaRequest): Promise<{ replica_id: string }> {
    try {
      if (!this.isConfigured()) {
        // Create a mock replica
        const newReplicaId = `rep_${Date.now()}`;
        const newReplica: TavusReplica = {
          replica_id: newReplicaId,
          name: request.replica_name,
          status: 'processing',
          created_at: new Date().toISOString(),
          identity_profile: request.identity_profile
        };
        
        this.mockReplicas.push(newReplica);
        
        // Simulate processing time and then mark as ready
        setTimeout(() => {
          const index = this.mockReplicas.findIndex(r => r.replica_id === newReplicaId);
          if (index !== -1) {
            this.mockReplicas[index].status = 'ready';
            this.mockReplicas[index].thumbnail_url = 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=300';
          }
        }, 5000);
        
        return { replica_id: newReplicaId };
      }

      const formData = new FormData();
      formData.append('replica_name', request.replica_name);
      
      if (request.callback_url) {
        formData.append('callback_url', request.callback_url);
      }
      
      if (request.train_video_file) {
        formData.append('train_video_file', request.train_video_file);
      } else if (request.train_video_url) {
        formData.append('train_video_url', request.train_video_url);
      }

      if (request.photo_reference) {
        formData.append('photo_reference', request.photo_reference);
      }

      // Add identity and representation preferences
      if (request.identity_profile) {
        formData.append('identity_profile', JSON.stringify(request.identity_profile));
      }

      if (request.representation_preferences) {
        formData.append('representation_preferences', JSON.stringify(request.representation_preferences));
      }

      const response = await axios.post(`${TAVUS_API_BASE}/replicas`, formData, {
        headers: {
          'x-api-key': this.apiKey,
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Error creating replica:', error);
      throw new Error('Failed to create replica');
    }
  }

  // Delete a replica
  async deleteReplica(replicaId: string): Promise<void> {
    try {
      if (!this.isConfigured()) {
        // Remove from mock data
        this.mockReplicas = this.mockReplicas.filter(r => r.replica_id !== replicaId);
        return;
      }

      await axios.delete(`${TAVUS_API_BASE}/replicas/${replicaId}`, {
        headers: this.headers,
      });
    } catch (error) {
      console.error('Error deleting replica:', error);
      throw new Error('Failed to delete replica');
    }
  }

  // Create a video with cultural context
  async createVideo(request: CreateVideoRequest): Promise<{ video_id: string }> {
    try {
      if (!this.isConfigured()) {
        // Create a mock video
        const newVideoId = `vid_${Date.now()}`;
        const newVideo: TavusVideo = {
          video_id: newVideoId,
          replica_id: request.replica_id,
          video_name: request.video_name || 'Untitled Video',
          script: request.script,
          status: 'generating',
          created_at: new Date().toISOString()
        };
        
        this.mockVideos.push(newVideo);
        
        // Simulate processing time and then mark as completed
        setTimeout(() => {
          const index = this.mockVideos.findIndex(v => v.video_id === newVideoId);
          if (index !== -1) {
            this.mockVideos[index].status = 'completed';
            this.mockVideos[index].download_url = 'https://example.com/video.mp4';
            this.mockVideos[index].stream_url = 'https://example.com/stream.mp4';
          }
        }, 3000);
        
        return { video_id: newVideoId };
      }

      const response = await axios.post(`${TAVUS_API_BASE}/videos`, request, {
        headers: this.headers,
      });
      return response.data;
    } catch (error) {
      console.error('Error creating video:', error);
      throw new Error('Failed to create video');
    }
  }

  // Get video status and details
  async getVideo(videoId: string): Promise<TavusVideo> {
    try {
      if (!this.isConfigured()) {
        const mockVideo = this.mockVideos.find(v => v.video_id === videoId);
        if (!mockVideo) throw new Error('Video not found');
        return mockVideo;
      }

      const response = await axios.get(`${TAVUS_API_BASE}/videos/${videoId}`, {
        headers: this.headers,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching video:', error);
      
      // Fallback to mock data if API call fails
      const mockVideo = this.mockVideos.find(v => v.video_id === videoId);
      if (mockVideo) return mockVideo;
      
      throw new Error('Failed to fetch video');
    }
  }

  // Get all videos
  async getVideos(): Promise<TavusVideo[]> {
    try {
      if (!this.isConfigured()) {
        return this.mockVideos;
      }

      const response = await axios.get(`${TAVUS_API_BASE}/videos`, {
        headers: this.headers,
      });
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching videos:', error);
      // Fallback to mock data if API call fails
      return this.mockVideos;
    }
  }

  // Delete a video
  async deleteVideo(videoId: string): Promise<void> {
    try {
      if (!this.isConfigured()) {
        // Remove from mock data
        this.mockVideos = this.mockVideos.filter(v => v.video_id !== videoId);
        return;
      }

      await axios.delete(`${TAVUS_API_BASE}/videos/${videoId}`, {
        headers: this.headers,
      });
    } catch (error) {
      console.error('Error deleting video:', error);
      throw new Error('Failed to delete video');
    }
  }

  // Generate culturally-aware inheritance message
  async generateCulturalInheritanceMessage(
    replicaId: string,
    beneficiaryName: string,
    assetName: string,
    personalMessage: string,
    relationship: string = 'loved one',
    culturalContext?: {
      identity: string;
      traditions?: string[];
      values?: string[];
      language_elements?: string[];
    }
  ): Promise<{ video_id: string }> {
    const script = this.createCulturalInheritanceScript(
      beneficiaryName,
      assetName,
      personalMessage,
      relationship,
      culturalContext
    );

    return this.createVideo({
      replica_id: replicaId,
      script,
      video_name: `Cultural Heritage Message for ${beneficiaryName} - ${assetName}`,
      properties: {
        voice_settings: {
          stability: 0.7,
          similarity_boost: 0.8,
          style: 0.2,
        },
        max_video_length: 300,
        identity_enhancement: {
          cultural_context: culturalContext?.identity,
          emotional_tone: 'warm_familial',
          representation_style: 'authentic_cultural'
        }
      },
    });
  }

  // Create culturally-aware inheritance script
  private createCulturalInheritanceScript(
    beneficiaryName: string,
    assetName: string,
    personalMessage: string,
    relationship: string,
    culturalContext?: {
      identity: string;
      traditions?: string[];
      values?: string[];
      language_elements?: string[];
    }
  ): string {
    let greeting = `Hello ${beneficiaryName}`;
    let culturalElements = '';
    let blessings = 'With all my love';

    // Add cultural greetings and elements
    if (culturalContext) {
      switch (culturalContext.identity) {
        case 'igbo':
          greeting = `Ndewo ${beneficiaryName}`;
          culturalElements = 'As our Igbo ancestors taught us, family wealth is meant to be shared and preserved for future generations. ';
          blessings = 'Chineke gozie gi (May God bless you)';
          break;
        case 'yoruba':
          greeting = `Bawo ${beneficiaryName}`;
          culturalElements = 'In our Yoruba tradition, we believe that what we leave behind speaks to our legacy. ';
          blessings = 'Olorun a bukun e (May God bless you)';
          break;
        case 'chinese':
          culturalElements = 'Following our family traditions of honoring our ancestors and caring for future generations, ';
          blessings = 'May you prosper and honor our family name';
          break;
        case 'mexican':
          greeting = `Hola mi querido/a ${beneficiaryName}`;
          culturalElements = 'Como nos enseñaron nuestros antepasados, la familia es lo más importante. ';
          blessings = 'Con todo mi amor y bendiciones';
          break;
        case 'arab':
          greeting = `As-salamu alaykum ${beneficiaryName}`;
          culturalElements = 'In our tradition, we believe that what we leave for our children is a trust from Allah. ';
          blessings = 'Barakallahu feeki/feek (May Allah bless you)';
          break;
      }
    }

    return `${greeting},

If you're watching this message, it means I'm no longer with you, but I wanted to make sure you received this important information about ${assetName}.

${culturalElements}${personalMessage}

This asset represents not just financial value, but our family's journey, our struggles, and our hopes for the future. I want you to know that I've carefully planned for it to be passed on to you, carrying with it all the love and wisdom of our ancestors.

Please follow the instructions I've provided, and don't hesitate to reach out to our family attorney or financial advisor if you need any help. Remember to honor our traditions while building your own path forward.

You mean the world to me, ${beneficiaryName}, and I hope this helps secure your future while keeping our family's values alive.

${blessings},
Your ${relationship}`;
  }

  // Poll for video completion
  async waitForVideoCompletion(
    videoId: string,
    maxWaitTime: number = 300000,
    pollInterval: number = 2000
  ): Promise<TavusVideo> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
      const video = await this.getVideo(videoId);
      
      if (video.status === 'completed') {
        return video;
      } else if (video.status === 'failed') {
        throw new Error('Video generation failed');
      }
      
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }
    
    throw new Error('Video generation timed out');
  }
}

// Create singleton instance
export const tavusService = new TavusService();

// Enhanced Heritage Vault utilities with cultural awareness
export const HeritageVaultTavus = {
  // Check if user has any replicas set up
  async hasReplicas(): Promise<boolean> {
    try {
      const replicas = await tavusService.getReplicas();
      return replicas.length > 0;
    } catch {
      return false;
    }
  },

  // Get the primary replica (first ready one)
  async getPrimaryReplica(): Promise<TavusReplica | null> {
    try {
      const replicas = await tavusService.getReplicas();
      return replicas.find(r => r.status === 'ready') || null;
    } catch {
      return null;
    }
  },

  // Create culturally-aware asset messages
  async createCulturalAssetMessage(
    assetName: string,
    beneficiaryName: string,
    personalMessage: string,
    relationship: string = 'family member',
    culturalContext?: {
      identity: string;
      traditions?: string[];
      values?: string[];
    }
  ): Promise<string | null> {
    try {
      const replica = await this.getPrimaryReplica();
      if (!replica) return null;

      const result = await tavusService.generateCulturalInheritanceMessage(
        replica.replica_id,
        beneficiaryName,
        assetName,
        personalMessage,
        relationship,
        culturalContext
      );

      return result.video_id;
    } catch (error) {
      console.error('Error creating cultural asset message:', error);
      return null;
    }
  },

  // Generate multiple culturally-aware messages
  async createMulticulturalBeneficiaryMessages(
    assetName: string,
    beneficiaries: Array<{
      name: string;
      relationship: string;
      personalMessage: string;
      culturalBackground?: string;
      preferredLanguage?: string;
    }>
  ): Promise<Array<{ beneficiary: string; videoId: string | null }>> {
    const results = [];

    for (const beneficiary of beneficiaries) {
      const culturalContext = beneficiary.culturalBackground ? {
        identity: beneficiary.culturalBackground,
        traditions: [],
        values: []
      } : undefined;

      const videoId = await this.createCulturalAssetMessage(
        assetName,
        beneficiary.name,
        beneficiary.personalMessage,
        beneficiary.relationship,
        culturalContext
      );

      results.push({
        beneficiary: beneficiary.name,
        videoId,
      });

      // Add delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return results;
  },

  // Get cultural recommendations based on identity
  getCulturalRecommendations(culturalIdentity: string) {
    const identity = CULTURAL_IDENTITIES.find(c => c.id === culturalIdentity);
    const relevantHairstyles = HAIRSTYLE_OPTIONS.filter(h => 
      h.cultural.includes(culturalIdentity) || h.cultural.includes('universal')
    );
    const relevantStyles = VISUAL_STYLES.filter(s => 
      s.id.includes(culturalIdentity) || 
      s.id.includes('traditional') || 
      s.id.includes('cultural')
    );

    return {
      identity,
      recommendedHairstyles: relevantHairstyles,
      recommendedStyles: relevantStyles,
      culturalElements: identity?.subgroups || []
    };
  }
};