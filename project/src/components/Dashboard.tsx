import React from 'react';
import { Wallet, Users, FileText, TrendingUp, Shield, Clock } from 'lucide-react';
import { Asset, Contact, Document } from '../types';

interface DashboardProps {
  assets: Asset[];
  contacts: Contact[];
  documents: Document[];
}

const Dashboard: React.FC<DashboardProps> = ({ assets, contacts, documents }) => {
  const totalAssetValue = assets.reduce((total, asset) => {
    const value = asset.value.replace(/[^0-9.-]/g, '');
    return isNaN(parseFloat(value)) ? total : total + parseFloat(value);
  }, 0);

  const primaryBeneficiaries = contacts.filter(contact => contact.isPrimaryBeneficiary);
  const recentActivity = [
    { action: 'Updated Investment Portfolio - Fidelity', date: '2024-12-18', type: 'asset' },
    { action: 'Added Insurance Policies document', date: '2024-12-05', type: 'document' },
    { action: 'Updated Primary Checking Account', date: '2024-12-20', type: 'asset' },
  ];

  const StatCard: React.FC<{ title: string; value: string; icon: React.ElementType; color: string }> = 
    ({ title, value, icon: Icon, color }) => (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Dashboard</h2>
        <p className="text-slate-600">Overview of your digital inheritance vault</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Assets"
          value={assets.length.toString()}
          icon={Wallet}
          color="bg-blue-600"
        />
        <StatCard
          title="Asset Value"
          value={`$${totalAssetValue.toLocaleString()}`}
          icon={TrendingUp}
          color="bg-green-600"
        />
        <StatCard
          title="Beneficiaries"
          value={primaryBeneficiaries.length.toString()}
          icon={Users}
          color="bg-purple-600"
        />
        <StatCard
          title="Documents"
          value={documents.length.toString()}
          icon={FileText}
          color="bg-orange-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Clock className="w-5 h-5 text-slate-600" />
            <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  activity.type === 'asset' ? 'bg-blue-600' : 
                  activity.type === 'document' ? 'bg-orange-600' : 'bg-purple-600'
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">{activity.action}</p>
                  <p className="text-xs text-slate-500">{activity.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security Status */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Shield className="w-5 h-5 text-slate-600" />
            <h3 className="text-lg font-semibold text-slate-900">Security Overview</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Account Security</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Secure</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Backup Status</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Current</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Document Encryption</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Enabled</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Emergency Contacts</span>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Review Needed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center space-x-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <Wallet className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-slate-900">Add New Asset</span>
          </button>
          <button className="flex items-center space-x-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <Users className="w-5 h-5 text-purple-600" />
            <span className="font-medium text-slate-900">Add Beneficiary</span>
          </button>
          <button className="flex items-center space-x-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <FileText className="w-5 h-5 text-orange-600" />
            <span className="font-medium text-slate-900">Upload Document</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;