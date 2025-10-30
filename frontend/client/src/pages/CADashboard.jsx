import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CADashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [clients, setClients] = useState([]);
  const [pendingReviews, setPendingReviews] = useState([]);
  const [stats, setStats] = useState({
    totalClients: 0,
    pendingReviews: 0,
    completedFilings: 0,
    revenue: 0
  });

  useEffect(() => {
    // Mock data - replace with actual API calls
    setClients([
      {
        id: 1,
        name: 'Rajesh Kumar',
        email: 'rajesh@email.com',
        pan: 'ABCDE1234F',
        status: 'pending_review',
        filingDate: '2024-03-15',
        assignedDate: '2024-03-10'
      },
      {
        id: 2,
        name: 'Priya Sharma',
        email: 'priya@email.com',
        pan: 'FGHIJ5678K',
        status: 'approved',
        filingDate: '2024-03-12',
        assignedDate: '2024-03-05'
      }
    ]);

    setPendingReviews([
      {
        id: 1,
        clientName: 'Rajesh Kumar',
        pan: 'ABCDE1234F',
        submittedDate: '2024-03-15',
        priority: 'high',
        documents: 5
      }
    ]);

    setStats({
      totalClients: 24,
      pendingReviews: 8,
      completedFilings: 16,
      revenue: 184000
    });
  }, []);

  const handleReviewFiling = (filingId) => {
    navigate(`/ca/review/${filingId}`);
  };

  const handleViewClient = (clientId) => {
    navigate(`/ca/clients/${clientId}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending_review': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'action_required': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending_review': return 'Under Review';
      case 'approved': return 'Approved';
      case 'action_required': return 'Action Required';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF7DD]">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-[#80A1BA] to-[#91C4C3] rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">CA</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">CA Dashboard</h1>
                <p className="text-sm text-gray-500">Welcome back, CA Priya Sharma</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-400 hover:text-[#80A1BA] transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500"></span>
              </button>
              <div className="w-10 h-10 bg-gradient-to-r from-[#80A1BA] to-[#91C4C3] rounded-full flex items-center justify-center text-white font-medium shadow-lg">
                PS
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {['Overview', 'Clients', 'Reviews', 'Documents', 'Reports'].map((tab) => (
              <button
                key={tab}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.toLowerCase()
                    ? 'border-[#80A1BA] text-[#80A1BA]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab(tab.toLowerCase())}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {[
            { title: 'Total Clients', value: stats.totalClients, icon: '👥', change: '+12%', color: 'text-gray-900' },
            { title: 'Pending Reviews', value: stats.pendingReviews, icon: '📋', change: '+3', color: 'text-yellow-600' },
            { title: 'Completed Filings', value: stats.completedFilings, icon: '✅', change: '+8', color: 'text-green-600' },
            { title: 'Revenue', value: `₹${stats.revenue.toLocaleString()}`, icon: '💰', change: '+15%', color: 'text-[#80A1BA]' },
          ].map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#80A1BA] to-[#91C4C3] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <span className="text-xl text-white">{stat.icon}</span>
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{stat.title}</dt>
                    <dd className="flex items-baseline">
                      <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                        {stat.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pending Reviews */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="px-6 py-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Pending Reviews</h3>
              <p className="mt-1 text-sm text-gray-500">Tax filings requiring your attention</p>
            </div>
            <div className="p-6">
              {pendingReviews.length > 0 ? (
                <div className="space-y-4">
                  {pendingReviews.map((review) => (
                    <div key={review.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-300 group">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-gradient-to-r from-[#80A1BA] to-[#91C4C3] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <span className="text-white font-medium text-sm">
                              {review.clientName.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{review.clientName}</p>
                          <p className="text-sm text-gray-500">PAN: {review.pan}</p>
                          <p className="text-xs text-gray-400">Submitted: {new Date(review.submittedDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                          review.priority === 'high' ? 'bg-red-100 text-red-800 border-red-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                        }`}>
                          {review.priority === 'high' ? 'High Priority' : 'Normal'}
                        </span>
                        <button
                          onClick={() => handleReviewFiling(review.id)}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-[#80A1BA] to-[#91C4C3] hover:shadow-lg transition-all duration-300 hover:scale-105"
                        >
                          Review
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-5xl mb-3">📋</div>
                  <p className="text-gray-500 font-medium">No pending reviews</p>
                  <p className="text-gray-400 text-sm">All caught up!</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Clients */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="px-6 py-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Recent Clients</h3>
              <p className="mt-1 text-sm text-gray-500">Recently assigned clients</p>
            </div>
            <div className="p-6">
              {clients.length > 0 ? (
                <div className="space-y-4">
                  {clients.map((client) => (
                    <div key={client.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-300 group">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-gradient-to-r from-[#80A1BA] to-[#91C4C3] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <span className="text-white font-medium text-sm">
                              {client.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{client.name}</p>
                          <p className="text-sm text-gray-500">{client.email}</p>
                          <p className="text-xs text-gray-400">PAN: {client.pan}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(client.status)}`}>
                          {getStatusText(client.status)}
                        </span>
                        <button
                          onClick={() => handleViewClient(client.id)}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-5xl mb-3">👥</div>
                  <p className="text-gray-500 font-medium">No clients assigned</p>
                  <p className="text-gray-400 text-sm">Clients will appear here when assigned</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="px-6 py-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <button className="inline-flex items-center justify-center px-6 py-4 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-[#80A1BA] to-[#91C4C3] hover:shadow-lg transition-all duration-300 hover:scale-105">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add New Client
              </button>
              <button className="inline-flex items-center justify-center px-6 py-4 border border-gray-300 text-base font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Generate Report
              </button>
              <button className="inline-flex items-center justify-center px-6 py-4 border border-gray-300 text-base font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Send Bulk Email
              </button>
              <button className="inline-flex items-center justify-center px-6 py-4 border border-gray-300 text-base font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CADashboard;