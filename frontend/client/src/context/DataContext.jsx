import React, { createContext, useContext, useState, useEffect } from 'react';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const [taxFilings, setTaxFilings] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [userPreferences, setUserPreferences] = useState({});
  const [caClients, setCaClients] = useState([]);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedFilings = localStorage.getItem('taxFilings');
    const savedDocuments = localStorage.getItem('documents');
    const savedNotifications = localStorage.getItem('notifications');
    const savedPreferences = localStorage.getItem('userPreferences');
    const savedCaClients = localStorage.getItem('caClients');

    if (savedFilings) setTaxFilings(JSON.parse(savedFilings));
    if (savedDocuments) setDocuments(JSON.parse(savedDocuments));
    if (savedNotifications) setNotifications(JSON.parse(savedNotifications));
    if (savedPreferences) setUserPreferences(JSON.parse(savedPreferences));
    if (savedCaClients) setCaClients(JSON.parse(savedCaClients));
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('taxFilings', JSON.stringify(taxFilings));
  }, [taxFilings]);

  useEffect(() => {
    localStorage.setItem('documents', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('userPreferences', JSON.stringify(userPreferences));
  }, [userPreferences]);

  useEffect(() => {
    localStorage.setItem('caClients', JSON.stringify(caClients));
  }, [caClients]);

  // Tax Filing Functions
  const addTaxFiling = (filingData) => {
    const newFiling = {
      id: Date.now(),
      ...filingData,
      createdAt: new Date().toISOString(),
      status: 'draft',
      caReview: {
        comments: [],
        status: 'pending'
      }
    };
    setTaxFilings(prev => [newFiling, ...prev]);
    return newFiling;
  };

  const updateFilingStatus = (filingId, status) => {
    setTaxFilings(prev => 
      prev.map(filing => 
        filing.id === filingId ? { ...filing, status } : filing
      )
    );
  };

  const addCAComment = (filingId, comment) => {
    setTaxFilings(prev =>
      prev.map(filing =>
        filing.id === filingId
          ? {
              ...filing,
              caReview: {
                ...filing.caReview,
                comments: [...filing.caReview.comments, comment],
                status: 'action_required'
              }
            }
          : filing
      )
    );

    // Add notification
    addNotification({
      type: 'ca_comment',
      message: `CA has added a comment to your filing`,
      filingId: filingId,
      read: false
    });
  };

  // Document Functions
  const addDocument = (documentData) => {
    const newDoc = {
      id: Date.now(),
      ...documentData,
      uploadedAt: new Date().toISOString()
    };
    setDocuments(prev => [newDoc, ...prev]);
    return newDoc;
  };

  const deleteDocument = (docId) => {
    setDocuments(prev => prev.filter(doc => doc.id !== docId));
  };

  const getDocument = (docId) => {
    return documents.find(doc => doc.id === docId);
  };

  // Notification Functions
  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      ...notification,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [newNotification, ...prev]);
    return newNotification;
  };

  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  // CA Client Management
  const addCAClient = (clientData) => {
    const newClient = {
      id: Date.now(),
      ...clientData,
      assignedAt: new Date().toISOString(),
      status: 'active'
    };
    setCaClients(prev => [newClient, ...prev]);
    return newClient;
  };

  const updateCAClientStatus = (clientId, status) => {
    setCaClients(prev =>
      prev.map(client =>
        client.id === clientId ? { ...client, status } : client
      )
    );
  };

  const value = {
    // Tax Filings
    taxFilings,
    addTaxFiling,
    updateFilingStatus,
    addCAComment,
    
    // Documents
    documents,
    addDocument,
    deleteDocument,
    getDocument,
    
    // Notifications
    notifications,
    addNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    
    // User Preferences
    userPreferences,
    setUserPreferences,

    // CA Clients
    caClients,
    addCAClient,
    updateCAClientStatus
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};