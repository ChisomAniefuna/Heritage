import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import AssetsView from './components/AssetsView';
import ContactsView from './components/ContactsView';
import DocumentsView from './components/DocumentsView';
import InheritanceEventsView from './components/InheritanceEventsView';
import NotificationRulesView from './components/NotificationRulesView';
import Homepage from './components/Homepage';
import PricingPage from './components/PricingPage';
import CheckinPage from './components/CheckinPage';
import SignUpPage from './components/SignUpPage';
import SignInPage from './components/SignInPage';
import { Asset, Contact, Document, InheritanceEvent, NotificationRule } from './types';
import { supabaseAuth, supabaseData, User } from './services/supabase';

function App() {
  const [currentPage, setCurrentPage] = useState<'homepage' | 'pricing' | 'app' | 'checkin' | 'signup' | 'signin'>('homepage');
  const [currentView, setCurrentView] = useState<'dashboard' | 'assets' | 'contacts' | 'documents' | 'events' | 'notifications'>('dashboard');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Data states - these will be loaded from Supabase
  const [assets, setAssets] = useState<Asset[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [inheritanceEvents, setInheritanceEvents] = useState<InheritanceEvent[]>([]);
  const [notificationRules, setNotificationRules] = useState<NotificationRule[]>([]);

  useEffect(() => {
    // Check for existing session on app load
    checkAuthState();
    
    // Listen for auth changes
    const { data: { subscription } } = supabaseAuth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await handleUserSignIn(session.user);
      } else if (event === 'SIGNED_OUT') {
        handleUserSignOut();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAuthState = async () => {
    try {
      const user = await supabaseAuth.getCurrentUser();
      if (user) {
        await handleUserSignIn(user);
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserSignIn = async (user: any) => {
    setCurrentUser(user);
    
    // Load user profile
    const profile = await supabaseAuth.getUserProfile(user.id);
    setUserProfile(profile);
    
    // Load user data
    await loadUserData(user.id);
    
    setCurrentPage('app');
    setCurrentView('dashboard');
  };

  const handleUserSignOut = () => {
    setCurrentUser(null);
    setUserProfile(null);
    setAssets([]);
    setContacts([]);
    setDocuments([]);
    setInheritanceEvents([]);
    setNotificationRules([]);
    setCurrentPage('homepage');
    setCurrentView('dashboard');
  };

  const loadUserData = async (userId: string) => {
    try {
      // Load all user data from Supabase
      const [userAssets, userContacts, userDocuments] = await Promise.all([
        supabaseData.getUserAssets(userId),
        supabaseData.getUserContacts(userId),
        supabaseData.getUserDocuments(userId)
      ]);

      // Convert Supabase data to app format
      setAssets(userAssets.map(asset => ({
        id: asset.id,
        name: asset.name,
        category: asset.category,
        type: asset.type,
        value: asset.value,
        location: asset.location,
        instructions: asset.instructions,
        beneficiaries: asset.beneficiaries || [],
        dateAdded: asset.created_at.split('T')[0],
        lastUpdated: asset.updated_at.split('T')[0],
        releaseConditions: asset.release_conditions || []
      })));

      setContacts(userContacts.map(contact => ({
        id: contact.id,
        name: contact.name,
        relationship: contact.relationship,
        email: contact.email,
        phone: contact.phone,
        address: contact.address,
        isPrimaryBeneficiary: contact.is_primary_beneficiary,
        dateAdded: contact.created_at.split('T')[0],
        emergencyContact: contact.is_emergency_contact,
        verificationMethod: contact.verification_method
      })));

      setDocuments(userDocuments.map(doc => ({
        id: doc.id,
        name: doc.name,
        category: doc.category,
        type: doc.type,
        size: doc.size,
        location: doc.location,
        description: doc.description,
        dateAdded: doc.created_at.split('T')[0],
        lastUpdated: doc.updated_at.split('T')[0],
        accessLevel: doc.access_level
      })));

      // Mock inheritance events and notification rules for now
      setInheritanceEvents([]);
      setNotificationRules([]);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabaseAuth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleUpdateEvent = (updatedEvent: InheritanceEvent) => {
    setInheritanceEvents(events => 
      events.map(event => 
        event.id === updatedEvent.id ? updatedEvent : event
      )
    );
  };

  const handleAddNotificationRule = (rule: Omit<NotificationRule, 'id'>) => {
    const newRule: NotificationRule = {
      ...rule,
      id: Date.now().toString()
    };
    setNotificationRules([...notificationRules, newRule]);
  };

  const handleUpdateNotificationRule = (updatedRule: NotificationRule) => {
    setNotificationRules(rules => 
      rules.map(rule => 
        rule.id === updatedRule.id ? updatedRule : rule
      )
    );
  };

  const handleDeleteNotificationRule = (ruleId: string) => {
    setNotificationRules(rules => rules.filter(rule => rule.id !== ruleId));
  };

  const handleLogin = () => {
    setCurrentPage('signin');
  };

  const handleSignUp = () => {
    setCurrentPage('signup');
  };

  const handleGoHome = () => {
    setCurrentPage('homepage');
    setCurrentView('dashboard');
  };

  const handleViewPricing = () => {
    setCurrentPage('pricing');
  };

  const handleBackToHome = () => {
    setCurrentPage('homepage');
  };

  const handleGoToCheckin = () => {
    setCurrentPage('checkin');
  };

  const handleBackFromCheckin = () => {
    setCurrentPage('app');
    setCurrentView('dashboard');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'assets':
        return <AssetsView assets={assets} setAssets={setAssets} contacts={contacts} />;
      case 'contacts':
        return <ContactsView contacts={contacts} setContacts={setContacts} />;
      case 'documents':
        return <DocumentsView documents={documents} setDocuments={setDocuments} />;
      case 'events':
        return (
          <InheritanceEventsView 
            events={inheritanceEvents}
            assets={assets}
            contacts={contacts}
            documents={documents}
            onUpdateEvent={handleUpdateEvent}
          />
        );
      case 'notifications':
        return (
          <NotificationRulesView
            rules={notificationRules}
            contacts={contacts}
            onAddRule={handleAddNotificationRule}
            onUpdateRule={handleUpdateNotificationRule}
            onDeleteRule={handleDeleteNotificationRule}
          />
        );
      default:
        return <Dashboard assets={assets} contacts={contacts} documents={documents} />;
    }
  };

  // Show loading screen while checking auth state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading Heritage Vault...</p>
        </div>
      </div>
    );
  }

  if (currentPage === 'homepage') {
    return <Homepage onLogin={handleLogin} onViewPricing={handleViewPricing} onSignUp={handleSignUp} />;
  }

  if (currentPage === 'pricing') {
    return <PricingPage onBack={handleBackToHome} onLogin={handleLogin} />;
  }

  if (currentPage === 'signup') {
    return (
      <SignUpPage 
        onBack={handleBackToHome}
        onSignUpSuccess={handleUserSignIn}
        onSwitchToSignIn={() => setCurrentPage('signin')}
      />
    );
  }

  if (currentPage === 'signin') {
    return (
      <SignInPage 
        onBack={handleBackToHome}
        onSignInSuccess={handleUserSignIn}
        onSwitchToSignUp={() => setCurrentPage('signup')}
      />
    );
  }

  if (currentPage === 'checkin') {
    return <CheckinPage onBack={handleBackFromCheckin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header 
        onGoHome={handleGoHome} 
        onSignOut={handleSignOut}
        currentUser={currentUser}
        userProfile={userProfile}
      />
      <div className="flex">
        <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
        <main className="flex-1 p-6">
          {renderCurrentView()}
        </main>
      </div>
    </div>
  );
}

export default App;