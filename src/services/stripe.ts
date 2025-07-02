// Stripe service for handling payments
import { loadStripe, Stripe } from '@stripe/stripe-js';

export interface StripeSubscriptionPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  packageType: 'monthly' | 'annual' | 'lifetime';
  buttonStyle?: string;
  buttonText?: string;
  badge?: string;
  yearlyPrice?: string;
  yearlyPeriod?: string;
  priceId: string; // Stripe price ID
}

export interface UserSubscription {
  isActive: boolean;
  productId: string | null;
  expirationDate: string | null;
  willRenew: boolean;
  isInGracePeriod: boolean;
  plan: 'free' | 'pro' | 'forever';
}

class StripeService {
  private stripePromise: Promise<Stripe | null>;
  private publishableKey: string;
  private mockSubscription: UserSubscription = {
    isActive: false,
    productId: null,
    expirationDate: null,
    willRenew: false,
    isInGracePeriod: false,
    plan: 'free'
  };

  constructor() {
    this.publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
    this.stripePromise = loadStripe(this.publishableKey);
  }

  // Check if Stripe is configured
  isConfigured(): boolean {
    return !!this.publishableKey;
  }

  // Initialize Stripe
  async initialize(userId?: string): Promise<void> {
    if (!this.isConfigured()) {
      console.warn('Stripe is not configured. Please add your publishable key to environment variables.');
      return;
    }

    try {
      await this.stripePromise;
      console.log('Stripe initialized for user:', userId || 'anonymous');
    } catch (error) {
      console.error('Failed to initialize Stripe:', error);
    }
  }

