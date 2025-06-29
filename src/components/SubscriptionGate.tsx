import React, { useState } from 'react';
import { Crown, Lock, Zap } from 'lucide-react';
import { UserSubscription } from '../services/revenuecat';
import SubscriptionManager from './SubscriptionManager';

interface SubscriptionGateProps {
  userSubscription: UserSubscription;
  feature: 'assets' | 'contacts' | 'ai_features' | 'unlimited_storage';
  currentCount?: number;
  children: React.ReactNode;
  onSubscriptionChange?: (subscription: UserSubscription) => void;
}

const SubscriptionGate: React.FC<SubscriptionGateProps> = ({
  userSubscription,
  feature,
  currentCount = 0,
  children,
  onSubscriptionChange
}) => {
  const [showUpgrade, setShowUpgrade] = useState(false);

  const getFeatureLimits = () => {
    switch (feature) {
      case 'assets':
        return {
          freeLimit: 3,
          message: 'Free plan limited to 3 assets',
          upgradeMessage: 'Upgrade to Pro for unlimited asset storage'
        };
      case 'contacts':
        return {
          freeLimit: 1,
          message: 'Free plan limited to 1 next of kin',
          upgradeMessage: 'Upgrade to Pro for multiple beneficiaries'
        };
      case 'ai_features':
        return {
          freeLimit: 0,
          message: 'AI features not available on free plan',
          upgradeMessage: 'Upgrade to Pro for voice messages and avatar creation'
        };
      case 'unlimited_storage':
        return {
          freeLimit: 0,
          message: 'Unlimited storage not available on free plan',
          upgradeMessage: 'Upgrade to Pro for unlimited document storage'
        };
      default:
        return {
          freeLimit: 0,
          message: 'Feature not available on free plan',
          upgradeMessage: 'Upgrade to Pro to access this feature'
        };
    }
  };

  const checkAccess = () => {
    // Pro and Forever plans have access to everything
    if (userSubscription.plan === 'pro' || userSubscription.plan === 'forever') {
      return { hasAccess: true };
    }

    const limits = getFeatureLimits();

    // For AI features, free plan has no access
    if (feature === 'ai_features' || feature === 'unlimited_storage') {
      return {
        hasAccess: false,
        reason: limits.message,
        upgradeMessage: limits.upgradeMessage
      };
    }

    // For countable features (assets, contacts), check against limits
    if (currentCount >= limits.freeLimit) {
      return {
        hasAccess: false,
        reason: limits.message,
        upgradeMessage: limits.upgradeMessage
      };
    }

    return { hasAccess: true };
  };

  const access = checkAccess();

  if (access.hasAccess) {
    return <>{children}</>;
  }

  return (
    <>
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6 text-center">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-purple-600" />
        </div>
        
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          {access.reason}
        </h3>
        
        <p className="text-slate-700 mb-6">
          {access.upgradeMessage}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => setShowUpgrade(true)}
            className="flex items-center justify-center space-x-2 bg-purple-700 text-white px-6 py-3 rounded-lg hover:bg-purple-800 transition-colors font-semibold"
          >
            <Crown className="w-5 h-5" />
            <span>Upgrade to Pro</span>
          </button>
          
          <button
            onClick={() => setShowUpgrade(true)}
            className="flex items-center justify-center space-x-2 border-2 border-purple-700 text-purple-800 px-6 py-3 rounded-lg hover:border-purple-800 hover:bg-purple-50 transition-colors font-semibold"
          >
            <Zap className="w-5 h-5" />
            <span>View Plans</span>
          </button>
        </div>

        <div className="mt-4 text-xs text-slate-600">
          <p>✓ 7-day free trial • ✓ Cancel anytime • ✓ No setup fees</p>
        </div>
      </div>

      {showUpgrade && (
        <SubscriptionManager
          onClose={() => setShowUpgrade(false)}
          onSubscriptionChange={onSubscriptionChange}
        />
      )}
    </>
  );
};

export default SubscriptionGate;