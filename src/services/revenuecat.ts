// Mock RevenueCat service since we can't install the actual package
// This will simulate the functionality for development purposes

export interface SubscriptionPlan {
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
  private mockSubscription: UserSubscription = {
    isActive: false,
    productId: null,
    expirationDate: null,
    willRenew: false,
    isInGracePeriod: false,
    plan: 'free'
  };

  // Initialize RevenueCat
  async initialize(userId?: string): Promise<void> {
    if (this.isInitialized) return;
    
    // In a real implementation, this would initialize the RevenueCat SDK
    console.log('Mock RevenueCat initialized with user ID:', userId);
    this.isInitialized = true;
  }

  // Check if RevenueCat is configured
  isConfigured(): boolean {
    // Always return true for our mock implementation
    return true;
  }

  // Get available offerings
  async getOfferings(): Promise<any[]> {
    // Return mock offerings
    return [
      {
        identifier: 'standard',
        availablePackages: [
          {
            identifier: 'pro_monthly',
            product: {
              identifier: 'pro_monthly',
              priceString: '$12',
              title: 'Heritage Vault Pro'
            }
          },
          {
            identifier: 'pro_annual',
            product: {
              identifier: 'pro_annual',
              priceString: '$120',
              title: 'Heritage Vault Pro (Annual)'
            }
          },
          {
            identifier: 'forever',
            product: {
              identifier: 'forever',
              priceString: '$89',
              title: 'Heritage Vault Forever'
            }
          }
        ]
      }
    ];
  }

  // Get current customer info
  async getCustomerInfo(): Promise<any | null> {
    // Return mock customer info based on current subscription
    return {
      entitlements: {
        active: this.mockSubscription.plan !== 'free' ? {
          [this.mockSubscription.plan]: {
            productIdentifier: this.mockSubscription.productId,
            expirationDate: this.mockSubscription.expirationDate,
            willRenew: this.mockSubscription.willRenew,
            isInGracePeriod: this.mockSubscription.isInGracePeriod
          }
        } : {}
      }
    };
  }

  // Purchase a package
  async purchasePackage(packageToPurchase: any): Promise<any> {
    console.log('Purchasing package:', packageToPurchase);
    
    // Simulate purchase process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update mock subscription based on purchased package
    if (packageToPurchase.product.identifier.includes('pro_monthly')) {
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
    } else if (packageToPurchase.product.identifier.includes('pro_annual')) {
      const expirationDate = new Date();
      expirationDate.setFullYear(expirationDate.getFullYear() + 1);
      
      this.mockSubscription = {
        isActive: true,
        productId: 'pro_annual',
        expirationDate: expirationDate.toISOString(),
        willRenew: true,
        isInGracePeriod: false,
        plan: 'pro'
      };
    } else if (packageToPurchase.product.identifier.includes('forever')) {
      this.mockSubscription = {
        isActive: true,
        productId: 'forever',
        expirationDate: null,
        willRenew: false,
        isInGracePeriod: false,
        plan: 'forever'
      };
    }
    
    return { customerInfo: await this.getCustomerInfo() };
  }

  // Restore purchases
  async restorePurchases(): Promise<any> {
    // Simulate restore process
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For demo purposes, let's assume the user had a pro subscription
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
    
    return await this.getCustomerInfo();
  }

  // Get user subscription status
  async getUserSubscription(): Promise<UserSubscription> {
    return this.mockSubscription;
  }

  // Check if user has access to pro features
  async hasProAccess(): Promise<boolean> {
    return this.mockSubscription.plan === 'pro' || this.mockSubscription.plan === 'forever';
  }

  // Check if user has lifetime access
  async hasLifetimeAccess(): Promise<boolean> {
    return this.mockSubscription.plan === 'forever';
  }

  // Get subscription plans from offerings
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    // Return mock plans
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
        badge: 'Free'
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
        badge: 'Most Popular'
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
        badge: 'Best Value'
      }
    ];
  }

  // Set user ID for RevenueCat
  async setUserId(userId: string): Promise<void> {
    console.log('Setting RevenueCat user ID:', userId);
  }

  // Log out user
  async logOut(): Promise<void> {
    console.log('Logging out RevenueCat user');
  }

  // Check if user can add more assets based on their plan
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

  // Check if user can add more contacts based on their plan
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