  // Redirect to Stripe Checkout
  async redirectToCheckout(priceId: string, successUrl: string, cancelUrl: string): Promise<void> {
    try {
      const stripe = await this.stripePromise;
      if (!stripe) {
        throw new Error('Stripe not initialized');
      }

      // Create checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          successUrl,
          cancelUrl,
        }),
      });

      const session = await response.json();

      // Redirect to checkout
      const result = await stripe.redirectToCheckout({
        sessionId: session.id,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }
    } catch (error) {
      console.error('Error redirecting to checkout:', error);
      throw error;
    }
  }

  // Redirect to Stripe Customer Portal
  async redirectToCustomerPortal(returnUrl: string): Promise<void> {
    try {
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          returnUrl,
        }),
      });

      const session = await response.json();
      window.location.href = session.url;
    } catch (error) {
      console.error('Error redirecting to customer portal:', error);
      throw error;
    }
  }

  // Get subscription plans
  async getSubscriptionPlans(): Promise<StripeSubscriptionPlan[]> {
    // In a real implementation, this would fetch from your backend
    // For now, we'll return mock data
    return [
      {
        id: 'free',
        name: 'Free Forever',
        price: '$0',
        period: '/forever',
        description: 'Perfect for getting started with digital inheritance',
        features: [
          'Up to 3 assets',
          '1 next of kin',
          '1 short text message',
          'Basic security',
          'Mobile app access',
          'Email support'
        ],
        packageType: 'monthly',
        buttonStyle: 'border-2 border-purple-700 text-purple-800 hover:border-purple-800 hover:bg-purple-50',
        buttonText: 'Start Free',
        badge: 'Free',
        priceId: 'free'
      },
      {
        id: 'pro_monthly',
        name: 'Heritage Vault Pro',
        price: '$12',
        period: '/month',
        yearlyPrice: '$120',
        yearlyPeriod: '/year',
        description: 'Complete digital inheritance solution for families',
        features: [
          'Unlimited asset storage',
          'Multiple next of kin',
          'Voice & video messages',
          'Flash questions & tests',
          'Custom avatar creation',
          'Advanced release logic',
          'Priority support',
          'Multi-language support',
          'Advanced security features'
        ],
        isPopular: true,
        packageType: 'monthly',
        buttonStyle: 'bg-purple-700 text-white hover:bg-purple-800',
        buttonText: 'Start 7-Day Free Trial',
        badge: 'Most Popular',
        priceId: 'price_1OvXyZLkdIwHu7hP8JgNxVdP'
      },
      {
        id: 'pro_yearly',
        name: 'Heritage Vault Pro (Annual)',
        price: '$120',
        period: '/year',
        description: 'Save 20% with annual billing',
        features: [
          'All Pro features',
          '2 months free',
          'Unlimited asset storage',
          'Multiple next of kin',
          'Voice & video messages',
          'Flash questions & tests',
          'Custom avatar creation',
          'Advanced release logic',
          'Priority support'
        ],
        packageType: 'annual',
        buttonStyle: 'bg-purple-700 text-white hover:bg-purple-800',
        buttonText: 'Subscribe Yearly',
        priceId: 'price_1OvXyZLkdIwHu7hP8JgNxVdP'
      },
      {
        id: 'forever',
        name: 'Heritage Vault Forever',
        price: '$89',
        period: '/one-time',
        description: 'Lifetime access - perfect for those who hate subscriptions',
        features: [
          'Unlimited assets',
          'Lifetime storage',
          'AI avatar creation',
          '3 voice messages',
          '10 flash questions',
          'Vault release tracking',
          'Exportable heritage report',
          'Lifetime updates',
          'No recurring fees'
        ],
        packageType: 'lifetime',
        buttonStyle: 'bg-gradient-to-r from-purple-700 to-pink-700 text-white hover:from-purple-800 hover:to-pink-800',
        buttonText: 'Buy Lifetime Access',
        badge: 'Best Value',
        priceId: 'price_1OvXzALkdIwHu7hP8JgNxVdP'
      }
    ];
  }

  // Get user subscription
  async getUserSubscription(): Promise<UserSubscription> {
    try {
      // In a real implementation, this would fetch from your backend
      // For now, we'll return mock data
      return this.mockSubscription;
    } catch (error) {
      console.error('Error getting user subscription:', error);
      return {
        isActive: false,
        productId: null,
        expirationDate: null,
        willRenew: false,
        isInGracePeriod: false,
        plan: 'free'
      };
    }
  }

  // Update mock subscription (for demo purposes)
  updateMockSubscription(plan: 'free' | 'pro' | 'forever'): void {
    if (plan === 'pro') {
      const expirationDate = new Date();
      expirationDate.setMonth(expirationDate.getMonth() + 1);
      
      this.mockSubscription = {
        isActive: true,
        productId: 'pro_monthly',
        expirationDate: expirationDate.toISOString(),
        willRenew: true,
        isInGracePeriod: false,
        plan: 'pro'
      };
    } else if (plan === 'forever') {
      this.mockSubscription = {
        isActive: true,
        productId: 'forever',
        expirationDate: null,
        willRenew: false,
        isInGracePeriod: false,
        plan: 'forever'
      };
    } else {
      this.mockSubscription = {
        isActive: false,
        productId: null,
        expirationDate: null,
        willRenew: false,
        isInGracePeriod: false,
        plan: 'free'
      };
    }
  }

  // Check if user can add more assets
  async canAddAsset(currentAssetCount: number): Promise<{ canAdd: boolean; reason?: string }> {
    if (this.mockSubscription.plan === 'free') {
      if (currentAssetCount >= 3) {
        return {
          canAdd: false,
          reason: 'Free plan limited to 3 assets. Upgrade to Pro for unlimited assets.'
        };
      }
    }
    
    return { canAdd: true };
  }

  // Check if user can add more contacts
  async canAddContact(currentContactCount: number): Promise<{ canAdd: boolean; reason?: string }> {
    if (this.mockSubscription.plan === 'free') {
      if (currentContactCount >= 1) {
        return {
          canAdd: false,
          reason: 'Free plan limited to 1 next of kin. Upgrade to Pro for multiple beneficiaries.'
        };
      }
    }
    
    return { canAdd: true };
  }

  // Check if user can use AI features
  async canUseAIFeatures(): Promise<{ canUse: boolean; reason?: string }> {
    if (this.mockSubscription.plan === 'free') {
      return {
        canUse: false,
        reason: 'AI features require Pro or Forever plan. Upgrade to access voice messages and avatar creation.'
      };
    }
    
    return { canUse: true };
  }
}

// Create singleton instance
export const stripeService = new StripeService();

// Helper function to format subscription status for display
export const formatSubscriptionStatus = (subscription: UserSubscription): string => {
  if (subscription.plan === 'forever') {
    return 'Lifetime Access';
  }
  
  if (subscription.plan === 'pro') {
    if (subscription.expirationDate) {
      const expDate = new Date(subscription.expirationDate);
      const now = new Date();
      const daysLeft = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (subscription.isInGracePeriod) {
        return `Grace Period (${daysLeft} days)`;
      }
      
      if (subscription.willRenew) {
        return `Pro - Renews ${expDate.toLocaleDateString()}`;
      } else {
        return `Pro - Expires ${expDate.toLocaleDateString()}`;
      }
    }
    return 'Pro Active';
  }
  
  return 'Free Plan';
};