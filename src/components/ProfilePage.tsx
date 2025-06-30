import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, MapPin, Shield, CreditCard, Edit, CheckCircle, AlertCircle, LogOut } from 'lucide-react';
import { User as UserType } from '../services/supabase';
import { supabaseAuth } from '../services/supabase';
import { revenueCatService, formatSubscriptionStatus, UserSubscription } from '../services/revenuecat';
import SubscriptionManager from './SubscriptionManager';

interface ProfilePageProps {
  userProfile: UserType | null;
  onSignOut: () => void;
  onUpdateProfile: (updatedProfile: UserType) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ userProfile, onSignOut, onUpdateProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UserType>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showSubscriptionManager, setShowSubscriptionManager] = useState(false);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);

  useEffect(() => {
    if (userProfile) {
      setFormData({
        full_name: userProfile.full_name,
        phone: userProfile.phone || '',
        date_of_birth: userProfile.date_of_birth || '',
        address: userProfile.address || '',
        emergency_contact_name: userProfile.emergency_contact_name || '',
        emergency_contact_phone: userProfile.emergency_contact_phone || '',
        emergency_contact_relationship: userProfile.emergency_contact_relationship || '',
      });
    }
    
    loadSubscriptionData();
  }, [userProfile]);

  const loadSubscriptionData = async () => {
    try {
      if (revenueCatService.isConfigured()) {
        await revenueCatService.initialize();
        const userSubscription = await revenueCatService.getUserSubscription();
        setSubscription(userSubscription);
      }
    } catch (error) {
      console.error('Error loading subscription data:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSaveProfile = async () => {
    if (!userProfile) return;
    
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      const result = await supabaseAuth.updateUserProfile(userProfile.id, formData);
      
      if (result.success) {
        setSuccess('Profile updated successfully!');
        onUpdateProfile({ ...userProfile, ...formData });
        setIsEditing(false);
      } else {
        setError(result.error || 'Failed to update profile');
      }
    } catch (error: any) {
      setError(error.message || 'An unexpected error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabaseAuth.signOut();
      onSignOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSubscriptionChange = (updatedSubscription: UserSubscription) => {
    setSubscription(updatedSubscription);
  };

  if (!userProfile) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="text-center">
          <User className="w-8 h-8 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-600">User profile not available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">My Profile</h2>
          <p className="text-slate-600 mt-1">Manage your account information and preferences</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowSubscriptionManager(true)}
            className="flex items-center space-x-2 bg-purple-700 text-white px-4 py-2 rounded-lg hover:bg-purple-800 transition-colors"
          >
            <CreditCard className="w-4 h-4" />
            <span>Manage Subscription</span>
          </button>
          <button
            onClick={handleSignOut}
            className="flex items-center space-x-2 bg-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-300 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Subscription Banner */}
      <div className={`p-4 rounded-lg ${
        subscription?.plan === 'forever' 
          ? 'bg-purple-50 border border-purple-200' 
          : subscription?.plan === 'pro'
          ? 'bg-blue-50 border border-blue-200'
          : 'bg-green-50 border border-green-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${
              subscription?.plan === 'forever' 
                ? 'bg-purple-100' 
                : subscription?.plan === 'pro'
                ? 'bg-blue-100'
                : 'bg-green-100'
            }`}>
              <Shield className={`w-5 h-5 ${
                subscription?.plan === 'forever' 
                  ? 'text-purple-600' 
                  : subscription?.plan === 'pro'
                  ? 'text-blue-600'
                  : 'text-green-600'
              }`} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">
                {subscription?.plan === 'forever' 
                  ? 'Lifetime Access' 
                  : subscription?.plan === 'pro'
                  ? 'Pro Subscription'
                  : 'Free Plan'}
              </h3>
              <p className="text-sm text-slate-600">
                {subscription ? formatSubscriptionStatus(subscription) : 'Subscription status unavailable'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowSubscriptionManager(true)}
            className={`px-4 py-2 rounded-lg text-sm ${
              subscription?.plan === 'free'
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {subscription?.plan === 'free' ? 'Upgrade Plan' : 'Manage Plan'}
          </button>
        </div>
      </div>

      {/* Profile Information */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900">Personal Information</h3>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center space-x-2 px-3 py-1 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm"
          >
            <Edit className="w-4 h-4" />
            <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <p className="text-green-800 text-sm">{success}</p>
          </div>
        )}

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <User className="w-4 h-4 text-slate-400" />
                <label className="text-sm font-medium text-slate-700">Full Name</label>
              </div>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.full_name || ''}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              ) : (
                <p className="text-slate-900">{userProfile.full_name}</p>
              )}
            </div>

            <div>
              <div className="flex items-center space-x-3 mb-2">
                <Mail className="w-4 h-4 text-slate-400" />
                <label className="text-sm font-medium text-slate-700">Email Address</label>
              </div>
              <p className="text-slate-900">{userProfile.email}</p>
              <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <div className="flex items-center space-x-3 mb-2">
                <Phone className="w-4 h-4 text-slate-400" />
                <label className="text-sm font-medium text-slate-700">Phone Number</label>
              </div>
              {isEditing ? (
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              ) : (
                <p className="text-slate-900">{userProfile.phone || 'Not provided'}</p>
              )}
            </div>

            <div>
              <div className="flex items-center space-x-3 mb-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <label className="text-sm font-medium text-slate-700">Date of Birth</label>
              </div>
              {isEditing ? (
                <input
                  type="date"
                  value={formData.date_of_birth || ''}
                  onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              ) : (
                <p className="text-slate-900">{userProfile.date_of_birth || 'Not provided'}</p>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-3 mb-2">
              <MapPin className="w-4 h-4 text-slate-400" />
              <label className="text-sm font-medium text-slate-700">Address</label>
            </div>
            {isEditing ? (
              <textarea
                value={formData.address || ''}
                onChange={(e) => handleInputChange('address', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            ) : (
              <p className="text-slate-900">{userProfile.address || 'Not provided'}</p>
            )}
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Emergency Contact</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <User className="w-4 h-4 text-slate-400" />
              <label className="text-sm font-medium text-slate-700">Contact Name</label>
            </div>
            {isEditing ? (
              <input
                type="text"
                value={formData.emergency_contact_name || ''}
                onChange={(e) => handleInputChange('emergency_contact_name', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            ) : (
              <p className="text-slate-900">{userProfile.emergency_contact_name || 'Not provided'}</p>
            )}
          </div>

          <div>
            <div className="flex items-center space-x-3 mb-2">
              <Phone className="w-4 h-4 text-slate-400" />
              <label className="text-sm font-medium text-slate-700">Contact Phone</label>
            </div>
            {isEditing ? (
              <input
                type="tel"
                value={formData.emergency_contact_phone || ''}
                onChange={(e) => handleInputChange('emergency_contact_phone', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            ) : (
              <p className="text-slate-900">{userProfile.emergency_contact_phone || 'Not provided'}</p>
            )}
          </div>

          <div>
            <div className="flex items-center space-x-3 mb-2">
              <User className="w-4 h-4 text-slate-400" />
              <label className="text-sm font-medium text-slate-700">Relationship</label>
            </div>
            {isEditing ? (
              <input
                type="text"
                value={formData.emergency_contact_relationship || ''}
                onChange={(e) => handleInputChange('emergency_contact_relationship', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            ) : (
              <p className="text-slate-900">{userProfile.emergency_contact_relationship || 'Not provided'}</p>
            )}
          </div>
        </div>
      </div>

      {/* Account Information */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Account Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <Shield className="w-4 h-4 text-slate-400" />
              <label className="text-sm font-medium text-slate-700">Account Status</label>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 text-xs rounded-full ${
                userProfile.account_status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : userProfile.account_status === 'inactive'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {userProfile.account_status}
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-3 mb-2">
              <CreditCard className="w-4 h-4 text-slate-400" />
              <label className="text-sm font-medium text-slate-700">Subscription Plan</label>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 text-xs rounded-full ${
                userProfile.subscription_plan === 'forever' 
                  ? 'bg-purple-100 text-purple-800' 
                  : userProfile.subscription_plan === 'pro'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-green-100 text-green-800'
              }`}>
                {userProfile.subscription_plan}
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-3 mb-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <label className="text-sm font-medium text-slate-700">Account Created</label>
            </div>
            <p className="text-slate-900">
              {new Date(userProfile.created_at).toLocaleDateString()}
            </p>
          </div>

          <div>
            <div className="flex items-center space-x-3 mb-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <label className="text-sm font-medium text-slate-700">Last Login</label>
            </div>
            <p className="text-slate-900">
              {userProfile.last_login ? new Date(userProfile.last_login).toLocaleDateString() : 'Never'}
            </p>
          </div>
        </div>
      </div>

      {isEditing && (
        <div className="flex justify-end">
          <button
            onClick={() => setIsEditing(false)}
            className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors mr-3"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveProfile}
            disabled={isSaving}
            className="px-4 py-2 bg-purple-700 text-white rounded-lg hover:bg-purple-800 disabled:bg-slate-400 transition-colors"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}

      {showSubscriptionManager && (
        <SubscriptionManager
          onClose={() => setShowSubscriptionManager(false)}
          onSubscriptionChange={handleSubscriptionChange}
        />
      )}
    </div>
  );
};

export default ProfilePage;