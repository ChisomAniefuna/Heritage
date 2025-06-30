import React, { useState, useRef, useEffect } from 'react';
import { Video, Upload, Trash2, Save, Play, Pause, User, Camera, Loader, CheckCircle, AlertCircle, Palette } from 'lucide-react';
import { tavusService, TavusReplica, TavusVideo, HeritageVaultTavus, IdentityProfile, RepresentationPreferences } from '../services/tavus';
import AvatarIdentitySelector from './AvatarIdentitySelector';

interface AvatarMessageRecorderProps {
  onSave: (avatarMessage: {
    videoId: string;
    script: string;
    replicaId: string;
    beneficiary?: string;
    assetName?: string;
  }) => void;
  onClose: () => void;
  beneficiaryName?: string;
  assetName?: string;
  title?: string;
}

const AvatarMessageRecorder: React.FC<AvatarMessageRecorderProps> = ({
  onSave,
  onClose,
  beneficiaryName,
  assetName,
  title = 'Create Avatar Message'
}) => {
  const [replicas, setReplicas] = useState<TavusReplica[]>([]);
  const [selectedReplica, setSelectedReplica] = useState<string>('');
  const [script, setScript] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState<TavusVideo | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showReplicaSetup, setShowReplicaSetup] = useState(false);
  const [showIdentitySelector, setShowIdentitySelector] = useState(false);
  const [uploadingReplica, setUploadingReplica] = useState(false);
  const [replicaName, setReplicaName] = useState('');
  const [trainingVideo, setTrainingVideo] = useState<File | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadReplicas();
  }, []);

  useEffect(() => {
    if (beneficiaryName && assetName) {
      generateDefaultScript();
    }
  }, [beneficiaryName, assetName]);

  const loadReplicas = async () => {
    try {
      const replicaList = await tavusService.getReplicas();
      setReplicas(replicaList);
      
      if (replicaList.length > 0) {
        const readyReplica = replicaList.find(r => r.status === 'ready');
        if (readyReplica) {
          setSelectedReplica(readyReplica.replica_id);
        }
      } else {
        setShowIdentitySelector(true);
      }
    } catch (error) {
      console.error('Error loading replicas:', error);
    }
  };

  const generateDefaultScript = () => {
    if (!beneficiaryName || !assetName) return;

    const defaultScript = `Hello ${beneficiaryName},

If you're watching this message, it means I'm no longer with you, but I wanted to make sure you received this important information about ${assetName}.

This asset holds special significance, and I've carefully planned for it to be passed on to you. Please follow the instructions I've provided in your Heritage Vault, and don't hesitate to reach out to our family attorney or financial advisor if you need any help.

You mean the world to me, ${beneficiaryName}, and I hope this helps secure your future. Take care of yourself and remember that I love you.

With all my love.`;

    setScript(defaultScript);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setTrainingVideo(file);
    }
  };

  const handleIdentitySelection = async (
    identityProfile: IdentityProfile, 
    preferences: RepresentationPreferences, 
    photoFile?: File
  ) => {
    setUploadingReplica(true);
    try {
      let replicaRequest;
      
      if (preferences.creation_method === 'photo_generation' && photoFile) {
        replicaRequest = {
          replica_name: `${identityProfile.cultural_identity} Avatar`,
          photo_reference: photoFile,
          identity_profile: identityProfile,
          representation_preferences: preferences
        };
      } else if (preferences.creation_method === 'video_training' && trainingVideo) {
        replicaRequest = {
          replica_name: `${identityProfile.cultural_identity} Heritage Avatar`,
          train_video_file: trainingVideo,
          identity_profile: identityProfile,
          representation_preferences: preferences
        };
      } else {
        // Preset selection - create with identity profile only
        replicaRequest = {
          replica_name: `${identityProfile.cultural_identity} Preset Avatar`,
          identity_profile: identityProfile,
          representation_preferences: preferences
        };
      }

      const result = await tavusService.createReplica(replicaRequest);
      
      // Reload replicas to include the new one
      await loadReplicas();
      setShowIdentitySelector(false);
      setShowReplicaSetup(false);
      
      alert('Avatar created successfully! It may take a few minutes to process.');
    } catch (error) {
      console.error('Error creating avatar:', error);
      alert('Failed to create avatar. Please try again.');
    } finally {
      setUploadingReplica(false);
    }
  };

  const createReplica = async () => {
    if (!replicaName.trim() || !trainingVideo) return;

    setUploadingReplica(true);
    try {
      const result = await tavusService.createReplica({
        replica_name: replicaName,
        train_video_file: trainingVideo,
      });

      // Reload replicas to include the new one
      await loadReplicas();
      setShowReplicaSetup(false);
      setReplicaName('');
      setTrainingVideo(null);
      
      alert('Replica created successfully! It may take a few minutes to process.');
    } catch (error) {
      console.error('Error creating replica:', error);
      alert('Failed to create replica. Please try again.');
    } finally {
      setUploadingReplica(false);
    }
  };

  const generateVideo = async () => {
    if (!selectedReplica || !script.trim()) return;

    setIsGenerating(true);
    try {
      const result = await tavusService.createVideo({
        replica_id: selectedReplica,
        script: script,
        video_name: `Heritage Message - ${assetName || 'Personal Message'}`,
        properties: {
          voice_settings: {
            stability: 0.7,
            similarity_boost: 0.8,
            style: 0.2,
          },
        },
      });

      // Poll for completion
      const completedVideo = await tavusService.waitForVideoCompletion(result.video_id);
      setGeneratedVideo(completedVideo);
    } catch (error) {
      console.error('Error generating video:', error);
      alert('Failed to generate video. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const playVideo = () => {
    if (videoRef.current && generatedVideo?.stream_url) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
  };

  const handleSave = () => {
    if (generatedVideo && selectedReplica) {
      onSave({
        videoId: generatedVideo.video_id,
        script: script,
        replicaId: selectedReplica,
        beneficiary: beneficiaryName,
        assetName: assetName,
      });
    }
  };

  const getReplicaStatusIcon = (status: string) => {
    switch (status) {
      case 'ready': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'processing': return <Loader className="w-4 h-4 text-blue-600 animate-spin" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-600" />;
      default: return <User className="w-4 h-4 text-slate-600" />;
    }
  };

  const getReplicaDisplayInfo = (replica: TavusReplica) => {
    const identity = replica.identity_profile;
    return {
      name: replica.name,
      description: identity ? 
        `${identity.cultural_identity || 'Custom'} • ${identity.representation_style || 'Personal'}` :
        'Standard Avatar',
      culturalInfo: identity?.cultural_identity || null
    };
  };

  if (!tavusService.isConfigured()) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-md w-full p-6 text-center">
          <Video className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Tavus Not Configured</h3>
          <p className="text-slate-600 mb-4">
            Using demo mode with mock avatars. In production, add your Tavus API key to your environment variables.
          </p>
          <button
            onClick={() => setShowIdentitySelector(true)}
            className="px-4 py-2 bg-purple-700 text-white rounded-lg hover:bg-purple-800 transition-colors mb-3"
          >
            Create Demo Avatar
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-xl">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
            <p className="text-slate-600 mt-1">Create a personalized video message with your culturally-aware AI avatar</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <Trash2 className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {showReplicaSetup ? (
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center space-x-3 mb-4">
                <Camera className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-slate-900">Create Your Avatar (Traditional Method)</h3>
              </div>
              
              <p className="text-slate-600 mb-4">
                Upload a short video (2-5 minutes) of yourself speaking clearly to the camera.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Avatar Name
                  </label>
                  <input
                    type="text"
                    value={replicaName}
                    onChange={(e) => setReplicaName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., My Heritage Avatar"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Training Video
                  </label>
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="video/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    {trainingVideo ? (
                      <div className="flex items-center justify-center space-x-2">
                        <Video className="w-5 h-5 text-green-600" />
                        <span className="text-sm text-slate-700">{trainingVideo.name}</span>
                        <button
                          onClick={() => setTrainingVideo(null)}
                          className="p-1 text-slate-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-sm text-slate-600 mb-2">Upload your training video</p>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Choose File
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowReplicaSetup(false)}
                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createReplica}
                    disabled={!replicaName.trim() || !trainingVideo || uploadingReplica}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-400 transition-colors flex items-center justify-center space-x-2"
                  >
                    {uploadingReplica ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        <span>Creating...</span>
                      </>
                    ) : (
                      <>
                        <Camera className="w-4 h-4" />
                        <span>Create Avatar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Avatar Selection */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-semibold text-slate-900">
                    Choose Your Avatar
                  </label>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowIdentitySelector(true)}
                      className="flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-lg hover:from-purple-200 hover:to-pink-200 transition-colors text-sm"
                    >
                      <Palette className="w-4 h-4" />
                      <span>Create Cultural Avatar</span>
                    </button>
                    <button
                      onClick={() => setShowReplicaSetup(true)}
                      className="flex items-center space-x-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Video Training</span>
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {replicas.map(replica => {
                    const displayInfo = getReplicaDisplayInfo(replica);
                    return (
                      <button
                        key={replica.replica_id}
                        onClick={() => setSelectedReplica(replica.replica_id)}
                        disabled={replica.status !== 'ready'}
                        className={`flex items-center space-x-3 p-4 border-2 rounded-lg transition-all text-left ${
                          selectedReplica === replica.replica_id
                            ? 'border-purple-500 bg-purple-50'
                            : replica.status === 'ready'
                            ? 'border-slate-200 hover:border-slate-300'
                            : 'border-slate-200 opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center overflow-hidden">
                          {replica.thumbnail_url ? (
                            <img src={replica.thumbnail_url} alt={replica.name} className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-6 h-6 text-purple-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-slate-900">{displayInfo.name}</span>
                            {getReplicaStatusIcon(replica.status)}
                          </div>
                          <p className="text-xs text-slate-600">{displayInfo.description}</p>
                          <p className="text-xs text-slate-500 capitalize">{replica.status}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {replicas.length === 0 && (
                  <div className="text-center py-8 border-2 border-dashed border-slate-300 rounded-lg">
                    <User className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No Avatars Yet</h3>
                    <p className="text-slate-600 mb-4">Create your first culturally-representative avatar</p>
                    <button
                      onClick={() => setShowIdentitySelector(true)}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors"
                    >
                      Create Cultural Avatar
                    </button>
                  </div>
                )}
              </div>

              {/* Script Input */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-3">
                  Message Script
                </label>
                <textarea
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  rows={8}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Write your heartfelt message here..."
                />
                <p className="text-xs text-slate-500 mt-2">
                  Keep your message under 2 minutes for best results. Speak naturally and from the heart.
                </p>
              </div>

              {/* Video Generation */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={generateVideo}
                  disabled={!selectedReplica || !script.trim() || isGenerating}
                  className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-slate-400 transition-colors"
                >
                  {isGenerating ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Generating Video...</span>
                    </>
                  ) : (
                    <>
                      <Video className="w-5 h-5" />
                      <span>Generate Avatar Video</span>
                    </>
                  )}
                </button>

                {generatedVideo && (
                  <button
                    onClick={playVideo}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{isPlaying ? 'Pause' : 'Preview'}</span>
                  </button>
                )}
              </div>

              {/* Video Preview */}
              {generatedVideo && (
                <div className="bg-slate-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Generated Video</h3>
                  <div className="aspect-video bg-black rounded-lg overflow-hidden">
                    <video
                      ref={videoRef}
                      src={generatedVideo.stream_url || generatedVideo.download_url}
                      onEnded={handleVideoEnded}
                      className="w-full h-full object-cover"
                      controls
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {/* Action Buttons */}
          {!showReplicaSetup && !showIdentitySelector && (
            <div className="flex space-x-3 pt-4 border-t border-slate-200">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!generatedVideo}
                className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:bg-slate-400 transition-colors flex items-center justify-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Avatar Message</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {showIdentitySelector && (
        <AvatarIdentitySelector
          onSelectionComplete={handleIdentitySelection}
          onClose={() => setShowIdentitySelector(false)}
        />
      )}
    </div>
  );
};

export default AvatarMessageRecorder;