import React, { useState } from 'react';
import { Plus, Bell, Clock, Users, Settings, ToggleLeft as Toggle, Trash2, Edit } from 'lucide-react';
import { NotificationRule, Contact } from '../types';

interface NotificationRulesViewProps {
  rules: NotificationRule[];
  contacts: Contact[];
  onAddRule: (rule: Omit<NotificationRule, 'id'>) => void;
  onUpdateRule: (rule: NotificationRule) => void;
  onDeleteRule: (ruleId: string) => void;
}

const NotificationRulesView: React.FC<NotificationRulesViewProps> = ({ 
  rules, 
  contacts, 
  onAddRule, 
  onUpdateRule, 
  onDeleteRule 
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRule, setEditingRule] = useState<NotificationRule | null>(null);

  const AddRuleModal: React.FC<{ rule?: NotificationRule; onClose: () => void }> = ({ rule, onClose }) => {
    const [formData, setFormData] = useState({
      name: rule?.name || '',
      trigger: rule?.trigger || 'immediate' as NotificationRule['trigger'],
      recipients: rule?.recipients || [],
      message: rule?.message || '',
      frequency: rule?.frequency || 'once' as NotificationRule['frequency'],
      isActive: rule?.isActive ?? true
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (rule) {
        onUpdateRule({ ...rule, ...formData });
      } else {
        onAddRule(formData);
      }
      onClose();
    };

    const handleRecipientChange = (contactName: string, checked: boolean) => {
      if (checked) {
        setFormData({
          ...formData,
          recipients: [...formData.recipients, contactName]
        });
      } else {
        setFormData({
          ...formData,
          recipients: formData.recipients.filter(name => name !== contactName)
        });
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">
              {rule ? 'Edit' : 'Add'} Notification Rule
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Rule Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., Emergency Contact Notification"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Trigger *
              </label>
              <select
                value={formData.trigger}
                onChange={(e) => setFormData({ ...formData, trigger: e.target.value as NotificationRule['trigger'] })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="immediate">Immediate</option>
                <option value="time_based">Time Based</option>
                <option value="condition_met">When Condition Met</option>
                <option value="manual">Manual Trigger</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Recipients *
              </label>
              <div className="space-y-2 max-h-32 overflow-y-auto border border-slate-300 rounded-lg p-3">
                {contacts.map(contact => (
                  <label key={contact.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.recipients.includes(contact.name)}
                      onChange={(e) => handleRecipientChange(contact.name, e.target.checked)}
                      className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-slate-700">{contact.name}</span>
                    <span className="text-xs text-slate-500">({contact.email})</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Message *
              </label>
              <textarea
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter the notification message..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Frequency
              </label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value as NotificationRule['frequency'] })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="once">Once</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
              />
              <label className="text-sm text-slate-700">
                Active (rule will trigger automatically)
              </label>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                {rule ? 'Update' : 'Create'} Rule
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const RuleCard: React.FC<{ rule: NotificationRule }> = ({ rule }) => (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${rule.isActive ? 'bg-green-100' : 'bg-slate-100'}`}>
            <Bell className={`w-5 h-5 ${rule.isActive ? 'text-green-600' : 'text-slate-600'}`} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">{rule.name}</h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`px-2 py-1 text-xs rounded-full ${
                rule.isActive ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'
              }`}>
                {rule.isActive ? 'Active' : 'Inactive'}
              </span>
              <span className="text-xs text-slate-500">{rule.trigger.replace('_', ' ')}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setEditingRule(rule)}
            className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDeleteRule(rule.id)}
            className="p-1 text-slate-400 hover:text-red-600 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Users className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-600">
            Recipients: {rule.recipients.join(', ')}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-600">
            Frequency: {rule.frequency}
          </span>
        </div>

        <div className="pt-2 border-t border-slate-100">
          <p className="text-sm text-slate-600">{rule.message}</p>
        </div>

        {rule.lastSent && (
          <div className="pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              Last sent: {new Date(rule.lastSent).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-4">
        <button
          onClick={() => onUpdateRule({ ...rule, isActive: !rule.isActive })}
          className={`flex items-center space-x-1 text-sm transition-colors ${
            rule.isActive 
              ? 'text-red-600 hover:text-red-700' 
              : 'text-green-600 hover:text-green-700'
          }`}
        >
          <Toggle className="w-4 h-4" />
          <span>{rule.isActive ? 'Deactivate' : 'Activate'}</span>
        </button>
        
        <button className="px-3 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors">
          Test Send
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Notification Rules</h2>
          <p className="text-slate-600 mt-1">Manage automated notifications for beneficiaries and contacts</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Rule</span>
        </button>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {rules.map(rule => (
          <RuleCard key={rule.id} rule={rule} />
        ))}
      </div>

      {rules.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bell className="w-8 h-8 text-purple-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">No notification rules</h3>
          <p className="text-slate-600 mb-4">
            Create automated notification rules to keep your beneficiaries informed
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Create Your First Rule
          </button>
        </div>
      )}

      {showAddModal && (
        <AddRuleModal onClose={() => setShowAddModal(false)} />
      )}

      {editingRule && (
        <AddRuleModal 
          rule={editingRule} 
          onClose={() => setEditingRule(null)} 
        />
      )}
    </div>
  );
};

export default NotificationRulesView;