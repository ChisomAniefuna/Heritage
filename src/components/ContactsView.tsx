import React, { useState } from 'react';
import { Plus, Search, Users, Phone, Mail, MapPin, Crown } from 'lucide-react';
import { Contact } from '../types';

interface ContactsViewProps {
  contacts: Contact[];
  setContacts: (contacts: Contact[]) => void;
}

const ContactsView: React.FC<ContactsViewProps> = ({ contacts, setContacts }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.relationship.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const primaryBeneficiaries = filteredContacts.filter(contact => contact.isPrimaryBeneficiary);
  const otherContacts = filteredContacts.filter(contact => !contact.isPrimaryBeneficiary);

  const ContactCard: React.FC<{ contact: Contact }> = ({ contact }) => (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            contact.isPrimaryBeneficiary ? 'bg-purple-100' : 'bg-slate-100'
          }`}>
            <Users className={`w-5 h-5 ${
              contact.isPrimaryBeneficiary ? 'text-purple-600' : 'text-slate-600'
            }`} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-slate-900">{contact.name}</h3>
              {contact.isPrimaryBeneficiary && (
                <Crown className="w-4 h-4 text-yellow-600" />
              )}
            </div>
            <p className="text-sm text-slate-600">{contact.relationship}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center space-x-3">
          <Mail className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-600">{contact.email}</span>
        </div>
        <div className="flex items-center space-x-3">
          <Phone className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-600">{contact.phone}</span>
        </div>
        <div className="flex items-start space-x-3">
          <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
          <span className="text-sm text-slate-600">{contact.address}</span>
        </div>
        <div className="pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Added {new Date(contact.dateAdded).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Contacts</h2>
          <p className="text-slate-600 mt-1">Manage beneficiaries and important contacts</p>
        </div>
        <button className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
          <Plus className="w-4 h-4" />
          <span>Add Contact</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Primary Beneficiaries */}
      {primaryBeneficiaries.length > 0 && (
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <Crown className="w-5 h-5 text-yellow-600" />
            <h3 className="text-lg font-semibold text-slate-900">Primary Beneficiaries</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {primaryBeneficiaries.map(contact => (
              <ContactCard key={contact.id} contact={contact} />
            ))}
          </div>
        </div>
      )}

      {/* Other Contacts */}
      {otherContacts.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Other Contacts</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {otherContacts.map(contact => (
              <ContactCard key={contact.id} contact={contact} />
            ))}
          </div>
        </div>
      )}

      {filteredContacts.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-purple-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">No contacts found</h3>
          <p className="text-slate-600 mb-4">
            {searchTerm 
              ? 'Try adjusting your search term' 
              : 'Get started by adding your first contact'}
          </p>
          {!searchTerm && (
            <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
              Add Your First Contact
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ContactsView;