import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { caApi } from '../services/apiService.js'; 

const CAReview = () => {
  const navigate = useNavigate();
  const { filingId } = useParams();
  
  const [activeSection, setActiveSection] = useState('personalInfo');
  const [comments, setComments] = useState([]); 
  const [newComment, setNewComment] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  
  const [filingData, setFilingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchFiling = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await caApi.getFilingForReview(filingId);
        setFilingData(response.data);
        setComments(response.data.caReview.comments || []); 
      } catch (err) {
        console.error("Error fetching filing data:", err);
        setError(err.response?.data?.message || 'Failed to load filing data.');
      } finally {
        setLoading(false);
      }
    };

    fetchFiling();
  }, [filingId]);

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedSection) return;

    setIsSubmitting(true);
    try {
      const commentData = {
        section: selectedSection,
        comment: newComment,
      };

      const response = await caApi.addComment(filingId, commentData);
      
      // Add the new comment from the server to our state
      setComments([...comments, response.data]);
      
      // Also update the filing status locally
      setFilingData(prev => ({ ...prev, status: 'action_required' }));
      
      setNewComment('');
      setSelectedSection('');
      
    } catch (err) {
        console.error("Error adding comment:", err);
        alert('Failed to add comment: ' + (err.response?.data?.message || 'Please try again.'));
    } finally {
        setIsSubmitting(false);
    }
  };

  // --- NEW FUNCTION LOGIC ---
  const handleResolveComment = async (commentId) => {
    try {
        // Call the new API endpoint
        await caApi.resolveComment(filingId, commentId);

        // Update the comment state locally
        setComments(comments.map(comment => 
            comment._id === commentId ? { ...comment, resolved: true } : comment
        ));
    } catch (err) {
        console.error("Error resolving comment:", err);
        alert('Failed to resolve comment: ' + (err.response?.data?.message || 'Please try again.'));
    }
  };

  // --- NEW FUNCTION LOGIC ---
  const handleApproveFiling = async () => {
    if (comments.some(c => !c.resolved)) {
        alert('You must resolve all comments before approving.');
        return;
    }

    try {
        // Call the new API endpoint
        const response = await caApi.approveFiling(filingId);

        // Update the filing status locally
        setFilingData(prev => ({ ...prev, status: response.data.filing.status }));

        alert('Filing approved successfully!');
        navigate('/ca/dashboard');
        
    } catch (err) {
        console.error("Error approving filing:", err);
        alert('Failed to approve filing: ' + (err.response?.data?.message || 'Please try again.'));
    }
  };

  const handleRequestChanges = () => {
    // This just notifies the user, which adding a comment already does.
    alert('Changes requested. The user will be notified.');
    navigate('/ca/dashboard');
  };

  const sections = [
    { id: 'personalInfo', title: 'Personal Information', icon: '👤' },
    { id: 'income', title: 'Income Details', icon: '💰' },
    { id: 'deductions', title: 'Deductions', icon: '📉' },
    { id: 'documents', title: 'Documents', icon: '📄' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF7DD] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#80A1BA] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading filing for review...</p>
        </div>
      </div>
    );
  }

  if (error || !filingData) {
    return (
      <div className="min-h-screen bg-[#FFF7DD] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Filing</h2>
          <p className="text-gray-600 mb-6">{error || 'The filing data could not be found.'}</p>
          <button 
            onClick={() => navigate('/ca/dashboard')}
            className="bg-[#80A1BA] text-white py-2 px-6 rounded-lg font-medium hover:bg-[#6d8da4] transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Calculate pending comments for button logic
  const pendingCommentsCount = comments.filter(c => !c.resolved).length;

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
                <h1 className="text-2xl font-bold text-gray-900">Review Tax Filing</h1>
                <p className="text-sm text-gray-500">Client: {filingData.user.firstName} {filingData.user.lastName} • PAN: {filingData.user.pan}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRequestChanges}
                disabled={pendingCommentsCount === 0}
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title={pendingCommentsCount === 0 ? "Add a comment first" : "Notify user of changes"}
              >
                Request Changes
              </button>
              <button
                onClick={handleApproveFiling}
                disabled={pendingCommentsCount > 0 || filingData.status === 'approved'}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-green-500 to-green-600 hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                title={pendingCommentsCount > 0 ? "Resolve all comments to approve" : "Approve this filing"}
              >
                {filingData.status === 'approved' ? 'Approved' : 'Approve Filing'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Filing Sections</h3>
                <nav className="space-y-2">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 group ${
                        activeSection === section.id
                          ? 'bg-gradient-to-r from-[#80A1BA] to-[#91C4C3] text-white shadow-lg'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <span className="mr-3 text-lg">{section.icon}</span>
                      {section.title}
                      {comments.filter(c => c.section === section.id && !c.resolved).length > 0 && (
                        <span className={`ml-auto text-xs px-2 py-1 rounded-full ${
                          activeSection === section.id 
                            ? 'bg-white text-[#80A1BA]' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {comments.filter(c => c.section === section.id && !c.resolved).length}
                        </span>
                      )}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Comments Summary */}
              <div className="border-t border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Comments</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Pending Comments</span>
                    <span className="font-bold text-red-600">
                      {pendingCommentsCount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Resolved Comments</span>
                    <span className="font-bold text-green-600">
                      {comments.filter(c => c.resolved).length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Add Comment */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Add Comment</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Section
                    </label>
                    <select
                      value={selectedSection}
                      onChange={(e) => setSelectedSection(e.target.value)}
                      className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#80A1BA] focus:border-[#80A1BA] bg-gray-50 transition-colors"
                    >
                      <option value="">Choose a section</option>
                      {sections.map(section => (
                        <option key={section.id} value={section.id}>
                          {section.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Comment
                    </label>
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows="3"
                      className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#80A1BA] focus:border-[#80A1BA] bg-gray-50 transition-colors"
                      placeholder="Add your comment here..."
                    />
                  </div>
                  <button
                    onClick={handleAddComment}
                    disabled={!selectedSection || !newComment.trim() || isSubmitting}
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-[#80A1BA] to-[#91C4C3] hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                        <div className="flex items-center">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Adding...
                        </div>
                    ) : (
                        'Add Comment'
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Active Section Content */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  {sections.find(s => s.id === activeSection)?.title}
                </h3>
                
                {activeSection === 'personalInfo' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <label className="block text-sm font-medium text-gray-700">First Name</label>
                        <p className="mt-1 text-lg font-semibold text-gray-900">{filingData.personalInfo.firstName}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <label className="block text-sm font-medium text-gray-700">Last Name</label>
                        <p className="mt-1 text-lg font-semibold text-gray-900">{filingData.personalInfo.lastName}</p>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                      <p className="mt-1 text-lg font-semibold text-gray-900">
                        {new Date(filingData.personalInfo.dateOfBirth).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <label className="block text-sm font-medium text-gray-700">Address</label>
                      <p className="mt-1 text-lg font-semibold text-gray-900">
                        {filingData.personalInfo.address.street}, {filingData.personalInfo.address.city}, {filingData.personalInfo.address.state} - {filingData.personalInfo.address.pincode}
                      </p>
                    </div>
                  </div>
                )}

                {activeSection === 'income' && (
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h4 className="text-lg font-bold text-gray-900 mb-4">Salary Income</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-2 rounded-lg">
                          <label className="block text-sm font-medium text-gray-700">Basic Salary</label>
                          <p className="mt-1 text-lg font-semibold text-gray-900">₹{filingData.income.salary?.basicSalary?.toLocaleString() || 0}</p>
                        </div>
                        <div className="bg-white p-2 rounded-lg">
                          <label className="block text-sm font-medium text-gray-700">Allowances</label>
                          <p className="mt-1 text-lg font-semibold text-gray-900">₹{filingData.income.salary?.allowances?.toLocaleString() || 0}</p>
                        </div>
                        <div className="bg-white p-2 rounded-lg">
                          <label className="block text-sm font-medium text-gray-700">Perquisites</label>
                          <p className="mt-1 text-lg font-semibold text-gray-900">₹{filingData.income.salary?.perquisites?.toLocaleString() || 0}</p>
                        </div>
                        <div className="bg-green-50 p-2 rounded-lg border border-green-200">
                          <label className="block text-sm font-medium text-green-700">Total Salary</label>
                          <p className="mt-1 text-lg font-bold text-green-600">₹{filingData.income.salary?.total?.toLocaleString() || 0}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h4 className="text-lg font-bold text-gray-900 mb-4">Other Income</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-2 rounded-lg">
                          <label className="block text-sm font-medium text-gray-700">Interest Income</label>
                          <p className="mt-1 text-lg font-semibold text-gray-900">₹{filingData.income.otherSources?.interest?.toLocaleString() || 0}</p>
                        </div>
                        <div className="bg-white p-2 rounded-lg">
                          <label className="block text-sm font-medium text-gray-700">Dividend Income</label>
                          <p className="mt-1 text-lg font-semibold text-gray-900">₹{filingData.income.otherSources?.dividend?.toLocaleString() || 0}</p>
                        </div>
                        <div className="bg-white p-2 rounded-lg">
                          <label className="block text-sm font-medium text-gray-700">Other Income</label>
                          <p className="mt-1 text-lg font-semibold text-gray-900">₹{filingData.income.otherSources?.other?.toLocaleString() || 0}</p>
                        </div>
                        <div className="bg-green-50 p-2 rounded-lg border border-green-200">
                          <label className="block text-sm font-medium text-green-700">Total Other Income</label>
                          <p className="mt-1 text-lg font-bold text-green-600">₹{filingData.income.otherSources?.total?.toLocaleString() || 0}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'deductions' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <label className="block text-sm font-medium text-gray-700">Section 80C</label>
                        <p className="mt-1 text-lg font-semibold text-gray-900">₹{filingData.deductions.section80C.toLocaleString()}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <label className="block text-sm font-medium text-gray-700">Section 80D</label>
                        <p className="mt-1 text-lg font-semibold text-gray-900">₹{filingData.deductions.section80D.toLocaleString()}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <label className="block text-sm font-medium text-gray-700">Section 80G</label>
                        <p className="mt-1 text-lg font-semibold text-gray-900">₹{filingData.deductions.section80G.toLocaleString()}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <label className="block text-sm font-medium text-gray-700">Section 24</label>
                        <p className="mt-1 text-lg font-semibold text-gray-900">₹{filingData.deductions.section24.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                      <label className="block text-sm font-medium text-green-700">Total Deductions</label>
                      <p className="mt-1 text-2xl font-bold text-green-600">₹{filingData.deductions.total.toLocaleString()}</p>
                    </div>
                  </div>
                )}

                {activeSection === 'documents' && (
                  <div className="space-y-4">
                    {filingData.documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-[#80A1BA] to-[#91C4C3] rounded-xl flex items-center justify-center">
                            <span className="text-white font-medium text-sm">PDF</span>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{doc.name}</p>
                            <p className="text-sm text-gray-500 capitalize">{doc.type}</p>
                            <p className="text-xs text-gray-400">Uploaded: {new Date(doc.uploadedAt).toLocaleDateString('en-IN')}</p>
                          </div>
                        </div>
                        <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                          View
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Section Comments */}
            {comments.filter(c => c.section === activeSection).length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Comments for {sections.find(s => s.id === activeSection)?.title}
                  </h3>
                  <div className="space-y-4">
                    {comments
                      .filter(c => c.section === activeSection)
                      .map(comment => (
                        <div key={comment._id} className={`p-4 border rounded-xl ${
                          comment.resolved ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'
                        }`}>
                          <div className="flex items-start justify-between">
                            <p className="text-sm text-gray-900">{comment.comment}</p>
                            <div className="flex items-center space-x-3">
                              <span className="text-xs text-gray-500">
                                {new Date(comment.createdAt).toLocaleDateString('en-IN')}
                              </span>
                              {!comment.resolved && (
                                <button
                                  onClick={() => handleResolveComment(comment._id)}
                                  className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 transition-colors"
                                >
                                  Resolve
                                </button>
                              )}
                            </div>
                          </div>
                          {comment.resolved && (
                            <div className="mt-2 flex items-center text-xs text-green-600">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Resolved
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CAReview;