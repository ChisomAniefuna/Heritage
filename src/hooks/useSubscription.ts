import { useState, useEffect } from 'react';
import { revenueCatService, UserSubscription } from '../services/revenuecat';

export const useSubscription = () => {
  const [subscription, setSubscription] = useState<UserSubscription>({
    isActive: false,
    productId: null,
    expirationDate: null,
    willRenew: false,
    isInGracePeriod: false,
    plan: 'free'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeSubscription();
  }, []);

  const initializeSubscription = async () => {
    try {
      setLoading(true);
      setError(null);

      if (revenueCatService.isConfigured()) {
        await revenueCatService.initialize();
        const userSubscription = await revenueCatService.getUserSubscription();
        setSubscription(userSubscription);
      }
    } catch (err) {
      console.error('Error initializing subscription:', err);
      setError('Failed to load subscription information');
    } finally {
      setLoading(false);
    }
  };

  const refreshSubscription = async () => {
    try {
      const userSubscription = await revenueCatService.getUserSubscription();
      setSubscription(userSubscription);
    } catch (err) {
      console.error('Error refreshing subscription:', err);
    }
  };

  const canAddAsset = async (currentCount: number) => {
    return await revenueCatService.canAddAsset(currentCount);
  };

  const canAddContact = async (currentCount: number) => {
    return await revenueCatService.canAddContact(currentCount);
  };

  const canUseAIFeatures = async () => {
    return await revenueCatService.canUseAIFeatures();
  };

  const hasProAccess = () => {
    return subscription.plan === 'pro' || subscription.plan === 'forever';
  };

  const hasLifetimeAccess = () => {
    return subscription.plan === 'forever';
  };

  return {
    subscription,
    loading,
    error,
    refreshSubscription,
    canAddAsset,
    canAddContact,
    canUseAIFeatures,
    hasProAccess,
    hasLifetimeAccess,
    updateSubscription: setSubscription
  };
};