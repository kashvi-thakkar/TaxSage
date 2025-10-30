import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Import the NEW caApi from our updated apiService
import { caApi } from '../services/apiService.js'; 

const CAClients = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      // This now calls your REAL backend API using the 'caApi' instance
      const response = await caApi.getClients();
      setClients(response.data);
    } catch (error) {
      console.error('Error loading clients:', error);
      // Handle error (e.g., show a toast notification)
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(client => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = client.name.toLowerCase().includes(searchLower) ||
                         client.email.toLowerCase().includes(searchLower) ||
                         client.pan.toLowerCase().includes(searchLower);
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending_review': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'filed': return 'bg-green-100 text-green-800 border-green-200';
      case 'action_required': return 'bg-red-100 text-red-800 border-red-200';
      case 'no_filings': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  const getStatusText = (status) => {
    switch (status) {
      case 'pending_review': return 'Under Review';
      case 'approved': return 'Approved';
      case 'filed': return 'Filed';
      case 'action_required': return 'Action Required';
      case 'no_filings': return 'No Filings';
      case 'draft': return 'Draft';
      default: return status;
    }
  };

  const handleViewClient = (clientId) => {
    // We will build this page later
    // navigate(`/ca/clients/${clientId}`);
    alert(`Navigating to profile for client ID: ${clientId}`);
  };

  const handleSendMessage = (client) => {
    alert(`Send message to ${client.name} at ${client.email}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF7DD] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#80A1BA] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading clients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF7DD]">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/ca/dashboard')}
                className="flex items-center text-gray-500 hover:text-[#80A1BA] transition-colors font-medium"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Dashboard
              </button>
              <div className="h-6 w-px bg-gray-200"></div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Client Management</h1>
                <p className="text-sm text-gray-500">Manage your client relationships</p>
              </div>
            </div>
            <button className="bg-gradient-to-r from-[#80A1BA] to-[#91C4C3] text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300 hover:scale-105">
              Add New Client
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search clients by name, email, or PAN..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#80A1BA] focus:border-[#80A1BA] transition-colors bg-gray-50"
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#80A1BA] focus:border-[#80A1BA] transition-colors bg-gray-50"
              >
                <option value="all">All Status</option>
                <option value="pending_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="filed">Filed</option>
                <option value="action_required">Action Required</option>
                <option value="draft">Draft</option>
                <option value="no_filings">No Filings</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="text-3xl font-bold text-gray-900">{clients.length}</div>
            <div className="text-sm text-gray-500">Total Clients</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="text-3xl font-bold text-green-600">
              {clients.filter(c => c.status !== 'no_filings').length}
            </div>
            <div className="text-sm text-gray-500">Active Clients</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="text-3xl font-bold text-[#80A1BA]">
              {clients.filter(c => c.status === 'filed').length}
            </div>
            <div className="text-sm text-gray-500">Total Filings</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="text-3xl font-bold text-yellow-600">
              {clients.filter(c => c.status === 'pending_review').length}
            </div>
            <div className="text-sm text-gray-500">Pending Actions</div>
          </div>
        </div>

        {/* Clients Grid */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="px-6 py-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                Clients ({filteredClients.length})
              </h2>
              <span className="text-sm text-gray-500">
                Showing {filteredClients.length} of {clients.length} clients
              </span>
            </div>
          </div>

          <div className="p-6">
            {filteredClients.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClients.map((client) => (
                  <div key={client.id} className="border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50 group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-[#80A1BA] to-[#91C4C3] rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                          <span className="text-white font-semibold text-sm">
                            {client.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">{client.name}</h3>
                          <p className="text-sm text-gray-500">{client.email}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(client.status)}`}>
                        {getStatusText(client.status)}
                      </span>
                    </div>

                    <div className="space-y-3 text-sm text-gray-600 mb-6">
                      <div className="flex justify-between">
                        <span>PAN:</span>
                        <span className="font-mono text-gray-900">{client.pan}</span>
                      </div>
                      {client.lastFiling && (
                        <div className="flex justify-between">
                          <span>Last Filing:</span>
                          <span className="text-gray-900">{new Date(client.lastFiling).toLocaleDateString('en-IN')}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleViewClient(client.id)}
                        className="flex-1 bg-gradient-to-r from-[#80A1BA] to-[#91C4C3] text-white py-2.5 px-3 rounded-xl text-sm font-medium hover:shadow-lg transition-all duration-300 hover:scale-105"
                      >
                        View Profile
                      </button>
                      <button
                        onClick={() => handleSendMessage(client)}
                        className="flex-1 border border-gray-300 text-gray-700 py-2.5 px-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                      >
                        Message
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">👥</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No clients found</h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your search criteria' 
                    : 'Your assigned clients will appear here.'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CAClients;