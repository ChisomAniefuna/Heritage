import React, { useState } from 'react';
import { Clock, CheckCircle, AlertCircle, XCircle, Eye, Filter, Calendar, User, FileText, Wallet } from 'lucide-react';
import { InheritanceEvent, Asset, Contact, Document } from '../types';

interface InheritanceEventsViewProps {
  events: InheritanceEvent[];
  assets: Asset[];
  contacts: Contact[];
  documents: Document[];
  onUpdateEvent: (event: InheritanceEvent) => void;
}

const InheritanceEventsView: React.FC<InheritanceEventsViewProps> = ({ 
  events, 
  assets, 
  contacts, 
  documents, 
  onUpdateEvent 
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  const statusOptions = [
    { id: 'all', label: 'All Events' },
    { id: 'pending', label: 'Pending' },
    { id: 'in_progress', label: 'In Progress' },
    { id: 'completed', label: 'Completed' },
    { id: 'failed', label: 'Failed' }
  ];

  const typeOptions = [
    { id: 'all', label: 'All Types' },
    { id: 'asset_release', label: 'Asset Release' },
    { id: 'document_access', label: 'Document Access' },
    { id: 'notification_sent', label: 'Notification' },
    { id: 'verification_required', label: 'Verification' }
  ];

  const filteredEvents = events.filter(event => {
    if (!event) return false; // Add null check
    const matchesStatus = selectedStatus === 'all' || event.status === selectedStatus;
    const matchesType = selectedType === 'all' || event.type === selectedType;
    return matchesStatus && matchesType;
  });

  const getStatusIcon = (status: InheritanceEvent['status']) => {
    switch (status) {
      case 'pending': return Clock;
      case 'in_progress': return AlertCircle;
      case 'completed': return CheckCircle;
      case 'failed': return XCircle;
      default: return Clock;
    }
  };

  const getStatusColor = (status: InheritanceEvent['status']) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-slate-600 bg-slate-100';
    }
  };

  const getTypeIcon = (type: InheritanceEvent['type']) => {
    switch (type) {
      case 'asset_release': return Wallet;
      case 'document_access': return FileText;
      case 'notification_sent': return Calendar;
      case 'verification_required': return User;
      default: return Clock;
    }
  };

  const getBeneficiaryName = (beneficiaryId: string) => {
    const contact = contacts.find(c => c && c.id === beneficiaryId);
    return contact?.name || 'Unknown Beneficiary';
  };

  const getAssetName = (assetId?: string) => {
    if (!assetId) return null;
    const asset = assets.find(a => a && a.id === assetId);
    return asset?.name;
  };

  const getDocumentName = (documentId?: string) => {
    if (!documentId) return null;
    const document = documents.find(d => d && d.id === documentId);
    return document?.name;
  };

  const EventCard: React.FC<{ event: InheritanceEvent }> = ({ event }) => {
    // Add defensive check for null event
    if (!event) {
      return null;
    }

    const StatusIcon = getStatusIcon(event.status || 'pending');
    const TypeIcon = getTypeIcon(event.type || 'notification_sent');
    const beneficiaryName = getBeneficiaryName(event.beneficiaryId || '');
    const assetName = getAssetName(event.assetId);
    const documentName = getDocumentName(event.documentId);

    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-slate-100 rounded-lg">
              <TypeIcon className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">
                {(event.type || 'unknown').replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </h3>
              <p className="text-xs text-slate-500">
                For: {beneficiaryName}
              </p>
            </div>
          </div>
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status || 'pending')}`}>
            <StatusIcon className="w-3 h-3" />
            <span>{(event.status || 'pending').replace('_', ' ')}</span>
          </div>
        </div>

        <div className="space-y-3">
          {assetName && (
            <div className="flex items-center space-x-2">
              <Wallet className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-600">Asset: {assetName}</span>
            </div>
          )}
          
          {documentName && (
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-600">Document: {documentName}</span>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-600">
              Triggered: {event.triggeredDate ? new Date(event.triggeredDate).toLocaleDateString() : 'Unknown'}
            </span>
          </div>

          {event.completedDate && (
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm text-slate-600">
                Completed: {new Date(event.completedDate).toLocaleDateString()}
              </span>
            </div>
          )}

          {event.notes && (
            <div className="pt-2 border-t border-slate-100">
              <p className="text-sm text-slate-600">{event.notes}</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-4">
          <button className="flex items-center space-x-1 text-sm text-slate-600 hover:text-slate-900 transition-colors">
            <Eye className="w-4 h-4" />
            <span>View Details</span>
          </button>
          
          {event.status === 'pending' && (
            <button
              onClick={() => onUpdateEvent({ ...event, status: 'in_progress' })}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start Process
            </button>
          )}
          
          {event.status === 'in_progress' && (
            <button
              onClick={() => onUpdateEvent({ ...event, status: 'completed', completedDate: new Date().toISOString() })}
              className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
            >
              Mark Complete
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Inheritance Events</h2>
        <p className="text-slate-600">Track and manage inheritance-related events and processes</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-600" />
            <span className="text-sm font-medium text-slate-700">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-1 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            >
              {statusOptions.map(option => (
                <option key={option.id} value={option.id}>{option.label}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-slate-700">Type:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-1 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            >
              {typeOptions.map(option => (
                <option key={option.id} value={option.id}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredEvents.map(event => (
          <EventCard key={event?.id || Math.random()} event={event} />
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">No events found</h3>
          <p className="text-slate-600">
            {selectedStatus !== 'all' || selectedType !== 'all' 
              ? 'Try adjusting your filters' 
              : 'Inheritance events will appear here when conditions are triggered'}
          </p>
        </div>
      )}
    </div>
  );
};

export default InheritanceEventsView;