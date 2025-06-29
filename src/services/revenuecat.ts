import Purchases, { PurchasesOffering, PurchasesPackage, CustomerInfo } from '@revenuecat/purchases-js';

// RevenueCat Configuration
const REVENUECAT_API_KEY = import.meta.env.VITE_REVENUECAT_PUBLIC_KEY || '';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  packageType: 'monthly' | 'annual' | 'lifetime';
}

export interface UserSubscription {
  isActive: boolean;
  productId: string | null;
  expirationDate: string | null;
  willRenew: boolean;
  isInGracePeriod: boolean;
  plan: 'free' | 'pro' | 'forever';
}

class RevenueCatService {
  private isInitialized = false;

  // Initialize RevenueCat
  async initialize(userId?: string): Promise<void> {
    if (this.isInitialized) return;

    try {
      await Purchases.configure({
        apiKey: REVENUECAT_API_KEY,
        appUserId: userId,
      });
      
      this.isInitialized = true;
      console.log('RevenueCat initialized successfully');
    } catch (error) {
      console.error('Failed to initialize RevenueCat:', error);
      throw new Error('RevenueCat initialization failed');
    }
  }

  // Check if RevenueCat is configured
  isConfigured(): boolean {
    return !!REVENUECAT_API_KEY;
  }

  // Get available offerings
  async getOfferings(): Promise<PurchasesOffering[]> {
    try {
      const offerings = await Purchases.getOfferings();
      return offerings.all ? Object.values(offerings.all) : [];
    } catch (error) {
      console.error('Error fetching offerings:', error);
      return [];
    }
  }

  // Get current customer info
  async getCustomerInfo(): Promise<CustomerInfo | null> {
    try {
      return await Purchases.getCustomerInfo();
    } catch (error) {
      console.error('Error fetching customer info:', error);
      return null;
    }
  }

  // Purchase a package
  async purchasePackage(packageToPurchase: PurchasesPackage): Promise<CustomerInfo> {
    try {
      const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
      return customerInfo;
    } catch (error) {
      console.error('Purchase failed:', error);
      throw error;
    }
  }

  // Restore purchases
  async restorePurchases(): Promise<CustomerInfo> {
    try {
      return await Purchases.restorePurchases();
    } catch (error) {
      console.error('Restore purchases failed:', error);
      throw error;
    }
  }

  // Get user subscription status
  async getUserSubscription(): Promise<UserSubscription> {
    try {
      const customerInfo = await this.getCustomerInfo();
      
      if (!customerInfo) {
        return {
          isActive: false,
          productId: null,
          expirationDate: null,
          willRenew: false,
          isInGracePeriod: false,
          plan: 'free'
        };
      }

      // Check for active entitlements
      const proEntitlement = customerInfo.entitlements.active['pro'];
      const foreverEntitlement = customerInfo.entitlements.active['forever'];

      if (foreverEntitlement) {
        return {
          isActive: true,
          productId: foreverEntitlement.productIdentifier,
          expirationDate: null, // Lifetime doesn't expire
          willRenew: false,
          isInGracePeriod: false,
          plan: 'forever'
        };
      }

      if (proEntitlement) {
        return {
          isActive: true,
          productId: proEntitlement.productIdentifier,
          expirationDate: proEntitlement.expirationDate,
          willRenew: proEntitlement.willRenew,
          isInGracePeriod: proEntitlement.isInGracePeriod,
          plan: 'pro'
        };
      }

      return {
        isActive: false,
        productId: null,
        expirationDate: null,
        willRenew: false,
        isInGracePeriod: false,
        plan: 'free'
      };
    } catch (error) {
      console.error('Error getting subscription status:', error);
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

  // Check if user has access to pro features
  async hasProAccess(): Promise<boolean> {
    const subscription = await this.getUserSubscription();
    return subscription.plan === 'pro' || subscription.plan === 'forever';
  }

  // Check if user has lifetime access
  async hasLifetimeAccess(): Promise<boolean> {
    const subscription = await this.getUserSubscription();
    return subscription.plan === 'forever';
  }

  // Get subscription plans from offerings
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    try {
      const offerings = await this.getOfferings();
      const plans: SubscriptionPlan[] = [];

      // Add free plan (not from RevenueCat)
      plans.push({
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
        packageType: 'monthly'
      });

      // Process RevenueCat offerings
      for (const offering of offerings) {
        if (offering.availablePackages) {
          for (const pkg of offering.availablePackages) {
            const product = pkg.product;
            
            // Determine plan type based on product identifier
            let planName = 'Heritage Vault Pro';
            let isPopular = false;
            let packageType: 'monthly' | 'annual' | 'lifetime' = 'monthly';
            let features: string[] = [];

            if (product.identifier.includes('monthly')) {
              planName = 'Heritage Vault Pro';
              packageType = 'monthly';
              isPopular = true;
              features = [
                'Unlimited asset storage',
                'Multiple next of kin',
                'Voice & video messages',
                'Flash questions & tests',
                'Custom avatar creation',
                'Advanced release logic',
                'Priority support',
                'Multi-language support',
                'Advanced security features'
              ];
            } else if (product.identifier.includes('annual')) {
              planName = 'Heritage Vault Pro (Annual)';
              packageType = 'annual';
              features = [
                'All Pro features',
                'Save 2 months!',
                'Unlimited asset storage',
                'Multiple next of kin',
                'Voice & video messages',
                'Flash questions & tests',
                'Custom avatar creation',
                'Advanced release logic',
                'Priority support'
              ];
            } else if (product.identifier.includes('lifetime') || product.identifier.includes('forever')) {
              planName = 'Heritage Vault Forever';
              packageType = 'lifetime';
              features = [
                'Unlimited assets',
                'Lifetime storage',
                'AI avatar creation',
                '3 voice messages',
                '10 flash questions',
                'Vault release tracking',
                'Exportable heritage report',
                'Lifetime updates',
                'No recurring fees'
              ];
            }

            plans.push({
              id: product.identifier,
              name: planName,
              price: product.priceString,
              period: packageType === 'lifetime' ? '/one-time' : packageType === 'annual' ? '/year' : '/month',
              description: packageType === 'lifetime' 
                ? 'Lifetime access - perfect for those who hate subscriptions'
                : packageType === 'annual'
                ? 'Complete digital inheritance solution for families (Annual)'
                : 'Complete digital inheritance solution for families',
              features,
              isPopular,
              packageType
            });
          }
        }
      }

      return plans;
    } catch (error) {
      console.error('Error getting subscription plans:', error);
      // Return default plans if RevenueCat fails
      return this.getDefaultPlans();
    }
  }

  // Fallback default plans
  private getDefaultPlans(): SubscriptionPlan[] {
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
        packageType: 'monthly'
      },
      {
        id: 'pro_monthly',
        name: 'Heritage Vault Pro',
        price: '$12',
        period: '/month',
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
        packageType: 'monthly'
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
        packageType: 'lifetime'
      }
    ];
  }

  // Set user ID for RevenueCat
  async setUserId(userId: string): Promise<void> {
    try {
      await Purchases.logIn(userId);
    } catch (error) {
      console.error('Error setting user ID:', error);
    }
  }

  // Log out user
  async logOut(): Promise<void> {
    try {
      await Purchases.logOut();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }

  // Check if user can add more assets based on their plan
  async canAddAsset(currentAssetCount: number): Promise<{ canAdd: boolean; reason?: string }> {
    const subscription = await this.getUserSubscription();
    
    if (subscription.plan === 'free') {
      if (currentAssetCount >= 3) {
        return {
          canAdd: false,
          reason: 'Free plan limited to 3 assets. Upgrade to Pro for unlimited assets.'
        };
      }
    }
    
    return { canAdd: true };
  }

  // Check if user can add more contacts based on their plan
  async canAddContact(currentContactCount: number): Promise<{ canAdd: boolean; reason?: string }> {
    const subscription = await this.getUserSubscription();
    
    if (subscription.plan === 'free') {
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
    const subscription = await this.getUserSubscription();
    
    if (subscription.plan === 'free') {
      return {
        canUse: false,
        reason: 'AI features require Pro or Forever plan. Upgrade to access voice messages and avatar creation.'
      };
    }
    
    return { canUse: true };
  }
}

// Create singleton instance
export const revenueCatService = new RevenueCatService();

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