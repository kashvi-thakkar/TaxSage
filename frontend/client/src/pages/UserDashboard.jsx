import React, { useContext, useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AuthContext from '../context/AuthContext.jsx';
import { useData } from '../context/DataContext.jsx';
import { taxAPI } from '../services/apiService.js'; 

const UserDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const { taxFilings, documents, setTaxFilings, addTaxFiling } = useData(); 
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [filingStatus, setFilingStatus] = useState(null);
  const [loadingFilings, setLoadingFilings] = useState(true);

  // Function to load/reload filings
  const loadFilings = async () => {
    setLoadingFilings(true);
    try {
      const response = await taxAPI.getMyFilings();
      setTaxFilings(response.data);
    } catch (error) {
      console.error("Failed to load filings:", error);
    } finally {
      setLoadingFilings(false);
    }
  };

  useEffect(() => {
    const status = searchParams.get('status');
    if (status) {
      setFilingStatus(status);
      // We also add the acknowledgement number if it's a new filing
      const ack = searchParams.get('ack');
      if (status === 'filed' && ack) {
        setFilingStatus(`Your return has been filed! Acknowledgement #: ${ack}`);
      }
      navigate('/dashboard', { replace: true });
    }
    loadFilings();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  const actionableNotifications = useMemo(() => {
    const notifications = [];
    taxFilings.forEach(filing => {
      if (filing.status === 'action_required' && filing.caReview?.comments) {
        filing.caReview.comments.forEach(comment => {
          if (!comment.resolved) {
            notifications.push({
              id: comment._id,
              message: `CA Review: "${comment.comment}"`,
              time: new Date(comment.createdAt).toLocaleString('en-IN'),
              filingId: filing._id,
              type: 'comment',
              important: true,
              read: false, 
            });
          }
        });
      }
      if (filing.status === 'approved') {
        notifications.push({
            id: `${filing._id}-approved`,
            message: `Your filing for ${filing.assessmentYear} is approved! Ready to file.`,
            time: new Date(filing.caReview.reviewedAt).toLocaleString('en-IN'),
            filingId: filing._id,
            type: 'approval',
            important: true,
            read: false,
        })
      }
    });
    return notifications.sort((a, b) => new Date(b.time) - new Date(a.time));
  }, [taxFilings]);

  // --- NEW FUNCTION to handle the final filing ---
  const handleFileNow = async (filingId) => {
    if (!window.confirm('Are you sure you want to e-File this return? This action is final.')) {
        return;
    }
    try {
        const response = await taxAPI.fileReturn(filingId);
        // Reload all filings to show the new "Filed" status
        await loadFilings(); 
        
        // Navigate to dashboard with a success message
        const ack = response.data.filing.acknowledgementNumber;
        navigate(`/dashboard?status=filed&ack=${ack}`, { replace: true });
        
    } catch (error) {
        console.error("Failed to file return:", error);
        alert('Error filing return: ' + (error.response?.data?.message || 'Please try again.'));
    }
  };

  const handleLogout = () => { logout(); navigate('/login'); };
  const handleStartFiling = () => { navigate('/tax-filing'); };
  const handleTaxCalculator = () => { navigate('/tax-calculator'); };
  const handleDocuments = () => { navigate('/documents'); };
  const handleFindCA = () => { navigate('/find-ca'); };
  const handleHelpGuide = () => { navigate('/help-guide'); };
  const handleAnalytics = () => { navigate('/analytics'); };
  const handleViewFiling = (filingId) => {
    alert(`This will navigate to a page to view and edit Filing ID: ${filingId}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending_review': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'action_required': return 'bg-red-100 text-red-800 border-red-200';
      case 'approved': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'filed': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending_review': return 'Under CA Review';
      case 'action_required': return 'Action Required';
      case 'approved': return 'Approved - Ready to File';
      case 'filed': return 'Filed Successfully';
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Notification Item Component
  const NotificationItem = ({ notification }) => (
    <div 
        className={`p-3 rounded-lg cursor-pointer transition-colors hover:bg-gray-100 ${notification.important ? 'bg-[#FFF7DD] border border-yellow-300' : 'bg-blue-50 border border-blue-200'}`}
        onClick={() => notification.type === 'approval' ? handleFileNow(notification.filingId) : handleViewFiling(notification.filingId)}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {notification.type === 'approval' ? (
            <svg className="h-5 w-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          ) : (
            <svg className="h-5 w-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">{notification.message}</p>
          <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
          {notification.type === 'approval' && <span className="text-sm font-bold text-blue-600">Click here to file now</span>}
        </div>
        {!notification.read && (
          <span className="ml-2 flex-shrink-0">
            <span className="h-2 w-2 rounded-full bg-red-500 block"></span>
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* --- Alert --- */}
      {filingStatus && (
        <div className="bg-[#70B2B2] text-white p-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{filingStatus}</p>
              </div>
            </div>
            <button
              onClick={() => setFilingStatus(null)}
              className="text-white/80 hover:text-white transition-colors"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* --- Header --- */}
      <header className="bg-[#70B2B2] text-white shadow-lg">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
                <div className="flex items-center">
                <div className="w-10 h-10 bg-[#E5E9C5] rounded-lg flex items-center justify-center mr-3">
                    <span className="text-[#70B2B2] font-bold text-lg">TS</span>
                </div>
                <div>
                    <h1 className="text-xl font-bold">TaxSage Dashboard</h1>
                    <p className="text-[#E5E9C5] text-sm">Welcome back, {user?.firstName}</p>
                </div>
                </div>
                <div className="flex items-center space-x-4">
                <button className="relative p-1 text-[#E5E9C5] hover:text-white">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                    </svg>
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
                </button>
                <div className="h-8 w-8 rounded-full bg-[#9ECFD4] flex items-center justify-center text-white font-medium">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
                </div>
            </div>
        </div>
      </header>
      {/* --- Sub-nav --- */}
      <div className="bg-white shadow-sm border-b border-[#9ECFD4]">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-8">
                {['Overview', 'Documents', 'Filing', 'Refund', 'Support'].map((tab) => (
                <button
                    key={tab}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.toLowerCase()
                        ? 'border-[#70B2B2] text-gray-900'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-[#9ECFD4]'
                    }`}
                    onClick={() => setActiveTab(tab.toLowerCase())}
                >
                    {tab}
                </button>
                ))}
            </nav>
        </div>
      </div>

      <main className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Recent Filings Section */}
            <div className="bg-white rounded-xl shadow-sm border border-[#9ECFD4]">
              <div className="px-4 py-5 sm:px-6 border-b border-[#9ECFD4] flex justify-between items-center">
                <h3 className="text-lg font-bold leading-6 text-gray-900">My Tax Filings</h3>
                <button 
                  className="bg-[#70B2B2] text-white inline-flex items-center px-4 py-2 rounded-md text-sm font-medium hover:bg-[#5fa3a3] transition-colors"
                  onClick={handleStartFiling}
                >
                  Start New Filing
                </button>
              </div>
              <div className="px-4 py-4">
                {loadingFilings ? (
                    <div className="text-center py-8 text-gray-500">Loading your filings...</div>
                ) : taxFilings.length > 0 ? (
                  <div className="overflow-hidden border border-[#9ECFD4] rounded-lg">
                    <table className="min-w-full divide-y divide-[#9ECFD4]">
                      <thead className="bg-[#E5E9C5]">
                        <tr>
                          <th scope="col" className="py-3 pl-4 pr-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Filing</th>
                          <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ack. Number</th>
                          <th scope="col" className="relative py-3 pl-3 pr-4">
                            <span className="sr-only">Actions</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-[#9ECFD4]">
                        {taxFilings.map((filing) => (
                          <tr key={filing._id} className="hover:bg-gray-50">
                            <td className="py-3 pl-4 pr-3">
                              <div className="font-medium text-gray-900">{filing.assessmentYear}</div>
                              <div className="text-gray-500 text-sm">ITR-{filing.itrFormType || 1}</div>
                            </td>
                            <td className="px-3 py-3">
                              <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 border ${getStatusColor(filing.status)}`}>
                                {getStatusText(filing.status)}
                              </span>
                            </td>
                            <td className="px-3 py-3 text-sm text-gray-500 font-mono">
                                {filing.acknowledgementNumber || 'N/A'}
                            </td>
                            <td className="py-3 pl-3 pr-4 text-right text-sm font-medium">
                              {filing.status === 'approved' && (
                                <button 
                                  onClick={() => handleFileNow(filing._id)}
                                  className="text-blue-600 hover:text-blue-800 font-bold"
                                >
                                  File Now
                                </button>
                              )}
                              {(filing.status === 'draft' || filing.status === 'action_required') && (
                                <button 
                                  onClick={() => handleViewFiling(filing._id)}
                                  className="text-[#70B2B2] hover:text-[#5fa3a3] transition-colors"
                                >
                                  Edit
                                </button>
                              )}
                              {filing.status === 'filed' && (
                                <button 
                                  onClick={() => handleViewFiling(filing._id)}
                                  className="text-[#70B2B2] hover:text-[#5fa3a3] transition-colors"
                                >
                                  View
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="bg-[#E5E9C5] w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <span className="text-[#70B2B2] text-2xl">📄</span>
                    </div>
                    <p className="text-gray-500 font-medium">No tax filings found</p>
                    <p className="text-gray-400 text-sm mt-1">Start your first tax filing to see activity here</p>
                    <button 
                      className="mt-4 bg-[#70B2B2] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#5fa3a3] transition-colors"
                      onClick={handleStartFiling}
                    >
                      Start New Filing
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-[#9ECFD4]">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Action Center</h3>
              {actionableNotifications.length > 0 ? (
                <div className="space-y-3">
                    {actionableNotifications.map((notification) => (
                    <NotificationItem key={notification.id} notification={notification} />
                    ))}
                </div>
              ) : (
                <div className="text-center py-4">
                    <div className="text-green-500 text-4xl mb-2">✅</div>
                    <p className="text-sm text-gray-600 font-medium">All caught up!</p>
                    <p className="text-xs text-gray-500">No pending actions required from you.</p>
                </div>
              )}
            </div>

            <div className="bg-[#70B2B2] shadow-lg rounded-xl p-6 text-white">
              <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={handleAnalytics}
                  className="w-full bg-[#E5E9C5] text-[#016B61] py-2 px-4 rounded-md text-sm font-medium hover:bg-[#d4d8b5] transition-colors"
                >
                  View Tax Analytics
                </button>
                <button 
                  onClick={handleFindCA}
                  className="w-full bg-[#9ECFD4] text-[#016B61] py-2 px-4 rounded-md text-sm font-medium hover:bg-[#8fc2c7] transition-colors"
                >
                  Ask Tax Expert
                </button>
                <button 
                  onClick={handleDocuments}
                  className="w-full bg-[#9ECFD4] text-[#016B61] py-2 px-4 rounded-md text-sm font-medium hover:bg-[#8fc2c7] transition-colors"
                >
                  Manage Documents
                </button>
                <button 
                  onClick={handleTaxCalculator}
                  className="w-full bg-[#E5E9C5] text-[#016B61] py-2 px-4 rounded-md text-sm font-medium hover:bg-[#d4d8b5] transition-colors"
                >
                  Tax Calculator
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;