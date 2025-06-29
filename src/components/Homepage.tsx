import React from 'react';
import { Shield, Lock, Users, FileText, Wallet, ArrowRight, Check, Star, Heart, Clock, MessageSquare, User, Mic } from 'lucide-react';

interface HomepageProps {
  onLogin: () => void;
  onViewPricing: () => void;
}

const Homepage: React.FC<HomepageProps> = ({ onLogin, onViewPricing }) => {
  const features = [
    {
      icon: Wallet,
      title: 'Comprehensive Asset Tracking',
      description: 'Complete inventory of financial accounts, property, digital assets, and personal valuables with voice-guided entry.'
    },
    {
      icon: Shield,
      title: 'Bank-Level Security',
      description: 'Your sensitive information is protected with enterprise-grade encryption and security protocols.'
    },
    {
      icon: Users,
      title: 'Smart Beneficiary Management',
      description: 'Easily designate and manage beneficiaries with detailed contact information and conditional access rules.'
    },
    {
      icon: MessageSquare,
      title: 'AI Voice Messages',
      description: 'Record personalized voice messages that will be delivered to your loved ones using advanced AI voice synthesis.'
    },
    {
      icon: User,
      title: 'Avatar Video Messages',
      description: 'Create lifelike avatar videos that speak your words, providing comfort and guidance when you can\'t be there.'
    },
    {
      icon: FileText,
      title: 'Document Storage',
      description: 'Securely store and organize important documents like wills, insurance policies, and legal papers.'
    },
    {
      icon: Lock,
      title: 'Conditional Access Control',
      description: 'Control who can access what information and when, with time-delayed release and knowledge verification options.'
    },
    {
      icon: Clock,
      title: 'Automated Notifications',
      description: 'Set up automated alerts and notifications to keep your beneficiaries informed when needed.'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Mitchell',
      role: 'Estate Planning Attorney',
      content: 'Heritage Vault has revolutionized how I help clients organize their digital inheritance. The comprehensive asset management combined with AI voice messages creates a complete solution.',
      rating: 5
    },
    {
      name: 'David Chen',
      role: 'Financial Advisor',
      content: 'My clients love the professional asset tracking capabilities. The AI avatar feature is an incredible bonus that makes the inheritance process more personal and meaningful.',
      rating: 5
    },
    {
      name: 'Maria Rodriguez',
      role: 'Family Trust Manager',
      content: 'The document organization and asset management features are top-notch. The personalized messaging capabilities add a human touch that traditional estate planning lacks.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-slate-900 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Heritage Vault</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-slate-600 hover:text-slate-900 px-3 py-2 text-sm font-medium transition-colors">
                Features
              </button>
              <button 
                onClick={onViewPricing}
                className="text-slate-600 hover:text-slate-900 px-3 py-2 text-sm font-medium transition-colors"
              >
                Pricing
              </button>
              <button className="text-slate-600 hover:text-slate-900 px-3 py-2 text-sm font-medium transition-colors">
                Security
              </button>
              <button
                onClick={onLogin}
                className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-50 to-slate-100 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="flex items-center justify-center w-20 h-20 bg-slate-900 rounded-2xl">
                <Shield className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              Secure Your Family's
              <span className="block text-slate-700">Digital Heritage</span>
            </h1>
            <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Professional digital inheritance management with comprehensive asset tracking, secure document storage, 
              and AI-powered personalized messaging for your loved ones.
            </p>
            
            {/* Key Features Highlight */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200">
                <Wallet className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-slate-700">Asset Management</span>
              </div>
              <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200">
                <Shield className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-slate-700">Bank-Level Security</span>
              </div>
              <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200">
                <User className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-slate-700">Avatar Video Message</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={onLogin}
                className="bg-slate-900 text-white px-8 py-4 rounded-lg hover:bg-slate-800 transition-all duration-200 text-lg font-semibold flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <span>Start Free Forever</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button 
                onClick={onViewPricing}
                className="border-2 border-slate-300 text-slate-700 px-8 py-4 rounded-lg hover:border-slate-400 hover:bg-slate-50 transition-all duration-200 text-lg font-semibold"
              >
                View Pricing
              </button>
            </div>
            <p className="text-sm text-slate-500 mt-4">
              Start with 3 free assets • No credit card required • Upgrade anytime
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Complete Digital Inheritance Solution
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Professional-grade asset management enhanced with cutting-edge AI technology for personalized family communication.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-slate-50 rounded-xl p-6 hover:bg-slate-100 transition-colors duration-200">
                  <div className="flex items-center justify-center w-12 h-12 bg-slate-900 rounded-lg mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed text-sm">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* AI Enhancement Section */}
      <section className="py-20 bg-gradient-to-r from-slate-50 to-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900">
                Enhanced with AI-Powered Personal Messages
              </h2>
              <p className="text-xl text-slate-600">
                Beyond traditional asset management, Heritage Vault lets you create personalized voice and video messages 
                that provide comfort and guidance to your loved ones when they need it most.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Mic className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">AI Voice Messages</h3>
                    <p className="text-slate-600 text-sm">Generate unlimited personalized audio messages for each asset and beneficiary using your voice.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Avatar Video Messages</h3>
                    <p className="text-slate-600 text-sm">Create lifelike video messages that look and sound like you, providing personal guidance.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Heart className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Voice-Guided Asset Entry</h3>
                    <p className="text-slate-600 text-sm">Use voice commands to quickly add and organize your assets with natural language processing.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
              <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg mb-6 flex items-center justify-center">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <Mic className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <p className="text-slate-600 font-medium">AI-Enhanced Asset Management</p>
                  <p className="text-sm text-slate-500">Professional tools with personal touch</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-slate-700">Asset tracking & organization</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-slate-700">Secure document storage</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm text-slate-700">Personalized AI messages</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Simple Steps to Secure Your Heritage
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Professional estate planning made simple with modern technology and personal touches.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-slate-900 rounded-full text-white text-2xl font-bold mb-6 mx-auto">
                1
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Inventory Your Assets</h3>
              <p className="text-slate-600">
                Add your financial accounts, property, digital assets, and important documents using voice-guided entry or traditional forms.
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-slate-900 rounded-full text-white text-2xl font-bold mb-6 mx-auto">
                2
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Designate Beneficiaries</h3>
              <p className="text-slate-600">
                Add your loved ones and specify who should receive what, with detailed instructions and conditional access rules.
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-slate-900 rounded-full text-white text-2xl font-bold mb-6 mx-auto">
                3
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Create Personal Messages</h3>
              <p className="text-slate-600">
                Record voice messages and create AI avatar videos to provide personal guidance and comfort to your beneficiaries.
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-slate-900 rounded-full text-white text-2xl font-bold mb-6 mx-auto">
                4
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Secure & Automate</h3>
              <p className="text-slate-600">
                Set access controls, time delays, and automated notifications to ensure everything happens according to your wishes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing CTA Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-slate-600 mb-8 leading-relaxed">
            Start free with 3 assets and 1 next of kin. Upgrade to Pro for unlimited storage and AI features, 
            or choose our lifetime plan for one-time payment convenience.
          </p>
          
          {/* Quick Pricing Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-2">Free Forever</h3>
              <p className="text-2xl font-bold text-slate-900 mb-2">$0</p>
              <p className="text-sm text-slate-600">3 assets • 1 next of kin</p>
            </div>
            <div className="bg-white rounded-lg p-6 border-2 border-slate-900 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white px-3 py-1 rounded-full text-xs font-medium">
                Most Popular
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Pro</h3>
              <p className="text-2xl font-bold text-slate-900 mb-2">$12<span className="text-sm text-slate-600">/month</span></p>
              <p className="text-sm text-slate-600">Unlimited • AI features</p>
            </div>
            <div className="bg-white rounded-lg p-6 border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-2">Forever</h3>
              <p className="text-2xl font-bold text-slate-900 mb-2">$89<span className="text-sm text-slate-600"> one-time</span></p>
              <p className="text-sm text-slate-600">Lifetime access</p>
            </div>
          </div>

          <button
            onClick={onViewPricing}
            className="bg-slate-900 text-white px-8 py-4 rounded-lg hover:bg-slate-800 transition-all duration-200 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            View All Plans & Features
          </button>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Trusted by Professionals and Families
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              See what estate planning professionals and families are saying about Heritage Vault's comprehensive approach.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-slate-50 rounded-xl p-8 shadow-sm">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-slate-700 mb-6 italic leading-relaxed">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold text-slate-900">{testimonial.name}</p>
                  <p className="text-slate-600 text-sm">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Start Protecting Your Family's Future Today
          </h2>
          <p className="text-xl text-slate-300 mb-8 leading-relaxed">
            Join thousands of families who have secured their digital heritage with professional asset management 
            and personalized AI messaging. Your loved ones will thank you for the peace of mind.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <button
              onClick={onLogin}
              className="bg-white text-slate-900 px-8 py-4 rounded-lg hover:bg-slate-100 transition-all duration-200 text-lg font-semibold inline-flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <span>Start Free Forever</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button className="border-2 border-slate-300 text-slate-300 px-8 py-4 rounded-lg hover:border-white hover:text-white transition-all duration-200 text-lg font-semibold">
              Watch Demo
            </button>
          </div>
          <p className="text-slate-400 text-sm">
            No credit card required • Start with 3 free assets • Upgrade anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-800 text-slate-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex items-center justify-center w-8 h-8 bg-white rounded-lg">
                  <Shield className="w-5 h-5 text-slate-900" />
                </div>
                <span className="text-white font-bold">Heritage Vault</span>
              </div>
              <p className="text-sm">
                Professional digital inheritance management with AI-enhanced personal messaging.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Asset Management</a></li>
                <li><a href="#" className="hover:text-white transition-colors">AI Voice Messages</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                <li><button onClick={onViewPricing} className="hover:text-white transition-colors">Pricing</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Enterprise</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">For Lawyers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">For Hospitals</a></li>
                <li><a href="#" className="hover:text-white transition-colors">For Churches</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Partner Program</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2024 Heritage Vault. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;