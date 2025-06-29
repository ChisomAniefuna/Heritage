import React, { useState, useEffect } from 'react';
import { Crown, Check, Loader, AlertCircle, Gift, Infinity, Zap } from 'lucide-react';
import { revenueCatService, SubscriptionPlan, UserSubscription, formatSubscriptionStatus } from '../services/revenuecat';

interface SubscriptionManagerProps {
  onClose: () => void;
  onSubscriptionChange?: (subscription: UserSubscription) => void;
}

const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({ onClose, onSubscriptionChange }) => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Initialize RevenueCat if not already done
      if (!revenueCatService.isConfigured()) {
        setError('RevenueCat is not configured. Please add your public key to environment variables.');
        return;
      }

      await revenueCatService.initialize();
      
      // Load current subscription and available plans
      const [subscription, availablePlans] = await Promise.all([
        revenueCatService.getUserSubscription(),
        revenueCatService.getSubscriptionPlans()
      ]);

      setCurrentSubscription(subscription);
      setPlans(availablePlans);
    } catch (err) {
      console.error('Error loading subscription data:', err);
      setError('Failed to load subscription information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (planId: string) => {
    if (planId === 'free') return; // Can't purchase free plan

    try {
      setPurchasing(planId);
      setError(null);

      // Get offerings to find the package
      const offerings = await revenueCatService.getOfferings();
      let packageToPurchase = null;

      for (const offering of offerings) {
        if (offering.availablePackages) {
          packageToPurchase = offering.availablePackages.find(
            pkg => pkg.product.identifier === planId
          );
          if (packageToPurchase) break;
        }
      }

      if (!packageToPurchase) {
        throw new Error('Package not found');
      }

      // Make the purchase
      await revenueCatService.purchasePackage(packageToPurchase);
      
      // Reload subscription data
      const updatedSubscription = await revenueCatService.getUserSubscription();
      setCurrentSubscription(updatedSubscription);
      
      if (onSubscriptionChange) {
        onSubscriptionChange(updatedSubscription);
      }

      // Show success message
      alert('Purchase successful! Your subscription has been activated.');
      
    } catch (err: any) {
      console.error('Purchase failed:', err);
      
      // Handle specific RevenueCat errors
      if (err.code === 'PURCHASE_CANCELLED') {
        setError('Purchase was cancelled.');
      } else if (err.code === 'PAYMENT_PENDING') {
        setError('Payment is pending. Please check back later.');
      } else {
        setError('Purchase failed. Please try again or contact support.');
      }
    } finally {
      setPurchasing(null);
    }
  };

  const handleRestore = async () => {
    try {
      setLoading(true);
      setError(null);

      await revenueCatService.restorePurchases();
      
      // Reload subscription data
      const updatedSubscription = await revenueCatService.getUserSubscription();
      setCurrentSubscription(updatedSubscription);
      
      if (onSubscriptionChange) {
        onSubscriptionChange(updatedSubscription);
      }

      alert('Purchases restored successfully!');
    } catch (err) {
      console.error('Restore failed:', err);
      setError('Failed to restore purchases. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPlanBadge = (plan: SubscriptionPlan) => {
    if (plan.id === 'free') {
      return { icon: Gift, text: 'Free', color: 'bg-green-600' };
    }
    if (plan.isPopular) {
      return { icon: Crown, text: 'Most Popular', color: 'bg-purple-700' };
    }
    if (plan.packageType === 'lifetime') {
      return { icon: Infinity, text: 'Best Value', color: 'bg-purple-700' };
    }
    return null;
  };

  const isCurrentPlan = (planId: string) => {
    if (planId === 'free' && currentSubscription?.plan === 'free') return true;
    if (currentSubscription?.productId === planId) return true;
    return false;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl p-8 text-center">
          <Loader className="w-8 h-8 animate-spin text-purple-700 mx-auto mb-4" />
          <p className="text-slate-700">Loading subscription information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-purple-50 to-purple-100 rounded-t-xl">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Manage Subscription</h2>
            {currentSubscription && (
              <p className="text-slate-600 mt-1">
                Current plan: {formatSubscriptionStatus(currentSubscription)}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {plans.map((plan) => {
              const badge = getPlanBadge(plan);
              const isCurrent = isCurrentPlan(plan.id);
              const isPurchasing = purchasing === plan.id;

              return (
                <div
                  key={plan.id}
                  className={`bg-white rounded-2xl shadow-lg border-2 transition-all duration-200 hover:shadow-xl ${
                    plan.isPopular
                      ? 'border-purple-700 relative transform scale-105'
                      : 'border-slate-200 hover:border-purple-300'
                  }`}
                >
                  {badge && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className={`px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-1 text-white ${badge.color}`}>
                        <badge.icon className="w-4 h-4" />
                        <span>{badge.text}</span>
                      </div>
                    </div>
                  )}

                  <div className="p-6">
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                      <p className="text-slate-700 mb-4 text-sm">{plan.description}</p>
                      <div className="flex items-baseline justify-center">
                        <span className="text-3xl font-bold text-slate-900">{plan.price}</span>
                        <span className="text-slate-700 ml-1">{plan.period}</span>
                      </div>
                    </div>

                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-slate-800 text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handlePurchase(plan.id)}
                      disabled={isCurrent || isPurchasing || plan.id === 'free'}
                      className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
                        isCurrent
                          ? 'bg-green-100 text-green-800 cursor-not-allowed'
                          : plan.id === 'free'
                          ? 'bg-slate-100 text-slate-600 cursor-not-allowed'
                          : plan.isPopular
                          ? 'bg-purple-700 text-white hover:bg-purple-800'
                          : 'border-2 border-purple-700 text-purple-800 hover:border-purple-800 hover:bg-purple-50'
                      }`}
                    >
                      {isPurchasing && <Loader className="w-4 h-4 animate-spin" />}
                      <span>
                        {isCurrent
                          ? 'Current Plan'
                          : plan.id === 'free'
                          ? 'Free Plan'
                          : isPurchasing
                          ? 'Processing...'
                          : `Upgrade to ${plan.name}`}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-slate-200">
            <button
              onClick={handleRestore}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 text-purple-700 hover:text-purple-800 transition-colors"
            >
              <Zap className="w-4 h-4" />
              <span>Restore Purchases</span>
            </button>

            <button
              onClick={onClose}
              className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionManager;