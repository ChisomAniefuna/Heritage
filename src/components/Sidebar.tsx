import React from 'react';
import { Home, Wallet, Users, FileText, Clock, Bell } from 'lucide-react';

interface SidebarProps {
  currentView: 'dashboard' | 'assets' | 'contacts' | 'documents' | 'events' | 'notifications';
  setCurrentView: (view: 'dashboard' | 'assets' | 'contacts' | 'documents' | 'events' | 'notifications') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'assets', label: 'Assets', icon: Wallet },
    { id: 'contacts', label: 'Contacts', icon: Users },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'events', label: 'Events', icon: Clock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ] as const;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-screen">
      <nav className="p-4">
        <ul className="space-y-2">
          {navItems.map(({ id, label, icon: Icon }) => (
            <li key={id}>
              <button
                onClick={() => setCurrentView(id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${
                  currentView === id
                    ? 'bg-purple-700 text-white'
                    : 'text-slate-700 hover:bg-purple-50 hover:text-purple-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;