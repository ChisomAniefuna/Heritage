import React, { useState, useEffect } from 'react';
import { Shield, Check, Crown, Gift, Infinity, Mic, User, Globe, ArrowLeft, Zap, Users } from 'lucide-react';
import { revenueCatService, SubscriptionPlan } from '../services/revenuecat';
import SubscriptionManager from './SubscriptionManager';

interface PricingPageProps {
  onBack: () => void;
  onLogin: () => void;
}

const PricingPage: React.FC<PricingPageProps> = ({ onBack, onLogin }) => {
  const [showSubscriptionManager, setShowSubscriptionManager] = useState(false);
  const [pricingPlans, setPricingPlans] = useState([
    {
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
      buttonText: 'Start Free',
      buttonStyle: 'border-2 border-purple-700 text-purple-800 hover:border-purple-800 hover:bg-purple-50',
      popular: false,
      badge: 'Free'
    },
    {
      name: 'HeritageVault Pro',
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
      buttonText: 'Start 7-Day Free Trial',
      buttonStyle: 'bg-purple-700 text-white hover:bg-purple-800',
      popular: true,
      badge: 'Most Popular'
    },
    {
      name: 'HeritageVault Forever',
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
      buttonText: 'Buy Lifetime Access',
      buttonStyle: 'bg-gradient-to-r from-purple-700 to-pink-700 text-white hover:from-purple-800 hover:to-pink-800',
      popular: false,
      badge: 'Best Value'
    }
  ]);

  const addOns = [
    {
      name: 'AI Voice Message',
      price: '$3.99',
      description: 'Each additional personalized voice message',
      icon: Mic
    },
    {
      name: 'Animated Avatar Message',
      price: '$4.99',
      description: 'One-time custom avatar video creation',
      icon: User
    },
    {
      name: 'Multi-language Playback',
      price: '$2.99',
      description: 'Spanish, French, German, or other language support',
      icon: Globe
    }
  ];

  const enterpriseFeatures = [
    'Co-branded Heritage Vaults',
    'Bulk heritage plans for clients',
    'Admin dashboards & reporting',
    'White-label solutions',
    'Custom integrations',
    'Dedicated account manager',
    'Training & onboarding',
    'Priority technical support'
  ];

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      if (revenueCatService.isConfigured()) {
        await revenueCatService.initialize();
        const plans = await revenueCatService.getSubscriptionPlans();
        if (plans.length > 0) {
          setPricingPlans(plans);
        }
      }
    } catch (error) {
      console.error('Error loading plans:', error);
    }
  };

  const handlePricingButtonClick = (plan: any) => {
    if (plan.name === 'Free Forever') {
      onLogin();
    } else {
      setShowSubscriptionManager(true);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 text-slate-700 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Home</span>
              </button>
              <div className="h-6 w-px bg-slate-300"></div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 bg-purple-700 rounded-lg">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-slate-900">Heritage Vault</span>
              </div>
            </div>
            <button
              onClick={onLogin}
              className="bg-purple-700 text-white px-4 py-2 rounded-lg hover:bg-purple-800 transition-colors text-sm font-medium"
            >
              Sign In
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-50 to-purple-100 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
            Choose Your Heritage Plan
          </h1>
          <p className="text-xl text-slate-700 mb-8 max-w-2xl mx-auto">
            Start free and upgrade when you need more. Professional digital inheritance management for every family's needs.
          </p>
          <div className="flex items-center justify-center space-x-6 text-sm text-slate-600">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>256-bit encryption</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>US-based support team</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4" />
              <span>Mobile app included</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Pricing Plans */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => {
              const Badge = plan.badge === 'Most Popular' ? Crown : 
                           plan.badge === 'Free' ? Gift : 
                           plan.badge === 'Best Value' ? Infinity : null;
              
              return (
                <div key={index} className={`bg-white rounded-2xl shadow-lg border-2 transition-all duration-200 hover:shadow-xl ${
                  plan.popular 
                    ? 'border-purple-700 relative transform scale-105' 
                    : 'border-slate-200 hover:border-purple-300'
                }`}>
                  {plan.badge && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className={`px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-1 ${
                        plan.popular 
                          ? 'bg-purple-700 text-white' 
                          : plan.badge === 'Free' 
                          ? 'bg-green-600 text-white'
                          : 'bg-purple-700 text-white'
                      }`}>
                        {Badge && <Badge className="w-4 h-4" />}
                        <span>{plan.badge}</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="p-8">
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                      <p className="text-slate-700 mb-4">{plan.description}</p>
                      <div className="flex items-baseline justify-center">
                        <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                        <span className="text-slate-700 ml-1">{plan.period}</span>
                      </div>
                      {plan.yearlyPrice && (
                        <div className="mt-2">
                          <span className="text-lg text-green-600 font-semibold">
                            or {plan.yearlyPrice}{plan.yearlyPeriod}
                          </span>
                          <span className="text-sm text-green-600 block">Save 2 months!</span>
                        </div>
                      )}
                    </div>

                    <ul className="space-y-4 mb-8">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start space-x-3">
                          <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-slate-800 text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button 
                      onClick={() => handlePricingButtonClick(plan)}
                      className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${plan.buttonStyle}`}
                    >
                      {plan.buttonText}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Add-ons Section */}
      <section className="py-16 bg-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Premium Add-ons</h3>
              <p className="text-slate-700">Enhance your vault with optional premium features</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {addOns.map((addon, index) => {
                const Icon = addon.icon;
                return (
                  <div key={index} className="border border-purple-200 rounded-lg p-6 hover:border-purple-300 transition-colors">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Icon className="w-5 h-5 text-purple-700" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">{addon.name}</h4>
                        <p className="text-lg font-bold text-purple-700">{addon.price}</p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-700">{addon.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-purple-700 to-purple-800 rounded-2xl p-8 lg:p-12 text-white">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-3xl font-bold mb-4">Enterprise & Partner Solutions</h3>
                <p className="text-purple-100 mb-6">
                  Perfect for lawyers, hospitals, churches, and HMOs who want to offer Heritage Vault to their clients.
                </p>
                <ul className="space-y-3 mb-8">
                  {enterpriseFeatures.slice(0, 4).map((feature, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span className="text-purple-100">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button className="bg-white text-purple-800 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors">
                  Contact Sales
                </button>
              </div>
              <div className="bg-white/10 rounded-xl p-6">
                <h4 className="text-xl font-semibold mb-4">Additional Enterprise Features</h4>
                <ul className="space-y-2">
                  {enterpriseFeatures.slice(4).map((feature, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span className="text-purple-100 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vault Unlock Fee Notice */}
      <section className="py-16 bg-purple-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <Shield className="w-6 h-6 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-900 mb-2">High-Value Vault Security</h4>
                <p className="text-amber-800 text-sm">
                  For vaults containing over $250,000 in declared assets, a small verification fee ($10 or 0.5% capped at $50) 
                  applies when beneficiaries unlock the vault. This covers enhanced digital security and verification processes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h3>
            <p className="text-slate-700">Everything you need to know about Heritage Vault pricing</p>
          </div>
          
          <div className="space-y-6">
            <div className="bg-purple-50 rounded-lg p-6">
              <h4 className="font-semibold text-slate-900 mb-2">Can I upgrade or downgrade my plan anytime?</h4>
              <p className="text-slate-700 text-sm">
                Yes! You can upgrade to Pro anytime. If you downgrade, you'll keep Pro features until your current billing period ends.
              </p>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-6">
              <h4 className="font-semibold text-slate-900 mb-2">What happens to my data if I cancel?</h4>
              <p className="text-slate-700 text-sm">
                Your data remains accessible for 90 days after cancellation. You can export everything or reactivate your account during this period.
              </p>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-6">
              <h4 className="font-semibold text-slate-900 mb-2">Is the Forever plan really lifetime?</h4>
              <p className="text-slate-700 text-sm">
                Yes! One payment gives you lifetime access to Heritage Vault with all included features. You'll also receive free updates and new features as we add them.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-purple-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Secure Your Family's Heritage?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Start with our free plan and upgrade when you're ready for more features.
          </p>
          <button
            onClick={onLogin}
            className="bg-white text-purple-800 px-8 py-4 rounded-lg hover:bg-purple-50 transition-all duration-200 text-lg font-semibold"
          >
            Start Free Forever
          </button>
          <p className="text-purple-200 text-sm mt-4">
            No credit card required • Start with 3 free assets • Upgrade anytime
          </p>
        </div>
      </section>

      {showSubscriptionManager && (
        <SubscriptionManager onClose={() => setShowSubscriptionManager(false)} />
      )}
    </div>
  );
};

export default PricingPage;