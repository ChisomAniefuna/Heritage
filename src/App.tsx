import React, { useState } from 'react';
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
import { Asset, Contact, Document, InheritanceEvent, NotificationRule } from './types';

function App() {
  const [currentPage, setCurrentPage] = useState<'homepage' | 'pricing' | 'app'>('homepage');
  const [currentView, setCurrentView] = useState<'dashboard' | 'assets' | 'contacts' | 'documents' | 'events' | 'notifications'>('dashboard');
  
  const [assets, setAssets] = useState<Asset[]>([
    {
      id: '1',
      name: 'Primary Checking Account - Chase Bank',
      category: 'financial',
      type: 'Bank Account',
      value: '$15,240',
      location: 'Chase Bank - Account #****1234',
      instructions: 'Main checking account for daily expenses. Online banking credentials stored in password manager.',
      beneficiaries: ['Onyedika Aniefuna', 'Maryjane Aniefuna'],
      dateAdded: '2024-01-15',
      lastUpdated: '2024-12-20',
      releaseConditions: [
        {
          id: '1',
          type: 'death_certificate',
          description: 'Require official death certificate before release',
          parameters: { legalDocumentRequired: true },
          status: 'pending',
          createdDate: '2024-01-15'
        },
        {
          id: '2',
          type: 'time_delay',
          description: 'Wait 30 days after death certificate verification',
          parameters: { delayDays: 30 },
          status: 'pending',
          createdDate: '2024-01-15'
        }
      ]
    },
    {
      id: '2',
      name: 'Investment Portfolio - Fidelity',
      category: 'financial',
      type: 'Investment Account',
      value: '$125,000',
      location: 'Fidelity Investments - Account #****5678',
      instructions: 'Diversified portfolio including stocks, bonds, and mutual funds. Contact advisor John Smith at (555) 123-4567.',
      beneficiaries: ['Onyedika Aniefuna'],
      dateAdded: '2024-01-10',
      lastUpdated: '2024-12-18',
      releaseConditions: [
        {
          id: '3',
          type: 'multi_party_approval',
          description: 'Require approval from spouse and attorney',
          parameters: { 
            requiredApprovers: ['Onyedika Aniefuna', 'Robert Smith, Esq.'],
            minimumApprovals: 2
          },
          status: 'pending',
          createdDate: '2024-01-10'
        }
      ]
    },
    {
      id: '3',
      name: 'Family Home',
      category: 'property',
      type: 'Real Estate',
      value: '$450,000',
      location: '123 Oak Street, Springfield, IL 62701',
      instructions: 'Primary residence. Deed and mortgage documents in safety deposit box at First National Bank.',
      beneficiaries: ['Onyedika Aniefuna', 'Maryjane Aniefuna'],
      dateAdded: '2024-01-05',
      lastUpdated: '2024-12-15'
    },
    {
      id: '4',
      name: 'Google Photos & Drive',
      category: 'digital',
      type: 'Cloud Storage',
      value: 'Priceless',
      location: 'Google Account: aniefuna.chisom@gmail.com',
      instructions: 'Contains family photos, important documents, and personal files. Enable legacy contact feature.',
      beneficiaries: ['Onyedika Aniefuna'],
      dateAdded: '2024-01-20',
      lastUpdated: '2024-12-10',
      releaseConditions: [
        {
          id: '4',
          type: 'age_requirement',
          description: 'Children must be 18 years old to access',
          parameters: { requiredAge: 18 },
          status: 'pending',
          createdDate: '2024-01-20'
        }
      ]
    }
  ]);

  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: '1',
      name: 'Onyedika Aniefuna',
      relationship: 'Sister',
      email: 'onyedika.aniefuna@email.com',
      phone: '+234 803 123 4567',
      address: '456 Pine Avenue, Lagos, Nigeria',
      isPrimaryBeneficiary: true,
      dateAdded: '2024-01-15',
      emergencyContact: true,
      verificationMethod: 'email'
    },
    {
      id: '2',
      name: 'Maryjane Aniefuna',
      relationship: 'Sister',
      email: 'maryjane.aniefuna@email.com',
      phone: '(555) 987-6543',
      address: '789 Elm Street, Chicago, IL 60601',
      isPrimaryBeneficiary: true,
      dateAdded: '2024-01-15',
      verificationMethod: 'phone'
    },
    {
      id: '3',
      name: 'Robert Smith, Esq.',
      relationship: 'Attorney',
      email: 'robert@smithlaw.com',
      phone: '(555) 555-0123',
      address: '789 Legal Lane, Springfield, IL 62701',
      isPrimaryBeneficiary: false,
      dateAdded: '2024-01-20',
      verificationMethod: 'legal'
    }
  ]);

  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      name: 'Last Will and Testament',
      category: 'legal',
      type: 'PDF',
      size: '2.4 MB',
      location: 'Safety Deposit Box + Digital Copy',
      description: 'Primary will document outlining asset distribution and guardianship arrangements.',
      dateAdded: '2024-01-10',
      lastUpdated: '2024-12-01',
      accessLevel: 'conditional'
    },
    {
      id: '2',
      name: 'Power of Attorney',
      category: 'legal',
      type: 'PDF',
      size: '1.8 MB',
      location: 'Attorney Office + Home Safe',
      description: 'Durable power of attorney for financial and healthcare decisions.',
      dateAdded: '2024-01-10',
      lastUpdated: '2024-11-15',
      accessLevel: 'immediate'
    },
    {
      id: '3',
      name: 'Insurance Policies',
      category: 'insurance',
      type: 'PDF',
      size: '5.2 MB',
      location: 'Home Office Filing Cabinet',
      description: 'Life, health, auto, and homeowners insurance policy documents.',
      dateAdded: '2024-01-12',
      lastUpdated: '2024-12-05',
      accessLevel: 'conditional'
    }
  ]);

  const [inheritanceEvents, setInheritanceEvents] = useState<InheritanceEvent[]>([
    {
      id: '1',
      type: 'asset_release',
      assetId: '1',
      beneficiaryId: '1',
      status: 'pending',
      triggeredDate: '2024-12-20',
      notes: 'Awaiting death certificate verification'
    },
    {
      id: '2',
      type: 'notification_sent',
      beneficiaryId: '2',
      status: 'completed',
      triggeredDate: '2024-12-18',
      completedDate: '2024-12-18',
      notes: 'Emergency contact notification sent successfully'
    },
    {
      id: '3',
      type: 'verification_required',
      assetId: '2',
      beneficiaryId: '1',
      status: 'in_progress',
      triggeredDate: '2024-12-19',
      notes: 'Multi-party approval process initiated'
    }
  ]);

  const [notificationRules, setNotificationRules] = useState<NotificationRule[]>([
    {
      id: '1',
      name: 'Emergency Contact Alert',
      trigger: 'immediate',
      recipients: ['Onyedika Aniefuna', 'Robert Smith, Esq.'],
      message: 'This is an automated notification regarding the Heritage Vault account. Please contact the designated executor for further instructions.',
      frequency: 'once',
      isActive: true
    },
    {
      id: '2',
      name: 'Monthly Status Update',
      trigger: 'time_based',
      recipients: ['Onyedika Aniefuna'],
      message: 'Monthly status update: All systems are functioning normally. No action required at this time.',
      frequency: 'monthly',
      isActive: true,
      lastSent: '2024-11-20'
    }
  ]);

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
    setCurrentPage('app');
    setCurrentView('dashboard');
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

  if (currentPage === 'homepage') {
    return <Homepage onLogin={handleLogin} onViewPricing={handleViewPricing} />;
  }

  if (currentPage === 'pricing') {
    return <PricingPage onBack={handleBackToHome} onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header onGoHome={handleGoHome} />
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