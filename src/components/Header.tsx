import React, { useState } from 'react';
import { Shield, User, Settings, Home, Lock } from 'lucide-react';
import BlockchainSecurityPanel from './BlockchainSecurityPanel';

interface HeaderProps {
  onGoHome?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onGoHome }) => {
  const [showSecurityPanel, setShowSecurityPanel] = useState(false);

  return (
    <>
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-purple-700 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Heritage Vault</h1>
              <p className="text-sm text-slate-500">Digital Inheritance Management</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {onGoHome && (
              <button
                onClick={onGoHome}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                title="Go to Homepage"
              >
                <Home className="w-5 h-5" />
              </button>
            )}
            <button 
              onClick={() => setShowSecurityPanel(true)}
              className="flex items-center space-x-2 px-3 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors"
              title="Blockchain Security"
            >
              <Lock className="w-4 h-4" />
              <span className="text-sm font-medium">Blockchain Secured</span>
            </button>
            <button className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
              <Settings className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">Aniefuna Chisom</p>
                <p className="text-xs text-slate-500">Account Owner</p>
              </div>
              <div className="w-8 h-8 bg-purple-700 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {showSecurityPanel && (
        <BlockchainSecurityPanel onClose={() => setShowSecurityPanel(false)} />
      )}
    </>
  );
};

export default Header;