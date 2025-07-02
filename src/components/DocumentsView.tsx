import React, { useState } from 'react';
import { Plus, Search, Filter, FileText, Shield, DollarSign, Heart, Stethoscope, Calendar, Download, Eye } from 'lucide-react';
import { Document } from '../types';

interface DocumentsViewProps {
  documents: Document[];
  setDocuments: (documents: Document[]) => void;
}

const DocumentsView: React.FC<DocumentsViewProps> = ({ documents, setDocuments }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Documents', icon: null },
    { id: 'legal', label: 'Legal', icon: Shield },
    { id: 'financial', label: 'Financial', icon: DollarSign },
    { id: 'insurance', label: 'Insurance', icon: Shield },
    { id: 'personal', label: 'Personal', icon: Heart },
    { id: 'medical', label: 'Medical', icon: Stethoscope },
  ];

  const filteredDocuments = documents.filter(document => {
    if (!document) return false; // Add null check
    const matchesSearch = (document.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (document.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || document.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'legal': return 'bg-blue-100 text-blue-800';
      case 'financial': return 'bg-green-100 text-green-800';
      case 'insurance': return 'bg-purple-100 text-purple-800';
      case 'personal': return 'bg-pink-100 text-pink-800';
      case 'medical': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const DocumentCard: React.FC<{ document: Document }> = ({ document }) => {
    // Add defensive check for null document
    if (!document) {
      return null;
    }

    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-slate-100 rounded-lg">
              <FileText className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">{document.name || 'Unnamed Document'}</h3>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(document.category || '')}`}>
                  {document.category || 'uncategorized'}
                </span>
                <span className="text-xs text-slate-500">{document.type || 'Unknown Type'}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-1 text-slate-400 hover:text-slate-600 transition-colors">
              <Eye className="w-4 h-4" />
            </button>
            <button className="p-1 text-slate-400 hover:text-slate-600 transition-colors">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-slate-600">{document.description || 'No description available'}</p>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Size: {document.size || 'Unknown'}</span>
            <span className="text-xs text-slate-500">Location: {document.location || 'Not specified'}</span>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span className="text-xs text-slate-500">
                Updated {document.lastUpdated ? new Date(document.lastUpdated).toLocaleDateString() : 'Unknown'}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Documents</h2>
          <p className="text-slate-600 mt-1">Manage important documents and files</p>
        </div>
        <button className="flex items-center space-x-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors">
          <Plus className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2 overflow-x-auto">
            <Filter className="w-4 h-4 text-slate-600 flex-shrink-0" />
            {categories.map(category => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    selectedCategory === category.id
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  <span>{category.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredDocuments.map(document => (
          <DocumentCard key={document?.id || Math.random()} document={document} />
        ))}
      </div>

      {filteredDocuments.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">No documents found</h3>
          <p className="text-slate-600 mb-4">
            {searchTerm || selectedCategory !== 'all' 
              ? 'Try adjusting your search or filters' 
              : 'Get started by uploading your first document'}
          </p>
          {!searchTerm && selectedCategory === 'all' && (
            <button className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors">
              Upload Your First Document
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default DocumentsView;