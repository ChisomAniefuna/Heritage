import React, { useState } from 'react';
import { Shield, User, Settings, Home, LogOut, ChevronDown } from 'lucide-react';
import { User as UserType } from '../services/supabase';

interface HeaderProps {
  onGoHome?: () => void;
  onSignOut?: () => void;
  currentUser?: any;
  userProfile?: UserType | null;
}

const Header: React.FC<HeaderProps> = ({ onGoHome, onSignOut, currentUser, userProfile }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSignOut = () => {
    setShowUserMenu(false);
    if (onSignOut) {
      onSignOut();
    }
  };

  return (
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
          
          {currentUser && userProfile ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-900">{userProfile.full_name}</p>
                  <p className="text-xs text-slate-500 capitalize">{userProfile.subscription_plan} Plan</p>
                </div>
                <div className="w-8 h-8 bg-purple-700 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 top-12 bg-white border border-slate-200 rounded-lg shadow-lg py-2 w-64 z-50">
                  <div className="px-4 py-3 border-b border-slate-200">
                    <p className="font-medium text-slate-900">{userProfile.full_name}</p>
                    <p className="text-sm text-slate-600">{userProfile.email}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        userProfile.account_status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {userProfile.account_status}
                      </span>
                      <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full capitalize">
                        {userProfile.subscription_plan}
                      </span>
                    </div>
                  </div>
                  
                  <button className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center space-x-2">
                    <Settings className="w-4 h-4" />
                    <span>Account Settings</span>
                  </button>
                  
                  <button className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </button>
                  
                  <div className="border-t border-slate-200 mt-2 pt-2">
                    <button 
                      onClick={handleSignOut}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">Guest User</p>
                <p className="text-xs text-slate-500">Demo Mode</p>
              </div>
              <div className="w-8 h-8 bg-slate-400 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;