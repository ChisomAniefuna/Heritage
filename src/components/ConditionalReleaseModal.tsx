import React, { useState } from 'react';
import { X, Clock, Shield, Users, Calendar, AlertTriangle, Plus, Trash2 } from 'lucide-react';
import { ReleaseCondition, Contact } from '../types';

interface ConditionalReleaseModalProps {
  contacts: Contact[];
  existingConditions?: ReleaseCondition[];
  onSave: (conditions: ReleaseCondition[]) => void;
  onClose: () => void;
}

const ConditionalReleaseModal: React.FC<ConditionalReleaseModalProps> = ({ 
  contacts, 
  existingConditions = [], 
  onSave, 
  onClose 
}) => {
  const [conditions, setConditions] = useState<ReleaseCondition[]>(existingConditions);

  const conditionTypes = [
    {
      id: 'time_delay',
      label: 'Time Delay',
      icon: Clock,
      description: 'Release after a specified number of days'
    },
    {
      id: 'death_certificate',
      label: 'Death Certificate',
      icon: Shield,
      description: 'Require official death certificate verification'
    },
    {
      id: 'legal_verification',
      label: 'Legal Verification',
      icon: Shield,
      description: 'Require legal professional verification'
    },
    {
      id: 'multi_party_approval',
      label: 'Multi-Party Approval',
      icon: Users,
      description: 'Require approval from multiple designated parties'
    },
    {
      id: 'specific_date',
      label: 'Specific Date',
      icon: Calendar,
      description: 'Release on a predetermined date'
    },
    {
      id: 'age_requirement',
      label: 'Age Requirement',
      icon: AlertTriangle,
      description: 'Beneficiary must reach a certain age'
    }
  ] as const;

  const addCondition = (type: ReleaseCondition['type']) => {
    const newCondition: ReleaseCondition = {
      id: Date.now().toString(),
      type,
      description: '',
      parameters: {},
      status: 'pending',
      createdDate: new Date().toISOString().split('T')[0]
    };
    setConditions([...conditions, newCondition]);
  };

  const updateCondition = (id: string, updates: Partial<ReleaseCondition>) => {
    setConditions(conditions.map(condition => 
      condition && condition.id === id ? { ...condition, ...updates } : condition
    ).filter(Boolean)); // Filter out any null conditions
  };

  const removeCondition = (id: string) => {
    setConditions(conditions.filter(condition => condition && condition.id !== id));
  };

  const renderConditionForm = (condition: ReleaseCondition) => {
    // Add defensive check for null condition
    if (!condition) {
      return null;
    }

    const typeInfo = conditionTypes.find(t => t.id === condition.type);
    const Icon = typeInfo?.icon || Clock;

    return (
      <div key={condition.id} className="border border-slate-200 rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon className="w-5 h-5 text-slate-600" />
            <h4 className="font-medium text-slate-900">{typeInfo?.label || 'Unknown Type'}</h4>
          </div>
          <button
            onClick={() => removeCondition(condition.id)}
            className="p-1 text-slate-400 hover:text-red-600 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Description
          </label>
          <input
            type="text"
            value={condition.description || ''}
            onChange={(e) => updateCondition(condition.id, { description: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            placeholder="Describe this condition..."
          />
        </div>

        {condition.type === 'time_delay' && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Delay (Days)
            </label>
            <input
              type="number"
              value={condition.parameters?.delayDays || ''}
              onChange={(e) => updateCondition(condition.id, {
                parameters: { ...condition.parameters, delayDays: parseInt(e.target.value) }
              })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              placeholder="Number of days to wait"
            />
          </div>
        )}

        {condition.type === 'multi_party_approval' && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Required Approvers
              </label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {contacts.filter(contact => contact).map(contact => (
                  <label key={contact.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={condition.parameters?.requiredApprovers?.includes(contact.name) || false}
                      onChange={(e) => {
                        const approvers = condition.parameters?.requiredApprovers || [];
                        const newApprovers = e.target.checked
                          ? [...approvers, contact.name]
                          : approvers.filter(name => name !== contact.name);
                        updateCondition(condition.id, {
                          parameters: { ...condition.parameters, requiredApprovers: newApprovers }
                        });
                      }}
                      className="rounded border-slate-300 text-slate-900 focus:ring-slate-500"
                    />
                    <span className="text-sm text-slate-700">{contact.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Minimum Approvals Required
              </label>
              <input
                type="number"
                value={condition.parameters?.minimumApprovals || ''}
                onChange={(e) => updateCondition(condition.id, {
                  parameters: { ...condition.parameters, minimumApprovals: parseInt(e.target.value) }
                })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                placeholder="Minimum number of approvals needed"
              />
            </div>
          </div>
        )}

        {condition.type === 'specific_date' && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Release Date
            </label>
            <input
              type="date"
              value={condition.parameters?.specificDate || ''}
              onChange={(e) => updateCondition(condition.id, {
                parameters: { ...condition.parameters, specificDate: e.target.value }
              })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            />
          </div>
        )}

        {condition.type === 'age_requirement' && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Required Age
            </label>
            <input
              type="number"
              value={condition.parameters?.requiredAge || ''}
              onChange={(e) => updateCondition(condition.id, {
                parameters: { ...condition.parameters, requiredAge: parseInt(e.target.value) }
              })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              placeholder="Minimum age required"
            />
          </div>
        )}

        {(condition.type === 'death_certificate' || condition.type === 'legal_verification') && (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={condition.parameters?.legalDocumentRequired || false}
              onChange={(e) => updateCondition(condition.id, {
                parameters: { ...condition.parameters, legalDocumentRequired: e.target.checked }
              })}
              className="rounded border-slate-300 text-slate-900 focus:ring-slate-500"
            />
            <label className="text-sm text-slate-700">
              Require notarized legal documentation
            </label>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">Conditional Release Settings</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-medium text-slate-900 mb-4">Add Release Conditions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {conditionTypes.map(type => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => addCondition(type.id)}
                    className="flex items-start space-x-3 p-4 border border-slate-200 rounded-lg hover:border-slate-300 hover:bg-slate-50 transition-colors text-left"
                  >
                    <Icon className="w-5 h-5 text-slate-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-slate-900 text-sm">{type.label}</h4>
                      <p className="text-xs text-slate-600 mt-1">{type.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {conditions.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-slate-900 mb-4">Configured Conditions</h3>
              <div className="space-y-4">
                {conditions.filter(condition => condition).map(renderConditionForm)}
              </div>
            </div>
          )}

          <div className="flex space-x-3 pt-4 border-t border-slate-200">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(conditions.filter(condition => condition))}
              className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              Save Conditions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConditionalReleaseModal;